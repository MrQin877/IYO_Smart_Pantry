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
    f.quantity,
    f.usedQty,
    f.reservedQty,
    f.expiryDate,
    f.remark,
    f.is_plan,
    c.categoryName,
    s.storageName,
    u.unitName
  FROM foods f
  LEFT JOIN categories c ON f.categoryID = c.categoryID
  LEFT JOIN storages s ON f.storageID = s.storageID
  LEFT JOIN units u ON f.unitID = u.unitID
  WHERE f.foodID = ?
";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$foodID]);
    $food = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($food) {
        // ✅ Ensure non-negative availableQty
        $food['availableQty'] = max(0, (float)$food['availableQty']);

        respond(["ok" => true, "food" => $food]);
    } else {
        respond(["ok" => false, "error" => "Food not found"], 404);
    }
} catch (Throwable $e) {
    respond([
        "ok" => false,
        "error" => "Query failed",
        "details" => $e->getMessage()
    ], 500);
}
