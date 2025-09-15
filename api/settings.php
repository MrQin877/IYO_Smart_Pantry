<?php
// api/settings.php
require __DIR__.'/config.php';
session_start();

$userID=$_SESSION['userID']??null;
if(!$userID){
  // dev fallback
  $tmp = json_input();
  if(isset($tmp['userID'])) $userID=$tmp['userID'];
}
if(!$userID){ respond(['ok'=>false,'error'=>'Unauthorized'],401); }

if($_SERVER['REQUEST_METHOD']==='GET'){
  $stmt=$pdo->prepare('SELECT twoFA, foodVisibility, notification FROM USER_SETTINGS WHERE userID=?');
  $stmt->execute([$userID]);
  respond(['ok'=>true,'settings'=>$stmt->fetch()]);
}

$body=json_input();
$twoFA = isset($body['twoFA']) ? (int) !!$body['twoFA'] : 0;
$foodVisibility = isset($body['foodVisibility']) ? (int) !!$body['foodVisibility'] : 0;
$notification = isset($body['notification']) ? (int) !!$body['notification'] : 0;

$stmt=$pdo->prepare('UPDATE USER_SETTINGS SET twoFA=?, foodVisibility=?, notification=? WHERE userID=?');
$stmt->execute([$twoFA,$foodVisibility,$notification,$userID]);
respond(['ok'=>true,'message'=>'Settings updated']);
