<?php
require_once __DIR__ . "/config.php";

$raw = file_get_contents("php://input");
$input = json_decode($raw, true);
$foodID = $input["foodID"] ?? null;

if (!$foodID) {
    respond(["ok" => false, "error" => "Missing foodID"], 400);
}

$sql = "
  SELECT 
    f.foodID,
    f.foodName,
    f.expiryDate,
    f.quantity,
    f.storageLocation,
    f.is_expiryStatus,
    c.categoryName,
    u.unitName,
    ur.fullName AS ownerName,
    ur.email AS ownerEmail
  FROM foods f
  LEFT JOIN categories c ON f.categoryID = c.categoryID
  LEFT JOIN units u ON f.unitID = u.unitID
  LEFT JOIN user_registration ur ON f.userID = ur.userID
  WHERE f.foodID = ?
";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$foodID]);
    $food = $stmt->fetch();

    if ($food) {
        respond(["ok" => true, "food" => $food]);
    } else {
        respond(["ok" => false, "error" => "Food not found"], 404);
    }
} catch (Throwable $e) {
    respond(["ok" => false, "error" => "Query failed", "details" => $e->getMessage()], 500);
}
