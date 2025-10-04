<?php
require_once __DIR__ . '/config.php';

// Expected: { "donationID": "D3", "foodID": "F10" }
$d = json_input();

if (empty($d['donationID']) || empty($d['foodID'])) {
  respond(['ok'=>false,'error'=>'Missing donationID or foodID'],400);
}

try {
  $pdo->beginTransaction();

  // Get donation quantity
  $stmt = $pdo->prepare("SELECT quantity FROM donations WHERE donationID = :did");
  $stmt->execute([':did'=>$d['donationID']]);
  $donQty = (float)$stmt->fetchColumn();

  // Delete donation
  $pdo->prepare("DELETE FROM donations WHERE donationID = :did")->execute([':did'=>$d['donationID']]);

  // Restore quantity back to food
  $pdo->prepare("UPDATE foods SET quantity = quantity + :q WHERE foodID = :fid")
      ->execute([':q'=>$donQty, ':fid'=>$d['foodID']]);

  $pdo->commit();
  respond(['ok'=>true, 'restored'=>$donQty]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  error_log('donation_cancel: '.$e->getMessage());
  respond(['ok'=>false,'error'=>$e->getMessage()],500);
}
