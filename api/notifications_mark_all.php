<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\notifications_mark_all.php
require_once __DIR__ . '/config.php';
$userID = $_SESSION['userID'] ?? null;
if (!$userID) respond(['ok'=>false,'error'=>'Unauthorized'], 401);
$st = $pdo->prepare("UPDATE notifications SET is_read=1 WHERE userID=:uid AND is_read=0");
$st->execute([':uid'=>$userID]);
respond(['ok'=>true, 'updated'=>$st->rowCount()]);
