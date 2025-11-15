<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/../config.php';  // ✅ Uses your real DB connection ($pdo)

try {
    $sql = "
        SELECT 
            r.recipeID,
            r.recipeName,
            r.instruction,
            r.serving,
            r.isGeneric,
            r.createdBy,
            (
                SELECT GROUP_CONCAT(i.ingredientName SEPARATOR ', ')
                FROM recipe_ingredients ri
                JOIN ingredients i ON ri.ingredientID = i.ingredientID
                WHERE ri.recipeID = r.recipeID
            ) AS ingredientNames
        FROM recipes r
        ORDER BY r.recipeID;
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($recipes as &$r) {
        if (!$r["ingredientNames"]) {
            $r["ingredientNames"] = "Ingredients Loaded on Cook";
        }
    }

    respond([
        "ok" => true,
        "recipes" => $recipes
    ]);

} catch (Throwable $e) {
    respond([
        "ok" => false,
        "error" => $e->getMessage()
    ], 500);
}
