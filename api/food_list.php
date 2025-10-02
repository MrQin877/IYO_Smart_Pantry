<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\foods_list.php
require __DIR__.'/config.php';

$d = json_input();
$userID = $d['userID'] ?? null;
$categoryID = $d['categoryID'] ?? null;
$status = $d['status'] ?? null;  // "Expired" / "Available"
$pickupArea = $d['pickupArea'] ?? null; // from filter modal

// --- UPDATED QUERY WITH JOIN ---
$sql = "
  SELECT 
    f.foodID,
    f.foodName,
    f.quantity,
    f.expiryDate,
    f.is_expiryStatus,
    f.is_plan,
    f.storageLocation,
    f.remark,
    f.userID,
    f.categoryID,
    c.categoryName,        -- joined category name
    f.unitID,
    u.unitName             -- joined unit name
  FROM foods f
  LEFT JOIN categories c ON f.categoryID = c.categoryID
  LEFT JOIN units u ON f.unitID = u.unitID
  WHERE 1=1
";

$params = [];

if ($userID) {
  $sql .= " AND f.userID = ?";
  $params[] = $userID;
}

if ($categoryID) {
  $sql .= " AND f.categoryID = ?";
  $params[] = $categoryID;
}

if ($status === "Expired") {
  $sql .= " AND f.is_expiryStatus = 1";
} elseif ($status === "Available") {
  $sql .= " AND f.is_expiryStatus = 0";
}

if ($pickupArea) {
  $sql .= " AND f.storageLocation LIKE ?";
  $params[] = "%".$pickupArea."%";
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$foods = $stmt->fetchAll();

respond(['ok' => true, 'foods' => $foods]);
