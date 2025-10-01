<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\food_delete.php
require_once __DIR__ . '/config.php';

$d = json_input();
$foodID = $d['foodID'] ?? null;
$userID = $d['userID'] ?? null; // to restrict deletion to the current user's own data

if (!$foodID) respond(['ok'=>false,'error'=>'Missing foodID'], 400);
if (!$userID) respond(['ok'=>false,'error'=>'Missing userID'], 400);

try {
  // Only allow deleting foods that belong to the current user
  $stmt = $pdo->prepare("DELETE FROM foods WHERE foodID = :id AND userID = :uid");
  $stmt->execute([':id' => $foodID, ':uid' => $userID]);

  if ($stmt->rowCount() === 0) {
    respond(['ok'=>false,'error'=>'Not found or no permission'], 404);
  }

  respond(['ok'=>true, 'deleted'=>1]);
} catch (PDOException $e) {
  // 23000 = foreign key constraint failure (e.g., donations already reference this food)
  if ($e->getCode() === '23000') {
    respond(['ok'=>false,'error'=>'Cannot delete: linked records (e.g. donations) exist.'], 409);
  }
  respond(['ok'=>false,'error'=>'DB error'], 500);
}
