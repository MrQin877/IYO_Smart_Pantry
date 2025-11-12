<?php
class MealActionService {
    private $pdo;
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }
    
    /**
     * Mark a meal as done - move reserved quantities to used
     * @param string $mealEntryID
     * @param string $userID
     * @return array
     */
    public function markMealAsDone($mealEntryID, $userID) {
        try {
            $this->pdo->beginTransaction();
            
            // Get the meal entry details
            $mealStmt = $this->pdo->prepare("
                SELECT me.mealEntryID, me.recipeID, mpc.userID
                FROM meal_entries me
                JOIN meal_plan_calendars mpc ON me.mealPlanID = mpc.mealPlanID
                WHERE me.mealEntryID = ? AND mpc.userID = ?
            ");
            $mealStmt->execute([$mealEntryID, $userID]);
            $meal = $mealStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$meal) {
                $this->pdo->rollBack();
                return ['ok' => false, 'error' => 'Meal not found or access denied'];
            }
            
            // If there's no recipe ID, just mark as done without updating quantities
            if (!$meal['recipeID']) {
                // Update meal status to completed
                $updateStatusStmt = $this->pdo->prepare("
                    UPDATE meal_entries 
                    SET status = 'completed'
                    WHERE mealEntryID = ?
                ");
                $updateStatusStmt->execute([$mealEntryID]);
                
                $this->pdo->commit();
                return ['ok' => true, 'message' => 'Meal marked as done (no recipe to track)'];
            }
            
            // Get recipe ingredients
            $ingredientsStmt = $this->pdo->prepare("
                SELECT ri.ingredientID, ri.quantityNeeded, ri.unitID, i.ingredientName
                FROM recipe_ingredients ri
                JOIN ingredients i ON ri.ingredientID = i.ingredientID
                WHERE ri.recipeID = ?
            ");
            $ingredientsStmt->execute([$meal['recipeID']]);
            $ingredients = $ingredientsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($ingredients as $ingredient) {
                // Find matching food item
                $foodStmt = $this->pdo->prepare("
                    SELECT foodID, quantity, reservedQty, usedQty
                    FROM foods
                    WHERE userID = ? AND foodName = ?
                ");
                $foodStmt->execute([$userID, $ingredient['ingredientName']]);
                $food = $foodStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($food) {
                    // Move from reserved to used
                    // IMPORTANT: Do NOT change quantity here as it was already deducted when reserved
                    $updateStmt = $this->pdo->prepare("
                        UPDATE foods 
                        SET reservedQty = GREATEST(0, reservedQty - ?),
                            usedQty = usedQty + ?
                        WHERE foodID = ?
                    ");
                    $updateStmt->execute([
                        $ingredient['quantityNeeded'], 
                        $ingredient['quantityNeeded'], 
                        $food['foodID']
                    ]);
                    
                    // Debug logging
                    error_log("Mark as Done - Food: {$ingredient['ingredientName']}, " .
                              "Reserved: -{$ingredient['quantityNeeded']}, " .
                              "Used: +{$ingredient['quantityNeeded']}, " .
                              "FoodID: {$food['foodID']}");
                }
            }
            
            // Update meal status to completed
            $updateStatusStmt = $this->pdo->prepare("
                UPDATE meal_entries 
                SET status = 'completed'
                WHERE mealEntryID = ?
            ");
            $updateStatusStmt->execute([$mealEntryID]);
            
            $this->pdo->commit();
            
            return ['ok' => true, 'message' => 'Meal marked as done'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Replan a meal - move reserved quantities back and reserve new ones
     * @param string $mealEntryID
     * @param string $newRecipeID
     * @param string $userID
     * @return array
     */
    public function replanMeal($mealEntryID, $newRecipeID, $userID) {
        try {
            $this->pdo->beginTransaction();
            
            // Get the meal entry details
            $mealStmt = $this->pdo->prepare("
                SELECT me.mealEntryID, me.recipeID as oldRecipeID, mpc.userID
                FROM meal_entries me
                JOIN meal_plan_calendars mpc ON me.mealPlanID = mpc.mealPlanID
                WHERE me.mealEntryID = ? AND mpc.userID = ?
            ");
            $mealStmt->execute([$mealEntryID, $userID]);
            $meal = $mealStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$meal) {
                $this->pdo->rollBack();
                return ['ok' => false, 'error' => 'Meal not found or access denied'];
            }
            
            // If there was an old recipe, return its ingredients
            if ($meal['oldRecipeID']) {
                $oldIngredientsStmt = $this->pdo->prepare("
                    SELECT ri.ingredientID, ri.quantityNeeded, ri.unitID, i.ingredientName
                    FROM recipe_ingredients ri
                    JOIN ingredients i ON ri.ingredientID = i.ingredientID
                    WHERE ri.recipeID = ?
                ");
                $oldIngredientsStmt->execute([$meal['oldRecipeID']]);
                $oldIngredients = $oldIngredientsStmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($oldIngredients as $ingredient) {
                    // Find matching food item
                    $foodStmt = $this->pdo->prepare("
                        SELECT foodID, quantity, reservedQty, usedQty
                        FROM foods
                        WHERE userID = ? AND foodName = ?
                    ");
                    $foodStmt->execute([$userID, $ingredient['ingredientName']]);
                    $food = $foodStmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($food) {
                        // Return from reserved to available (increase quantity)
                        $updateStmt = $this->pdo->prepare("
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
            $newIngredientsStmt = $this->pdo->prepare("
                SELECT ri.ingredientID, ri.quantityNeeded, ri.unitID, i.ingredientName
                FROM recipe_ingredients ri
                JOIN ingredients i ON ri.ingredientID = i.ingredientID
                WHERE ri.recipeID = ?
            ");
            $newIngredientsStmt->execute([$newRecipeID]);
            $newIngredients = $newIngredientsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $insufficientIngredients = [];
            
            foreach ($newIngredients as $ingredient) {
                // Find matching food item
                $foodStmt = $this->pdo->prepare("
                    SELECT foodID, quantity, reservedQty, usedQty
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
                        'foodName' => $ingredient['ingredientName'],
                        'required' => $ingredient['quantityNeeded'],
                        'available' => $food['quantity']
                    ];
                    continue;
                }
                
                // Reserve the quantity (decrease available quantity, increase reserved)
                $updateStmt = $this->pdo->prepare("
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
            }
            
            if (!empty($insufficientIngredients)) {
                $this->pdo->rollBack();
                return [
                    'ok' => false,
                    'error' => 'Insufficient ingredients for new recipe',
                    'insufficient' => $insufficientIngredients
                ];
            }
            
            // Update the meal entry with the new recipe
                // Update the meal entry with the new recipe AND set mealName to the new recipe's name
                // Use a subquery to fetch the recipeName from recipes table to keep meal entries in sync
                $updateMealStmt = $this->pdo->prepare("
                    UPDATE meal_entries 
                    SET recipeID = ?,
                        mealName = (
                            SELECT recipeName FROM recipes WHERE recipeID = ? LIMIT 1
                        )
                    WHERE mealEntryID = ?
                ");
                $updateMealStmt->execute([$newRecipeID, $newRecipeID, $mealEntryID]);
            
            $this->pdo->commit();
            
            return ['ok' => true, 'message' => 'Meal replanned successfully'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Delete a meal entry and return reserved ingredients to inventory
     * @param string $mealEntryID
     * @param string $userID
     * @return array
     */
    public function deleteMeal($mealEntryID, $userID) {
        try {
            $this->pdo->beginTransaction();

            // Verify meal exists and belongs to user
            $mealStmt = $this->pdo->prepare("SELECT me.mealEntryID, me.recipeID FROM meal_entries me JOIN meal_plan_calendars mpc ON me.mealPlanID = mpc.mealPlanID WHERE me.mealEntryID = ? AND mpc.userID = ?");
            $mealStmt->execute([$mealEntryID, $userID]);
            $meal = $mealStmt->fetch(PDO::FETCH_ASSOC);

            if (!$meal) {
                $this->pdo->rollBack();
                return ['ok' => false, 'error' => 'Meal not found or access denied'];
            }

            // If there's a recipe, return reserved ingredients to available quantity
            if ($meal['recipeID']) {
                $ingredientsStmt = $this->pdo->prepare("SELECT ri.ingredientID, ri.quantityNeeded, ri.unitID, i.ingredientName FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredientID = i.ingredientID WHERE ri.recipeID = ?");
                $ingredientsStmt->execute([$meal['recipeID']]);
                $ingredients = $ingredientsStmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($ingredients as $ingredient) {
                    $foodStmt = $this->pdo->prepare("SELECT foodID, quantity, reservedQty, usedQty FROM foods WHERE userID = ? AND foodName = ?");
                    $foodStmt->execute([$userID, $ingredient['ingredientName']]);
                    $food = $foodStmt->fetch(PDO::FETCH_ASSOC);

                    if ($food) {
                        // Return reserved quantity back to available quantity
                        $updateStmt = $this->pdo->prepare("UPDATE foods SET quantity = quantity + ?, reservedQty = GREATEST(0, reservedQty - ?) WHERE foodID = ?");
                        $updateStmt->execute([
                            $ingredient['quantityNeeded'],
                            $ingredient['quantityNeeded'],
                            $food['foodID']
                        ]);
                    }
                }
            }

            // Delete the meal entry
            $delStmt = $this->pdo->prepare("DELETE FROM meal_entries WHERE mealEntryID = ?");
            $delStmt->execute([$mealEntryID]);

            $this->pdo->commit();
            return ['ok' => true, 'message' => 'Meal deleted successfully'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
}
?>