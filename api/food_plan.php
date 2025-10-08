<?php
require_once __DIR__ . "/config.php";

$d = json_input();
$foodID = $d['foodID'] ?? null;
$isPlan = isset($d['is_plan']) ? (int)$d['is_plan'] : 1; // default to 1 if not given

if (!$foodID) respond(['ok' => false, 'error' => 'Missing foodID'], 400);

try {
    $stmt = $pdo->prepare("UPDATE foods SET is_plan = :is_plan WHERE foodID = :foodID");
    $stmt->execute([':is_plan' => $isPlan, ':foodID' => $foodID]);

    if ($stmt->rowCount() === 0) {
        respond(['ok' => false, 'error' => 'No record updated (foodID not found)'], 404);
    }

    respond(['ok' => true, 'foodID' => $foodID, 'is_plan' => $isPlan]);
} catch (PDOException $e) {
    respond(['ok' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
}
