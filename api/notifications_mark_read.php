<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\notifications_mark_read.php
require_once __DIR__ . '/config.php';
$userID = $_SESSION['userID'] ?? null;
if (!$userID) respond(['ok'=>false,'error'=>'Unauthorized'], 401);

$input = json_input();
$ids = $input['ids'] ?? [];
if (!is_array($ids) || empty($ids)) respond(['ok'=>false,'error'=>'Bad ids'], 400);

$place = implode(',', array_fill(0, count($ids), '?'));
$args = $ids; array_unshift($args, $userID);

$sql = "UPDATE notifications SET is_read=1 WHERE userID=? AND noticeID IN ($place)";
$st = $pdo->prepare($sql);
$st->execute($args);
respond(['ok'=>true, 'updated'=>$st->rowCount()]);
