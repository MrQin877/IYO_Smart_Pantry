<?php
// save.php
// CORS for dev (vite). Adjust origin for production.
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../services/MealPlanningService.php';

 $in = json_input();

// Required fields: recipeID (opt), mealDate (YYYY-MM-DD), mealTypeID, mealName (opt), userID
 $recipeID   = $in['recipeID']   ?? null;
 $mealDate   = $in['mealDate']   ?? null;
 $mealTypeID = $in['mealTypeID'] ?? null;
 $mealName   = $in['mealName']   ?? null;
 // Prefer session user ID, then payload
 $userID     = $_SESSION['user']['id'] ?? $_SESSION['userID'] ?? $in['userID'] ?? null;

if (!$userID) respond(['ok' => false, 'error' => 'Missing userID (not logged in)'], 401);

error_log("SAVE: userID=$userID, mealDate=$mealDate, mealTypeID=$mealTypeID, recipeID=$recipeID");

if (!$mealDate || !$mealTypeID || !$userID) {
  respond(['ok' => false, 'error' => 'Missing mealDate / mealTypeID / userID'], 400);
}

// compute weekStart (Monday) from mealDate
try {
  $dt = new DateTime($mealDate);
} catch (Exception $e) {
  respond(['ok' => false, 'error' => 'Invalid mealDate'], 400);
}
 $dayOfWeek = (int)$dt->format('N'); // 1 (Mon) .. 7 (Sun)
 $daysToMon = $dayOfWeek - 1;
 $weekStart = clone $dt;
 $weekStart->modify("-{$daysToMon} days");
 $weekStartStr = $weekStart->format('Y-m-d');

error_log("SAVE: Calculated weekStart=$weekStartStr for mealDate=$mealDate (dayOfWeek=$dayOfWeek, daysToMon=$daysToMon)");

try {
  $pdo->beginTransaction();

  // 1) ensure meal_plan_calendars exists for (userID, weekStart)
  $stmt = $pdo->prepare("SELECT mealPlanID FROM meal_plan_calendars WHERE userID = ? AND weekStart = ? LIMIT 1");
  $stmt->execute([$userID, $weekStartStr]);
  $row = $stmt->fetch();

  if ($row) {
    $mealPlanID = $row['mealPlanID'];
    error_log("SAVE: Found existing mealPlanID=$mealPlanID");
  } else {
    $ins = $pdo->prepare("INSERT INTO meal_plan_calendars (weekStart, userID) VALUES (?, ?)");
    $ins->execute([$weekStartStr, $userID]);
    // read it back
    $stmt->execute([$userID, $weekStartStr]);
    $row2 = $stmt->fetch();
    if (!$row2) {
      $pdo->rollBack();
      respond(['ok' => false, 'error' => 'Failed to create meal plan calendar'], 500);
    }
    $mealPlanID = $row2['mealPlanID'];
    error_log("SAVE: Created new mealPlanID=$mealPlanID");
  }

  // 2) insert into meal_entries
  $ins2 = $pdo->prepare("INSERT INTO meal_entries (mealDate, mealName, mealPlanID, mealTypeID, recipeID) VALUES (?, ?, ?, ?, ?)");
  $ins2->execute([$mealDate, $mealName, $mealPlanID, $mealTypeID, $recipeID]);

  // return the inserted entry
  $stmt3 = $pdo->prepare("SELECT * FROM meal_entries WHERE mealPlanID = ? AND mealDate = ? AND mealTypeID = ? ORDER BY mealEntryID DESC LIMIT 1");
  $stmt3->execute([$mealPlanID, $mealDate, $mealTypeID]);
  $entry = $stmt3->fetch();

  error_log("SAVE: Inserted entry with mealEntryID=" . ($entry ? $entry['mealEntryID'] : 'NULL'));

  // NEW: Process meal planning if recipeID is provided
  if ($recipeID && $entry) {
    error_log("SAVE: Processing meal planning for recipeID=$recipeID, mealEntryID=" . $entry['mealEntryID']);
    
    try {
      // Reserve ingredients for this recipe
      $reserveResult = reserveIngredientsForRecipe($recipeID, $entry['mealEntryID'], $userID);
      
      if (!$reserveResult['ok']) {
        $pdo->rollBack();
        error_log("SAVE: Failed to reserve ingredients: " . $reserveResult['error']);
        respond([
          'ok' => false, 
          'error' => 'Failed to reserve ingredients: ' . $reserveResult['error'],
          'insufficientIngredients' => $reserveResult['insufficient'] ?? []
        ]);
      }
      
      // Assign recipe to the meal plan
      $result = assignRecipeToMealPlan($entry['mealEntryID'], $recipeID, $userID);
      
      if (!$result['ok']) {
        $pdo->rollBack();
        error_log("SAVE: Meal planning failed: " . $result['error']);
        
        respond([
          'ok' => false, 
          'error' => 'Meal saved but failed to assign recipe: ' . $result['error']
        ]);
      }
      
      error_log("SAVE: Meal planning successful");
      $pdo->commit();
      
      respond([
        'ok' => true, 
        'entry' => $entry, 
        'mealPlanID' => $mealPlanID,
        'reservedIngredients' => $reserveResult['ingredients'] ?? []
      ]);
    } catch (Exception $e) {
      $pdo->rollBack();
      error_log("SAVE: Meal planning exception: " . $e->getMessage());
      
      respond([
        'ok' => false, 
        'error' => 'Exception during meal planning: ' . $e->getMessage()
      ]);
    }
  } else {
    // No recipe ID, just commit the meal entry
    $pdo->commit();
    respond(['ok' => true, 'entry' => $entry, 'mealPlanID' => $mealPlanID]);
  }
} catch (Throwable $e) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }
  respond(['ok' => false, 'error' => $e->getMessage()], 500);
}

