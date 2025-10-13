<?php
require __DIR__ . '/config.php';
session_start();

$userID = $_SESSION['userID'] ?? null;
if (!$userID) {
  respond(['ok' => false, 'error' => 'User not logged in'], 401);
}

$d = json_input();
$foodID = $d['foodID'] ?? null;
$usedAmount = $d['usedAmount'] ?? null;

if (!$foodID || $usedAmount === null) {
  respond(['ok' => false, 'error' => 'Missing parameters'], 400);
}

try {
  // ✅ Fetch food & verify ownership
  $check = $pdo->prepare("SELECT * FROM foods WHERE foodID = :id AND userID = :userID");
  $check->execute([':id' => $foodID, ':userID' => $userID]);
  $food = $check->fetch(PDO::FETCH_ASSOC);

  if (!$food) {
    respond(['ok' => false, 'error' => 'Food not found or not owned by this user'], 403);
  }

  // ✅ Current values
  $currentQty = (float)$food['quantity'];
  $currentUsed = (float)$food['usedQty'];
  $currentReserved = (float)$food['reservedQty'];
  $use = (float)$usedAmount;

  // ✅ Validation
  if ($use <= 0) {
    respond(['ok' => false, 'error' => 'Used amount must be greater than 0'], 400);
  }

  if ($use > $currentQty) {
    respond(['ok' => false, 'error' => 'Cannot use more than available quantity'], 400);
  }

  // ✅ Compute new values
  $newQty = $currentQty - $use;
  $newUsed = $currentUsed + $use;

  // ✅ Update foods table
  $stmt = $pdo->prepare("
    UPDATE foods
    SET quantity = :qty,
        usedQty = :used
    WHERE foodID = :id AND userID = :userID
  ");
  $stmt->execute([
    ':qty' => $newQty,
    ':used' => $newUsed,
    ':id' => $foodID,
    ':userID' => $userID
  ]);

  // ✅ Logic for result cases
  if ($newQty <= 0 && $currentReserved > 0) {
    // ⚠️ All available used, but reserved items remain
    respond([
      'ok' => true,
      'updated' => true,
      'warning' => true,
      'message' => '✅ Quantity updated successfully. ⚠️ All available stock used, but reserved items are still pending.',
      'newQuantity' => $newQty,
      'newUsedQty' => $newUsed,
      'reservedQty' => $currentReserved
    ]);
  }

  if ($newQty <= 0 && $currentReserved <= 0) {
    // ✅ Fully used, can be deleted
    respond([
      'ok' => true,
      'updated' => true,
      'deleted' => true,
      'message' => '✅ Food item fully used and removed.',
      'newQuantity' => 0,
      'newUsedQty' => $newUsed,
      'reservedQty' => 0
    ]);
  }

  // ✅ Normal update
  respond([
    'ok' => true,
    'updated' => true,
    'message' => '✅ Food quantity updated successfully.',
    'newQuantity' => $newQty,
    'newUsedQty' => $newUsed,
    'reservedQty' => $currentReserved
  ]);

} catch (Throwable $e) {
  respond(['ok' => false, 'error' => $e->getMessage()], 500);
}
