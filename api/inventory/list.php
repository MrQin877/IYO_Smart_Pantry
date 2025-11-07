<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php';

$in = json_decode(file_get_contents("php://input"), true);
if (!is_array($in)) $in = $_POST;

$userID = $in['userID'] ?? null;
if (!$userID) {
  echo json_encode(["ok" => false, "error" => "Missing userID"]);
  exit;
}

try {
    $sql = "SELECT 
            f.foodID, 
            f.foodName, 
            f.quantity, 
            u.unitName AS unit, 
            f.expiryDate,
            f.is_plan
            FROM foods f
            LEFT JOIN units u ON f.unitID = u.unitID
            WHERE f.userID = ?
            ORDER BY 
            f.is_plan DESC,       -- ✅ planned first
            f.expiryDate ASC";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$userID]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(["ok" => true, "inventory" => $rows]);

} catch (Throwable $e) {
  echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
