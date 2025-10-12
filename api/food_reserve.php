<?php
require_once __DIR__ . "/config.php";
session_start();

$userID = $_SESSION['userID'] ?? null;
if (!$userID) {
  respond(['ok' => false, 'error' => 'User not logged in'], 401);
}

$d = json_input();
$foodID = $d['foodID'] ?? null;
$reserveAmount = $d['reserveAmount'] ?? null;

if (!$foodID || $reserveAmount === null) {
  respond(['ok' => false, 'error' => 'Missing parameters'], 400);
}

try {
  $check = $pdo->prepare("SELECT quantity, reservedQty FROM foods WHERE foodID = :id AND userID = :userID");
  $check->execute([':id' => $foodID, ':userID' => $userID]);
  $food = $check->fetch(PDO::FETCH_ASSOC);

  if (!$food) {
    respond(['ok' => false, 'error' => 'Food not found or not owned by this user'], 404);
  }

  $currentQty = (float)$food['quantity'];
  $reservedQty = (float)$food['reservedQty'];
  $reserve = (float)$reserveAmount;

  if ($reserve <= 0) {
    respond(['ok' => false, 'error' => 'Invalid reserve amount'], 400);
  }

  if ($reserve > $currentQty) {
    respond(['ok' => false, 'error' => 'Reserve amount exceeds available quantity'], 400);
  }

  $newQty = $currentQty - $reserve;
  $newReserved = $reservedQty + $reserve;

  $stmt = $pdo->prepare("
    UPDATE foods
    SET quantity = :newQty,
        reservedQty = :newReserved
    WHERE foodID = :id AND userID = :userID
  ");
  $stmt->execute([
    ':newQty' => $newQty,
    ':newReserved' => $newReserved,
    ':id' => $foodID,
    ':userID' => $userID
  ]);

  respond(['ok' => true, 'updated' => true, 'newQuantity' => $newQty, 'reservedQty' => $newReserved]);

} catch (Throwable $e) {
  respond(['ok' => false, 'error' => $e->getMessage()], 500);
}
