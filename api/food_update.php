<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\food_update.php
require __DIR__.'/config.php';
$d = read_json();

$need = ['foodID','foodName','quantity','expiryDate','userID','categoryID','unitID'];
foreach ($need as $k) {
  if (!isset($d[$k]) || $d[$k] === '') {
    send_json(['ok'=>false,'error'=>"Missing $k"], 400);
  }
}

$is_expiryStatus = (strtotime($d['expiryDate']) < strtotime('today')) ? 1 : 0;
$is_plan = !empty($d['is_plan']) ? 1 : 0;

$sql = "UPDATE foods
        SET foodName=?, quantity=?, expiryDate=?, is_expiryStatus=?, is_plan=?,
            storageLocation=?, remark=?, categoryID=?, unitID=?
        WHERE foodID=? AND userID=?";
$stmt = $mysqli->prepare($sql);
if (!$stmt) send_json(['ok'=>false,'error'=>$mysqli->error], 500);

$storage = $d['storageLocation'] ?? '';
$remark  = $d['remark'] ?? '';

$stmt->bind_param(
  'sdsiissssss',
  $d['foodName'],
  $d['quantity'],
  $d['expiryDate'],
  $is_expiryStatus,
  $is_plan,
  $storage,
  $remark,
  $d['categoryID'],
  $d['unitID'],
  $d['foodID'],
  $d['userID']
);

if (!$stmt->execute()) {
  send_json(['ok'=>false,'error'=>$stmt->error], 500);
}

send_json(['ok'=>true]);
