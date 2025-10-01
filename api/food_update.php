<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\food_update.php
require_once __DIR__ . '/config.php';
$d = json_input();

$need = ['foodID','foodName','quantity','expiryDate','userID','categoryID','unitID'];
foreach ($need as $k) {
  if (!isset($d[$k]) || $d[$k] === '') {
    respond(['ok'=>false,'error'=>"Missing $k"], 400);
  }
}

$is_expiryStatus = (strtotime($d['expiryDate']) < strtotime('today')) ? 1 : 0;
$is_plan = !empty($d['is_plan']) ? 1 : 0;

$sql = "UPDATE foods SET
  foodName=:foodName,
  quantity=:quantity,
  expiryDate=:expiryDate,
  is_expiryStatus=:is_expiryStatus,
  is_plan=:is_plan,
  storageLocation=:storageLocation,
  remark=:remark,
  categoryID=:categoryID,
  unitID=:unitID
WHERE foodID=:foodID AND userID=:userID";

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':foodName'        => $d['foodName'],
    ':quantity'        => $d['quantity'],
    ':expiryDate'      => $d['expiryDate'],
    ':is_expiryStatus' => $is_expiryStatus,
    ':is_plan'         => $is_plan,
    ':storageLocation' => $d['storageLocation'] ?? '',
    ':remark'          => $d['remark'] ?? '',
    ':categoryID'      => $d['categoryID'],
    ':unitID'          => $d['unitID'],
    ':foodID'          => $d['foodID'],
    ':userID'          => $d['userID'],
  ]);
  respond(['ok'=>true, 'rows'=>$stmt->rowCount()]);
} catch (Throwable $e) {
  respond(['ok'=>false,'error'=>'DB error'], 500);
}
