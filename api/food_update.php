<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\food_update.php
require_once __DIR__ . '/config.php';
$userID = $_SESSION['userID'] ?? null;
if (!$userID) {
  respond(['ok'=>false,'error'=>'Not authenticated'], 401);
}

$d = json_input();


$need = ['foodID','foodName','quantity','expiryDate','categoryID','unitID'];
foreach ($need as $k) {
  if (!isset($d[$k]) || $d[$k] === '') {
    respond(['ok'=>false,'error'=>"Missing $k"], 400);
  }
}

$is_plan = !empty($d['is_plan']) ? 1 : 0;

$sql = "UPDATE foods SET
  foodName=:foodName,
  quantity=:quantity,
  expiryDate=:expiryDate,
  storageID=:storageID,
  remark=:remark,
  categoryID=:categoryID,
  unitID=:unitID
WHERE foodID=:foodID AND userID=:userID";

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':foodName'        => $d['foodName'],
    ':quantity'        => $d['quantity'],
    ':expiryDate'      => $d['expiryDate'],       // YYYY-MM-DD
    ':storageID'       => !empty($d['storageID']) ? $d['storageID'] : null, // ✅ NULL instead of ''
    ':remark'          => $d['remark'] ?? null,
    ':userID'          => $userID,
    ':categoryID'      => $d['categoryID'],
    ':unitID'          => $d['unitID'],
    ':foodID'          => $d['foodID'],
  ]);

  respond(['ok'=>true, 'rows'=>$stmt->rowCount()]);
} catch (Throwable $e) {
  respond(['ok'=>false,'error'=>'DB error'], 500);
}
