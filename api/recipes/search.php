<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// If OPTIONS request → exit directly (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config.php';

$data = json_input();
$keyword = "%" . ($data['keyword'] ?? '') . "%";

$stmt = $pdo->prepare("
  SELECT recipeID, recipeName, isGeneric
  FROM recipes
  WHERE recipeName LIKE ?
  ORDER BY recipeName ASC
");

$stmt->execute([$keyword]);

respond([
  'ok' => true,
  'results' => $stmt->fetchAll()
]);
