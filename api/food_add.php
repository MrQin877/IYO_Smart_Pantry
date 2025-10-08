<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\food_add.php
require_once __DIR__ . '/config.php';

$d = json_input();

// --- Basic validation ---
$need = ['foodName','quantity','expiryDate','userID','categoryID','unitID'];
foreach ($need as $k) {
  if (!isset($d[$k]) || $d[$k] === '') {
    respond(['ok'=>false,'error'=>"Missing $k"], 400);
  }
}

// --- Compute flags ---
$is_expiryStatus = (strtotime($d['expiryDate']) < strtotime('today')) ? 1 : 0;
$is_plan = !empty($d['is_plan']) ? 1 : 0;

// --- Insert ---
$sql = "INSERT INTO foods
  (foodName, quantity, expiryDate, is_plan, storageID, remark, userID, categoryID, unitID)
  VALUES (:foodName, :quantity, :expiryDate, :is_plan, :storageID, :remark, :userID, :categoryID, :unitID)";

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':foodName'        => $d['foodName'],
    ':quantity'        => $d['quantity'],
    ':expiryDate'      => $d['expiryDate'],       // YYYY-MM-DD
    ':is_plan'         => $is_plan,
    ':storageID'       => !empty($d['storageID']) ? $d['storageID'] : null, // ✅ NULL instead of ''
    ':remark'          => $d['remark'] ?? null,
    ':userID'          => $d['userID'],
    ':categoryID'      => $d['categoryID'],
    ':unitID'          => $d['unitID'],
  ]);

  // --- Get the new foodID (from trigger) ---
  $q = $pdo->prepare("SELECT foodID 
                      FROM foods 
                      WHERE userID = :uid 
                      ORDER BY CAST(SUBSTRING(foodID,2) AS UNSIGNED) DESC 
                      LIMIT 1");
  $q->execute([':uid' => $d['userID']]);
  $row = $q->fetch();

  respond(['ok'=>true, 'foodID'=>$row['foodID'] ?? null]);

} catch (Throwable $e) {
  // ✅ Log detailed error for debugging
  error_log("food_add error: " . $e->getMessage());
  respond(['ok'=>false,'error'=>$e->getMessage()], 500);
}
