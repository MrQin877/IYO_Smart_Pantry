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
    f.expiryDate,
    f.remark,
    f.is_plan,                    -- ✅ include this field
    c.categoryName,
    s.storageName,
    u.unitName,
    -- Total reserved quantity
    COALESCE((
      SELECT SUM(a.actionQty)
      FROM actions a
      WHERE a.foodID = f.foodID
        AND a.actionTypeID = 'AT2'
    ), 0) AS reservedQty,
    -- Latest status (Used / Reserved / Donated / Added)
    (
      SELECT at.actionTypeName
      FROM actions a2
      JOIN action_types at ON a2.actionTypeID = at.actionTypeID
      WHERE a2.foodID = f.foodID
      ORDER BY a2.actionDate DESC
      LIMIT 1
    ) AS status
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
