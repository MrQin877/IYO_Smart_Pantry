<?php
// api/food_update_used.php
require_once __DIR__ . "/config.php";

$d = json_input();
$foodID = $d['foodID'] ?? null;
$newQuantity = $d['newQuantity'] ?? null;

if (!$foodID || $newQuantity === null) {
  respond(['ok' => false, 'error' => 'Missing parameters'], 400);
}

try {
  // Ensure the quantity cannot be negative
  if ($newQuantity == 0) {
    // ✅ Double-check existence first
    $check = $pdo->prepare("SELECT 1 FROM foods WHERE foodID = :id");
    $check->execute([':id' => $foodID]);

    if (!$check->fetch()) {
      respond(['ok' => false, 'error' => 'Item not found'], 404);
    }

    // ✅ Delete the item completely when quantity reaches zero
    $del = $pdo->prepare("DELETE FROM foods WHERE foodID = :id");
    $del->execute([':id' => $foodID]);

    if ($del->errorCode() === '00000') {
      respond(['ok' => true, 'deleted' => true]);
    } else {
      $err = implode(' | ', $del->errorInfo());
      respond(['ok' => false, 'error' => 'Delete failed: ' . $err], 500);
    }
  }else {
    // ✅ Update only the quantity
    $stmt = $pdo->prepare("
      UPDATE foods
      SET quantity = :qty
      WHERE foodID = :id
    ");
    $stmt->execute([
      ':qty' => $newQuantity,
      ':id' => $foodID
    ]);

    if ($stmt->rowCount() > 0) {
      respond(['ok' => true, 'updated' => 1, 'newQuantity' => $newQuantity]);
    } else {
      respond(['ok' => false, 'error' => 'Food item not found or not updated'], 404);
    }
  }
} catch (PDOException $e) {
  respond(['ok' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}
