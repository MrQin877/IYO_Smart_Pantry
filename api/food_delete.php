<?php
require __DIR__.'/config.php';
$d = read_json();
if (empty($d['foodID'])) send_json(['ok'=>false,'error'=>'Missing foodID'], 400);

$stmt = $mysqli->prepare("DELETE FROM foods WHERE foodID=?");
$stmt->bind_param('s', $d['foodID']);
$ok = $stmt->execute();
if (!$ok) send_json(['ok'=>false,'error'=>$stmt->error], 500);
send_json(['ok'=>true, 'affected'=>$stmt->affected_rows]);
