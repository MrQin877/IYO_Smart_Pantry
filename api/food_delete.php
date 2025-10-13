<?php
// api/food_delete.php
require_once __DIR__ . '/config.php';

/*
Request JSON:
{ "foodID": "F1234" }

Response:
{ ok: true, deleted: { donations:N, foods:1 } }
*/

$userID = $_SESSION['userID'] ?? null;
if (!$userID) {
  respond(['ok'=>false,'error'=>'Not authenticated'], 401);
}

$d = json_input();
$foodID = $d['foodID'] ?? '';
if ($foodID === '') {
  respond(['ok'=>false,'error'=>'Missing foodID'], 400);
}

try {
  $pdo->beginTransaction();

  // 1) Verify ownership and lock the row
  $own = $pdo->prepare("
    SELECT foodID FROM foods
    WHERE foodID = :fid AND userID = :uid
    FOR UPDATE
  ");
  $own->execute([':fid'=>$foodID, ':uid'=>$userID]);
  if (!$own->fetch()) {
    $pdo->rollBack();
    respond(['ok'=>false,'error'=>'Food not found or not yours'], 404);
  }

  $deleted = ['donations' => 0, 'foods' => 0];

  // (Optional) If you want to also remove pickup_times for those donations when you delete the donation,
  // un-comment this block AND the donationIDs fetch below.
  //
  // // Find donationIDs for this food
  // $donIds = [];
  // $q = $pdo->prepare("SELECT donationID FROM donations WHERE foodID = :fid");
  // $q->execute([':fid' => $foodID]);
  // while ($r = $q->fetch()) $donIds[] = $r['donationID'];
  //
  // if (!empty($donIds)) {
  //   $ph = implode(',', array_fill(0, count($donIds), '?'));
  //   $pt = $pdo->prepare("DELETE FROM pickup_times WHERE donationID IN ($ph)");
  //   $pt->execute($donIds);
  //   // (we're not returning pickup_times count here since spec asked only food+donation)
  // }

  // 2) Delete donations for this food
  $delDon = $pdo->prepare("DELETE FROM donations WHERE foodID = :fid");
  $delDon->execute([':fid' => $foodID]);
  $deleted['donations'] = $delDon->rowCount();

  // 3) Delete the food itself
  $delFood = $pdo->prepare("DELETE FROM foods WHERE foodID = :fid AND userID = :uid");
  $delFood->execute([':fid' => $foodID, ':uid' => $userID]);
  $deleted['foods'] = $delFood->rowCount();

  $pdo->commit();
  respond(['ok'=>true, 'deleted'=>$deleted]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  error_log($e->getMessage());
  respond(['ok'=>false,'error'=>'DB error'], 500);
}
