<?php
// ✅ CORS FIX — REQUIRED FOR VITE
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// ✅ Handle preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

$data = json_input();
$recipeID = $data["recipeID"] ?? "";

if (!$recipeID) {
    respond(["ok" => false, "error" => "Missing recipeID"], 400);
}

try {
    // ✅ Fetch recipe
    $stmt = $pdo->prepare("
        SELECT recipeID, recipeName, instruction, serving, isGeneric
        FROM recipes
        WHERE recipeID = ?
    ");
    $stmt->execute([$recipeID]);
    $recipe = $stmt->fetch();

    if (!$recipe) {
        respond(["ok" => false, "error" => "Recipe not found"], 404);
    }

    // ✅ Fetch ingredients
    $stmt2 = $pdo->prepare("
        SELECT 
            i.ingredientName,
            CONCAT(ri.quantityNeeded, ' ', u.unitName) AS ingredientQty
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredientID = i.ingredientID
        JOIN units u ON ri.unitID = u.unitID
        WHERE ri.recipeID = ?
    ");
    $stmt2->execute([$recipeID]);
    $ingredients = $stmt2->fetchAll();

    $recipe["ingredients"] = $ingredients;

    respond(["ok" => true, "recipe" => $recipe]);

} catch (Throwable $e) {
    respond(["ok" => false, "error" => $e->getMessage()], 500);
}
