<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\foods_list.php
require __DIR__.'/config.php';

$d = json_input();
$userID = $d['userID'] ?? null;
$categoryID = $d['categoryID'] ?? null;
$status = $d['status'] ?? null;  // "Expired" / "Available"
$pickupArea = $d['pickupArea'] ?? null; // from filter modal

$sql = "SELECT * FROM foods WHERE 1=1";
$params = [];

// If you want only the logged in user’s foods
if ($userID) {
  $sql .= " AND userID = ?";
  $params[] = $userID;
}

if ($categoryID) {
  $sql .= " AND categoryID = ?";
  $params[] = $categoryID;
}

if ($status === "Expired") {
  $sql .= " AND is_expiryStatus = 1";
} elseif ($status === "Available") {
  $sql .= " AND is_expiryStatus = 0";
}

if ($pickupArea) {
  $sql .= " AND storageLocation LIKE ?";
  $params[] = "%".$pickupArea."%";
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$foods = $stmt->fetchAll();

respond(['ok'=>true, 'foods'=>$foods]);
