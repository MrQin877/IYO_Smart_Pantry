<?php
// assign_recipe.php
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

 $data = json_decode(file_get_contents('php://input'), true);
 $mealEntryId = $data['mealEntryId'] ?? '';
 $recipeId = $data['recipeId'] ?? '';
 $userId = $data['userId'] ?? '';

if (!$mealEntryId || !$recipeId || !$userId) {
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'error' => 'Missing mealEntryId, recipeId, or userId']);
  exit;
}

try {
  $pdo->beginTransaction();
  
  // First, get the current meal entry to check if it already has a recipe
  $mealStmt = $pdo->prepare("
    SELECT me.mealEntryID, me.recipeID as currentRecipeID, mpc.userID
    FROM meal_entries me
    JOIN meal_plan_calendars mpc ON me.mealPlanID = mpc.mealPlanID
    WHERE me.mealEntryID = ? AND mpc.userID = ?
  ");
  $mealStmt->execute([$mealEntryId, $userId]);
  $meal = $mealStmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$meal) {
    $pdo->rollBack();
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Meal not found or access denied']);
    exit;
  }
  
  // If there's already a recipe assigned, we need to return its ingredients first
  if ($meal['currentRecipeID']) {
    // Get old recipe ingredients
    $oldIngredientsStmt = $pdo->prepare("
      SELECT ri.ingredientID, ri.quantityNeeded, i.ingredientName
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredientID = i.ingredientID
      WHERE ri.recipeID = ?
    ");
    $oldIngredientsStmt->execute([$meal['currentRecipeID']]);
    $oldIngredients = $oldIngredientsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return reserved quantities for old recipe (increase available quantity)
    foreach ($oldIngredients as $ingredient) {
      // Find matching food item
      $foodStmt = $pdo->prepare("
        SELECT foodID, quantity, reservedQty
        FROM foods
        WHERE userID = ? AND foodName = ?
      ");
      $foodStmt->execute([$userId, $ingredient['ingredientName']]);
      $food = $foodStmt->fetch(PDO::FETCH_ASSOC);
      
      if ($food) {
        // Update available quantity and reserved quantity
        $updateStmt = $pdo->prepare("
          UPDATE foods 
          SET quantity = quantity + ?,
              reservedQty = GREATEST(0, reservedQty - ?)
          WHERE foodID = ?
        ");
        $updateStmt->execute([
          $ingredient['quantityNeeded'], 
          $ingredient['quantityNeeded'], 
          $food['foodID']
        ]);
      }
    }
  }
  
  // Get new recipe ingredients
  $newIngredientsStmt = $pdo->prepare("
    SELECT ri.ingredientID, ri.quantityNeeded, i.ingredientName
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredientID = i.ingredientID
    WHERE ri.recipeID = ?
  ");
  $newIngredientsStmt->execute([$recipeId]);
  $newIngredients = $newIngredientsStmt->fetchAll(PDO::FETCH_ASSOC);
  
  $reservedIngredients = [];
  $insufficientIngredients = [];
  
  // Check and reserve ingredients for new recipe
  foreach ($newIngredients as $ingredient) {
    // Find matching food item
    $foodStmt = $pdo->prepare("
      SELECT foodID, quantity, reservedQty
      FROM foods
      WHERE userID = ? AND foodName = ?
    ");
    $foodStmt->execute([$userId, $ingredient['ingredientName']]);
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
        'foodName' => $ingredient['ingredientName'],
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
      'foodName' => $ingredient['foodName'],
      'quantity' => $ingredient['quantityNeeded']
    ];
  }
  
  if (!empty($insufficientIngredients)) {
    $pdo->rollBack();
    header('Content-Type: application/json');
    echo json_encode([
      'ok' => false,
      'error' => 'Insufficient ingredients for new recipe',
      'insufficient' => $insufficientIngredients
    ]);
    exit;
  }
  
  // Update the meal entry with the new recipe
  $updateMealStmt = $pdo->prepare("
    UPDATE meal_entries 
    SET recipeID = ?
    WHERE mealEntryID = ?
  ");
  $updateMealStmt->execute([$recipeId, $mealEntryId]);
  
  $pdo->commit();
  
  // Send clean JSON response
  header('Content-Type: application/json');
  echo json_encode([
    'ok' => true, 
    'message' => 'Recipe assigned to meal successfully',
    'reservedIngredients' => $reservedIngredients
  ]);
} catch (Exception $e) {
  // Roll back transaction if active
  if (isset($pdo) && $pdo->inTransaction()) {
    $pdo->rollBack();
  }
  
  // Send error response
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>