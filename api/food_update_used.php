<?php
require_once __DIR__ . "/config.php";
session_start();

// ✅ Get logged-in user
$userID = $_SESSION['userID'] ?? null;
if (!$userID) {
  respond(['ok' => false, 'error' => 'User not logged in'], 401);
}

$d = json_input();
$foodID = $d['foodID'] ?? null;
$newQuantity = $d['newQuantity'] ?? null;

if (!$foodID || $newQuantity === null) {
  respond(['ok' => false, 'error' => 'Missing parameters'], 400);
}

try {
  if ($newQuantity < 0) {
    respond(['ok' => false, 'error' => 'Quantity cannot be negative'], 400);
  }

  // ✅ Verify ownership
  $check = $pdo->prepare("SELECT * FROM foods WHERE foodID = :id AND userID = :userID");
  $check->execute([':id' => $foodID, ':userID' => $userID]);
  $food = $check->fetch(PDO::FETCH_ASSOC);

  if (!$food) {
    respond(['ok' => false, 'error' => 'Food not found or not owned by this user'], 403);
  }

  // ✅ Always just update quantity (do not delete)
  $stmt = $pdo->prepare("
    UPDATE foods
    SET quantity = :qty
    WHERE foodID = :id AND userID = :userID
  ");
  $stmt->execute([
    ':qty' => $newQuantity,
    ':id' => $foodID,
    ':userID' => $userID
  ]);

  respond([
    'ok' => true,
    'updated' => 1,
    'newQuantity' => $newQuantity,
    'usedUp' => $newQuantity == 0
  ]);

} catch (PDOException $e) {
  respond(['ok' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}
