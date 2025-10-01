<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\food_add.php
require __DIR__.'/config.php';
$d = read_json();

$need = ['foodName','quantity','expiryDate','userID','categoryID','unitID'];
foreach ($need as $k) {
  if (!isset($d[$k]) || $d[$k] === '') {
    send_json(['ok'=>false,'error'=>"Missing $k"], 400);
  }
}

$is_expiryStatus = (strtotime($d['expiryDate']) < strtotime('today')) ? 1 : 0;
$is_plan = !empty($d['is_plan']) ? 1 : 0;

$sql = "INSERT INTO foods
  (foodName, quantity, expiryDate, is_expiryStatus, is_plan, storageLocation, remark, userID, categoryID, unitID)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $mysqli->prepare($sql);
if (!$stmt) send_json(['ok'=>false,'error'=>$mysqli->error], 500);

$storage = $d['storageLocation'] ?? '';
$remark  = $d['remark'] ?? '';

$stmt->bind_param(
  'sdsiisssss',
  $d['foodName'],
  $d['quantity'],
  $d['expiryDate'],
  $is_expiryStatus,
  $is_plan,
  $storage,
  $remark,
  $d['userID'],
  $d['categoryID'],
  $d['unitID']
);

if (!$stmt->execute()) {
  send_json(['ok'=>false,'error'=>$stmt->error], 500);
}

// PK is varchar with trigger; fetch latest for that user
$q = $mysqli->prepare("SELECT foodID FROM foods WHERE userID=? ORDER BY CAST(SUBSTRING(foodID,2) AS UNSIGNED) DESC LIMIT 1");
$q->bind_param('s', $d['userID']);
$q->execute();
$foodID = null;
$q->bind_result($foodID);
$q->fetch();
$q->close();

send_json(['ok'=>true, 'foodID'=>$foodID]);
