<?php
require __DIR__ . '/config.php';
session_start();

// ✅ Ensure the user is logged in
$userID = $_SESSION['userID'] ?? null;
if (!$userID) {
  respond(['ok' => false, 'error' => 'Not logged in'], 401);
  exit;
}

// ✅ Get optional filters from frontend
$d = json_input();
$category    = $d['category']    ?? null;
$storageID   = $d['storageID']   ?? null;
$expiryRange = $d['expiryRange'] ?? null;
$pickupArea  = $d['pickupArea']  ?? null;

// ✅ Base SQL — always filter by current session user
$sql = "
  SELECT 
    d.donationID,
    d.quantity AS donationQuantity,
    d.contact,
    d.note,
    d.pickupLocation,
    f.foodName,
    f.quantity AS foodQuantity,
    f.expiryDate,
    c.categoryName,
    un.unitName,
    u.fullName AS donorName,
    GROUP_CONCAT(pt.pickTime SEPARATOR '|') AS availabilityTimes
  FROM donations d
  LEFT JOIN foods f ON d.foodID = f.foodID
  LEFT JOIN categories c ON f.categoryID = c.categoryID
  LEFT JOIN units un ON f.unitID = un.unitID
  LEFT JOIN users u ON d.userID = u.userID
  LEFT JOIN pickup_times pt ON d.donationID = pt.donationID
  WHERE d.userID = :userID
";

$params = [':userID' => $userID];

// ✅ Optional filters
if (!empty($category)) {
  $sql .= " AND f.categoryID = :category";
  $params[':category'] = $category;
}

if (!empty($storageID)) {
  $sql .= " AND f.storageID = :storageID";
  $params[':storageID'] = $storageID;
}

if (!empty($expiryRange)) {
  if ($expiryRange === '3days') {
    $sql .= " AND f.expiryDate <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)";
  } elseif ($expiryRange === 'week') {
    $sql .= " AND f.expiryDate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
  } elseif ($expiryRange === 'month') {
    $sql .= " AND f.expiryDate <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH)";
  }
}

if (!empty($pickupArea)) {
  $sql .= " AND d.pickupLocation LIKE :pickupArea";
  $params[':pickupArea'] = "%$pickupArea%";
}

// ✅ Group and sort
$sql .= " GROUP BY d.donationID ORDER BY d.donationID DESC";

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);

  respond(['ok' => true, 'data' => $donations]);
} catch (Throwable $e) {
  respond([
    'ok' => false,
    'error' => $e->getMessage(),
    'sql' => $sql,
    'params' => $params
  ], 500);
}
