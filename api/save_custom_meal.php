<?php
require_once __DIR__ . '/config.php';

// Allow CORS during dev
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

$input = json_input();
$mealName    = trim($input['mealName'] ?? '');
$notes       = trim($input['notes'] ?? '');
$servings    = (int)($input['servings'] ?? 1);
$ingredients = $input['ingredients'] ?? [];
$userID      = $input['userID'] ?? 'U2'; // fallback user

if ($mealName === '' || empty($ingredients)) {
    respond(['success' => false, 'message' => 'Meal name and ingredients are required.'], 400);
}

// DEBUG LOG
$debugLog = [];

try {
    $pdo->beginTransaction();

    // 1️⃣ Insert into recipes
    $stmt = $pdo->prepare("
        INSERT INTO recipes (recipeName, instruction, serving, isGeneric)
        VALUES (:name, :instruction, :serving, 0)
    ");
    $stmt->execute([
        ':name' => $mealName,
        ':instruction' => $notes,
        ':serving' => $servings
    ]);
    $recipeID = $pdo->lastInsertId();
    if (!$recipeID) {
        $stmt = $pdo->query("SELECT recipeID FROM recipes ORDER BY recipeID DESC LIMIT 1");
        $recipeID = $stmt->fetchColumn();
    }

    // 2️⃣ Loop through ingredients
    foreach ($ingredients as $item) {
        $foodID   = !empty($item['foodID']) ? strtoupper(trim($item['foodID'])) : null;
        $foodName = trim($item['name'] ?? '');
        $qty      = (float)($item['qty'] ?? 0);
        $unitName = trim($item['unit'] ?? '');
        
        $debugLog[] = "Processing: $foodName (foodID: $foodID)";
        
        if ($qty <= 0 || $foodName === '') continue;

        // 🔍 Check if ingredient already exists
        $stmt = $pdo->prepare("SELECT ingredientID, categoryID FROM ingredients WHERE TRIM(UPPER(ingredientName)) = :name LIMIT 1");
        $stmt->execute([':name' => strtoupper(trim($foodName))]);
        $existingIngredient = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingIngredient) {
            $ingredientID = $existingIngredient['ingredientID'];
            $debugLog[] = "  → Ingredient exists: ID=$ingredientID, Category={$existingIngredient['categoryID']}";
        } else {
            // 🧩 Create new ingredient - FORCE C7 as absolute default
            $categoryID = 'C7';
            $debugLog[] = "  → New ingredient, starting with categoryID='C7'";

            // ✅ Strategy 1: Lookup by foodID
            if ($foodID !== null) {
                $debugLog[] = "  → Trying lookup by foodID: $foodID";
                $stmtCat = $pdo->prepare("
                    SELECT categoryID, foodID, foodName
                    FROM foods 
                    WHERE TRIM(UPPER(foodID)) = :foodID
                    LIMIT 1
                ");
                $stmtCat->execute([':foodID' => $foodID]);
                $catResult = $stmtCat->fetch(PDO::FETCH_ASSOC);
                
                if ($catResult) {
                    $debugLog[] = "  → Found food: {$catResult['foodName']} (Category: {$catResult['categoryID']})";
                    if (!empty($catResult['categoryID'])) {
                        $categoryID = $catResult['categoryID'];
                        $debugLog[] = "  → Updated categoryID to: $categoryID";
                    } else {
                        $debugLog[] = "  → WARNING: Food found but categoryID is empty!";
                    }
                } else {
                    $debugLog[] = "  → No food found with foodID: $foodID";
                }
            }

            // ✅ Strategy 2: Fallback to lookup by food name
            if ($categoryID === 'C7') {
                $debugLog[] = "  → Trying fallback lookup by foodName: $foodName";
                $stmtCat2 = $pdo->prepare("
                    SELECT categoryID, foodID, foodName
                    FROM foods 
                    WHERE TRIM(UPPER(foodName)) = :foodName
                    LIMIT 1
                ");
                $stmtCat2->execute([':foodName' => strtoupper(trim($foodName))]);
                $catResult2 = $stmtCat2->fetch(PDO::FETCH_ASSOC);
                
                if ($catResult2) {
                    $debugLog[] = "  → Found food: {$catResult2['foodName']} (Category: {$catResult2['categoryID']})";
                    if (!empty($catResult2['categoryID'])) {
                        $categoryID = $catResult2['categoryID'];
                        $debugLog[] = "  → Updated categoryID to: $categoryID";
                    } else {
                        $debugLog[] = "  → WARNING: Food found but categoryID is empty!";
                    }
                } else {
                    $debugLog[] = "  → No food found with foodName: $foodName";
                }
            }

            // ✅ FINAL CHECK - Absolutely guarantee no null/empty
            if (empty($categoryID) || $categoryID === null) {
                $categoryID = 'C7';
                $debugLog[] = "  → FORCED categoryID back to C7 (was empty/null)";
            }

            $debugLog[] = "  → FINAL categoryID before insert: '$categoryID'";

            // ✅ Insert ingredient - use COALESCE in query as extra safety
            $stmtInsert = $pdo->prepare("
                INSERT INTO ingredients (ingredientName, categoryID)
                VALUES (:name, COALESCE(:categoryID, 'C7'))
            ");
            $result = $stmtInsert->execute([
                ':name' => trim($foodName),
                ':categoryID' => $categoryID
            ]);
            
            $debugLog[] = "  → Insert result: " . ($result ? 'SUCCESS' : 'FAILED');

            // ✅ FIX: Get the new ingredientID using a more reliable method
            $stmtNew = $pdo->prepare("
                SELECT ingredientID 
                FROM ingredients 
                WHERE TRIM(UPPER(ingredientName)) = :name 
                ORDER BY ingredientID DESC 
                LIMIT 1
            ");
            $stmtNew->execute([':name' => strtoupper(trim($foodName))]);
            $ingredientID = $stmtNew->fetchColumn();

            if (!$ingredientID) {
                throw new Exception("Failed to retrieve newly created ingredient ID for: " . $foodName);
            }
            
            // VERIFY what was actually inserted
            $verify = $pdo->prepare("SELECT ingredientID, ingredientName, categoryID FROM ingredients WHERE ingredientID = :id");
            $verify->execute([':id' => $ingredientID]);
            $verifyResult = $verify->fetch(PDO::FETCH_ASSOC);
            $debugLog[] = "  → VERIFIED in DB: " . json_encode($verifyResult);
        }

        // 🔍 Get or create unitID
        $unitID = null;
        if ($unitName !== '') {
            $stmt = $pdo->prepare("SELECT unitID FROM units WHERE TRIM(UPPER(unitName)) = :unit LIMIT 1");
            $stmt->execute([':unit' => strtoupper(trim($unitName))]);
            $unitID = $stmt->fetchColumn();

            if (!$unitID) {
                $stmt = $pdo->prepare("INSERT INTO units (unitName) VALUES (:unit)");
                $stmt->execute([':unit' => $unitName]);
                $unitID = $pdo->lastInsertId();
                if (!$unitID) {
                    $stmt2 = $pdo->query("SELECT unitID FROM units ORDER BY unitID DESC LIMIT 1");
                    $unitID = $stmt2->fetchColumn();
                }
            }
        } else {
            // Default to "Other" unit when no unit is provided
            $unitID = 'UN8'; 
        }

        // 3️⃣ Insert into recipe_ingredients
        $stmt = $pdo->prepare("
            INSERT INTO recipe_ingredients (recipeID, ingredientID, quantityNeeded, unitID)
            VALUES (:recipeID, :ingredientID, :qty, :unitID)
        ");
        $stmt->execute([
            ':recipeID' => $recipeID,
            ':ingredientID' => $ingredientID,
            ':qty' => $qty,
            ':unitID' => $unitID
        ]);

        // 4️⃣ Update food inventory
        if ($foodID !== null) {
            $stmt = $pdo->prepare("
                UPDATE foods
                SET quantity = quantity - :qty,
                    reservedQty = reservedQty + :qty
                WHERE TRIM(UPPER(foodID)) = :foodID AND userID = :userID
            ");
            $stmt->execute([
                ':qty' => $qty,
                ':foodID' => $foodID,
                ':userID' => $userID
            ]);
        }
    }

    $pdo->commit();
    respond([
        'success' => true, 
        'message' => 'Custom meal saved successfully!', 
        'recipeID' => $recipeID,
        'debug' => $debugLog  // TEMPORARY - remove this in production
    ]);

} catch (Throwable $e) {
    $pdo->rollBack();
    respond([
        'success' => false, 
        'message' => $e->getMessage(),
        'debug' => $debugLog
    ]);
}
?>