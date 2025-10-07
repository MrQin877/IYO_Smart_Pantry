<?php
// api/food_delete.php
require_once __DIR__ . '/config.php';

/*
JSON in:
{
  "userID": "U1",
  "foodID": "F1234"
}

Response:
{ ok: true, mode: "zeroed" | "deleted" }
*/

$d = json_input();
$userID = $d['userID'] ?? '';
$foodID = $d['foodID'] ?? '';

if (!$userID || !$foodID) {
  respond(['ok'=>false,'error'=>'Missing userID or foodID'], 400);
}

try {
  $pdo->beginTransaction();

  // 1) Ownership / existence check
  $own = $pdo->prepare("SELECT quantity FROM foods WHERE foodID = :fid AND userID = :uid FOR UPDATE");
  $own->execute([':fid'=>$foodID, ':uid'=>$userID]);
  $row = $own->fetch();
  if (!$row) {
    $pdo->rollBack();
    respond(['ok'=>false,'error'=>'Food not found or not yours'], 404);
  }

  // 2) Check donation reference
  $ref = $pdo->prepare("SELECT 1 FROM donations WHERE foodID = :fid LIMIT 1");
  $ref->execute([':fid'=>$foodID]);
  $isReferenced = (bool)$ref->fetch();

  if ($isReferenced) {
    // Only zero the quantity
    $upd = $pdo->prepare("UPDATE foods SET quantity = 0 WHERE foodID = :fid");
    $upd->execute([':fid'=>$foodID]);

    $pdo->commit();
    respond(['ok'=>true, 'mode'=>'zeroed']);
  } else {
    // Safe to delete
    $del = $pdo->prepare("DELETE FROM foods WHERE foodID = :fid");
    $del->execute([':fid'=>$foodID]);

    $pdo->commit();
    respond(['ok'=>true, 'mode'=>'deleted']);
  }
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  error_log($e->getMessage());
  respond(['ok'=>false,'error'=>'DB error'], 500);
}
