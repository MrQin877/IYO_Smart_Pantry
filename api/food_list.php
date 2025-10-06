<?php
require __DIR__ . '/config.php';

$d = json_input();
$userID     = $d['userID']     ?? null;
$categoryID = $d['categoryID'] ?? null;
$storageType = $d['status']    ?? null; // use 'status' field as storage filter
$pickupArea = $d['pickupArea'] ?? null;

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
if ($userID)     { $sql .= " AND f.userID = ?";     $params[] = $userID; }
if ($categoryID) { $sql .= " AND f.categoryID = ?"; $params[] = $categoryID; }
if ($storageType) { $sql .= " AND s.storageName LIKE ?"; $params[] = "%$storageType%"; }
if ($pickupArea)  { $sql .= " AND s.storageName LIKE ?"; $params[] = "%$pickupArea%"; }

// Optional: ignore planned items

$sql .= " ORDER BY f.expiryDate ASC";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $foods = $stmt->fetchAll(PDO::FETCH_ASSOC);
    respond(['ok' => true, 'foods' => $foods]);
} catch (Throwable $e) {
    respond([
        'ok' => false, 
        'error' => $e->getMessage(), 
        'sql' => $sql, 
        'params' => $params
    ], 500);
}
