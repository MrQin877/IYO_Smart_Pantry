<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once __DIR__ . '/config.php';
global $pdo;

// Get userID from request or session
$userID = $_GET['userID'] ?? $_SESSION['user']['id'] ?? $_SESSION['userID'] ?? null;
if (!$userID) {
  respond(['success' => false, 'message' => 'Missing userID (not logged in)'], 401);
}

try {
  // Query foods with unit name
  $sql = "
    SELECT 
      f.foodID AS id,
      f.foodName AS name,
      f.quantity AS qty,
      f.reservedQty,
      f.usedQty,
      (f.quantity - f.reservedQty - f.usedQty) AS availableQty,
      f.expiryDate,
      u.unitName AS unit,
      f.remark
    FROM foods f
    LEFT JOIN units u ON f.unitID = u.unitID
    WHERE f.userID = ?
    ORDER BY f.foodName
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$userID]);
  $data = $stmt->fetchAll();

  // Return success with data
  respond(['success' => true, 'data' => $data]);
} catch (Throwable $e) {
  respond(['success' => false, 'message' => $e->getMessage()]);
}
