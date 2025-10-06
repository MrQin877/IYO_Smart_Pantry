<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\food_get.php
require __DIR__ . '/config.php';

$d = json_input();
if (empty($d['foodID'])) {
  respond(['ok'=>false, 'error'=>'Missing foodID'], 400);
}

try {
  // --- Fetch food detail with joins ---
  $sql = "
    SELECT 
      f.foodID,
      f.foodName,
      f.quantity,
      f.expiryDate,
      f.is_plan,
      f.storageID,
      s.storageName,
      f.remark,
      f.userID,
      ur.fullName     AS ownerName,
      ur.email        AS ownerEmail,
      f.categoryID,
      c.categoryName,
      f.unitID,
      u.unitName
    FROM foods f
    LEFT JOIN categories c   ON f.categoryID = c.categoryID
    LEFT JOIN units u        ON f.unitID     = u.unitID
    LEFT JOIN storages s     ON f.storageID  = s.storageID
    LEFT JOIN user_registration ur ON f.userID = ur.userID
    WHERE f.foodID = ?
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$d['foodID']]);
  $food = $stmt->fetch();

  if (!$food) {
    respond(['ok'=>false, 'error'=>'Food not found'], 404);
  }

  // --- Fetch history if table exists ---
  $stmt2 = $pdo->prepare("SELECT date, qty, action FROM food_history WHERE foodID = ? ORDER BY date DESC");
  $stmt2->execute([$d['foodID']]);
  $history = $stmt2->fetchAll();

  respond(['ok'=>true, 'food'=>$food, 'history'=>$history]);

} catch (Throwable $e) {
  error_log("food_get error: " . $e->getMessage());
  respond(['ok'=>false, 'error'=>'Database error occurred'], 500);
}
