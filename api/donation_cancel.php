<?php
// api/donation_cancel.php
require_once __DIR__ . '/config.php';

/*
Expected JSON:
{
  "userID": "U1",
  "donationID": "D123"
}aa
*/
$userID = $_SESSION['userID'] ?? null;

$d = json_input();
$donationID = $d['donationID'] ?? '';


if (!$userID || !$donationID) {
  respond(['ok'=>false,'error'=>'Missing userID or donationID'], 400);
}

try {
  $pdo->beginTransaction();

  // 1) Fetch donation (must belong to user or at least check ownership if needed)
  $sql = "SELECT d.donationID, d.quantity, d.foodID, f.unitID
          FROM donations d
          JOIN foods f ON f.foodID = d.foodID
          WHERE d.donationID = :did";
  $st  = $pdo->prepare($sql);
  $st->execute([':did' => $donationID]);
  $don = $st->fetch();

  if (!$don) {
    $pdo->rollBack();
    respond(['ok'=>false,'error'=>'Donation not found'], 404);
  }

  // (Optional) Verify the donation belongs to this user if your schema has userID on donations
  $chk = $pdo->prepare("SELECT 1 FROM donations WHERE donationID=:did AND userID=:uid");
  $chk->execute([':did'=>$donationID, ':uid'=>$userID]);
  if (!$chk->fetch()) {
    $pdo->rollBack();
    respond(['ok'=>false,'error'=>'Not allowed'], 403);
  }

  $foodID   = $don['foodID'];
  $qtyBack  = (float)$don['quantity'];

  // 2) Restore quantity to the food
  $up = $pdo->prepare("UPDATE foods SET quantity = quantity + :q WHERE foodID = :fid");
  $up->execute([':q'=>$qtyBack, ':fid'=>$foodID]);

  // 3) Delete donation
  // If you have FK PICKUP_TIMES(donationID) ON DELETE CASCADE, pickup slots auto-delete.
  $del = $pdo->prepare("DELETE FROM donations WHERE donationID = :did");
  $del->execute([':did'=>$donationID]);

  $pdo->commit();
  respond(['ok'=>true, 'restoredQty'=>$qtyBack, 'foodID'=>$foodID]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  error_log($e->getMessage());
  respond(['ok'=>false,'error'=>'DB error'], 500);
}
