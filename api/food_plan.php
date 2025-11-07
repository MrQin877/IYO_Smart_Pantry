<?php
require_once __DIR__ . "/config.php";

$d = json_input();
$foodID = $d['foodID'] ?? null;
$isPlan = isset($d['is_plan']) ? (int)$d['is_plan'] : 1;

if (!$foodID) respond(['ok' => false, 'error' => 'Missing foodID'], 400);

try {
    // ✅ ensure food exists
    $check = $pdo->prepare("SELECT foodID FROM foods WHERE foodID = ?");
    $check->execute([$foodID]);

    if (!$check->fetch()) {
        respond(['ok' => false, 'error' => 'foodID not found'], 404);
    }

    // ✅ update (even if unchanged)
    $stmt = $pdo->prepare("UPDATE foods SET is_plan = :is_plan WHERE foodID = :foodID");
    $stmt->execute([':is_plan' => $isPlan, ':foodID' => $foodID]);

    respond([
        'ok' => true,
        'foodID' => $foodID,
        'is_plan' => $isPlan,
        'message' => 'Updated successfully'
    ]);

} catch (PDOException $e) {
    respond(['ok' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}