/**
 * Reserve ingredients for a recipe
 * @param int $recipeID
 * @param int $mealEntryID
 * @param string $userID
 * @return array
 */
function reserveIngredientsForRecipe($recipeID, $mealEntryID, $userID) {
  global $pdo;
  
  try {
    // Get recipe ingredients
    $stmt = $pdo->prepare("
      SELECT ri.ingredientID, ri.quantityNeeded, ri.unitID, i.ingredientName
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredientID = i.ingredientID
      WHERE ri.recipeID = ?
    ");
    $stmt->execute([$recipeID]);
    $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $reservedIngredients = [];
    $insufficientIngredients = [];
    
    foreach ($ingredients as $ingredient) {
      // Find matching food item
      $foodStmt = $pdo->prepare("
        SELECT foodID, foodName, quantity, reservedQty, usedQty
        FROM foods
        WHERE userID = ? AND foodName = ?
      ");
      $foodStmt->execute([$userID, $ingredient['ingredientName']]);
      $food = $foodStmt->fetch(PDO::FETCH_ASSOC);
      
      if (!$food) {
        $insufficientIngredients[] = [
          'ingredientName' => $ingredient['ingredientName'],
          'required' => $ingredient['quantityNeeded'],
          'available' => 0,
          'reason' => 'No matching food item found in inventory'
        ];
        continue;
      }
      
      // Check if we have enough quantity (quantity is the available amount)
      if ($food['quantity'] < $ingredient['quantityNeeded']) {
        $insufficientIngredients[] = [
          'foodID' => $food['foodID'],
          'foodName' => $food['foodName'],
          'required' => $ingredient['quantityNeeded'],
          'available' => $food['quantity']
        ];
        continue;
      }
      
      // Reserve the quantity (decrease available quantity, increase reserved)
      $updateStmt = $pdo->prepare("
        UPDATE foods 
        SET quantity = quantity - ?,
            reservedQty = reservedQty + ?
        WHERE foodID = ?
      ");
      $updateStmt->execute([
        $ingredient['quantityNeeded'], 
        $ingredient['quantityNeeded'], 
        $food['foodID']
      ]);
      
      $reservedIngredients[] = [
        'foodID' => $food['foodID'],
        'foodName' => $food['foodName'],
        'quantity' => $ingredient['quantityNeeded'],
        'unitID' => $ingredient['unitID']
      ];
    }
    
    if (!empty($insufficientIngredients)) {
      return [
        'ok' => false,
        'error' => 'Insufficient ingredients',
        'insufficient' => $insufficientIngredients
      ];
    }
    
    return [
      'ok' => true,
      'ingredients' => $reservedIngredients
    ];
  } catch (Exception $e) {
    return [
      'ok' => false,
      'error' => $e->getMessage()
    ];
  }
}

/**
 * Assign recipe to meal plan
 * @param int $mealEntryID
 * @param int $recipeID
 * @param string $userID
 * @return array
 */
function assignRecipeToMealPlan($mealEntryID, $recipeID, $userID) {
  global $pdo;
  
  try {
    // Update meal entry with recipe ID
    $stmt = $pdo->prepare("
      UPDATE meal_entries 
      SET recipeID = ? 
      WHERE mealEntryID = ?
    ");
    $stmt->execute([$recipeID, $mealEntryID]);
    
    return [
      'ok' => true,
      'message' => 'Recipe assigned to meal plan successfully'
    ];
  } catch (Exception $e) {
    return [
      'ok' => false,
      'error' => $e->getMessage()
    ];
  }
}
?>