<?php
class MealPlanningService {
    private $pdo;
    
    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }
    
    /**
     * Reserve ingredients for a recipe
     * @param int $recipeID
     * @param int $mealEntryID
     * @param string $userID
     * @return array
     */
    public function reserveIngredientsForRecipe($recipeID, $mealEntryID, $userID) {
        try {
            // Get recipe ingredients
            $stmt = $this->pdo->prepare("
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
                $foodStmt = $this->pdo->prepare("
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
    public function assignRecipeToMealPlan($mealEntryID, $recipeID, $userID) {
        try {
            // Update meal entry with recipe ID
            $stmt = $this->pdo->prepare("
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
}
?>