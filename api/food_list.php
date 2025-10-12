<?php
require __DIR__ . '/config.php';

session_start();
$userID = $_SESSION['userID'] ?? null;

if (!$userID) {
  respond(['ok' => false, 'error' => 'User not logged in'], 401);
}

$d = json_input();
$categoryID  = $d['categoryID'] ?? null;
$storageType = $d['status']     ?? null;

$sql = "
  SELECT 
    f.foodID,
    f.foodName,
    f.quantity,
    f.reservedQty,
    (f.quantity + f.reservedQty) AS totalQty,  -- ✅ total available + reserved
    f.expiryDate,
    f.is_plan,
    f.storageID,
    s.storageName,
    f.remark,
    f.userID,
    u.fullName AS ownerName,
    u.email AS ownerEmail,
    f.categoryID,
    c.categoryName,
    f.unitID,
    un.unitName
  FROM foods f
  LEFT JOIN categories c ON f.categoryID = c.categoryID
  LEFT JOIN units un      ON f.unitID = un.unitID
  LEFT JOIN storages s    ON f.storageID = s.storageID
  LEFT JOIN users u       ON f.userID = u.userID
  WHERE 1=1
";

$params = [];

if ($userID)      { $sql .= " AND f.userID = ?"; $params[] = $userID; }
if ($categoryID)  { $sql .= " AND f.categoryID = ?"; $params[] = $categoryID; }
if ($storageType) { $sql .= " AND s.storageName LIKE ?"; $params[] = "%$storageType%"; }


// ✅ Only show items with totalQty > 0
$sql .= " AND (f.quantity + f.reservedQty) > 0";

$sql .= " ORDER BY f.expiryDate ASC";

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $foods = $stmt->fetchAll(PDO::FETCH_ASSOC);
  respond(['ok' => true, 'foods' => $foods]);
} catch (Throwable $e) {
  respond(['ok' => false, 'error' => $e->getMessage()], 500);
}
