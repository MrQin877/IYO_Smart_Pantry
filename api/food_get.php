<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\food_get.php
require __DIR__.'/config.php';

$d = json_input();
if (empty($d['foodID'])) {
  respond(['ok'=>false, 'error'=>'Missing foodID'], 400);
}

try {
  // 1. Fetch food detail
  $stmt = $pdo->prepare("SELECT * FROM foods WHERE foodID = ?");
  $stmt->execute([$d['foodID']]);
  $food = $stmt->fetch();

  if (!$food) {
    respond(['ok'=>false, 'error'=>'Food not found'], 404);
  }

  // 2. Fetch history (if you have a food_history table)
  $stmt2 = $pdo->prepare("SELECT date, qty, action FROM food_history WHERE foodID = ? ORDER BY date DESC");
  $stmt2->execute([$d['foodID']]);
  $history = $stmt2->fetchAll();

  respond(['ok'=>true, 'food'=>$food, 'history'=>$history]);

} catch (Throwable $e) {
  respond(['ok'=>false, 'error'=>$e->getMessage()], 500);
}
