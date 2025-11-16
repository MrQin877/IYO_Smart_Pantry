<?php
require_once __DIR__ . '/config.php';

$userID = $_SESSION['userID'] ?? null;
if (!$userID) respond(['ok'=>false,'error'=>'Unauthorized'], 401);

$body   = json_input();
$foodID = isset($body['foodID']) ? trim((string)$body['foodID']) : '';
$isPlan = isset($body['is_plan']) ? (int)$body['is_plan'] : 1;

if ($foodID === '') {
  respond(['ok'=>false,'error'=>'Missing or invalid foodID'], 400);
}

$stmt = $pdo->prepare("
  UPDATE foods
  SET is_plan = :plan
  WHERE foodID = :fid AND userID = :uid
  LIMIT 1
");
$stmt->execute([
  ':plan' => $isPlan,
  ':fid'  => $foodID,   // 🔥 no is_numeric, no casting
  ':uid'  => $userID,
]);

if ($stmt->rowCount() === 0) {
  respond(['ok'=>false,'error'=>'Food not found or not owned'], 404);
}

respond(['ok'=>true]);
