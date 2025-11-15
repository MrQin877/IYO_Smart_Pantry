<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $data = json_input();

    $recipeID = $data['recipeID'] ?? null;
    $ingredients = $data['ingredients'] ?? [];
    $userID = $data['userID'] ?? 'U2';

    if (empty($recipeID) || empty($ingredients)) {
        respond(['success' => false, 'message' => 'Missing recipe or ingredients.'], 400);
    }

    $pdo->beginTransaction();

    foreach ($ingredients as $ing) {
        $foodID = $ing['foodID'] ?? null;
        $qty = (float)($ing['qty'] ?? 0);

        if (!$foodID || $qty <= 0) continue;

        // Move reserved → used
        $update = $pdo->prepare("
            UPDATE foods
            SET 
                reservedQty = GREATEST(reservedQty - ?, 0),
                usedQty = usedQty + ?,
                is_plan = CASE WHEN reservedQty - ? <= 0 THEN 0 ELSE is_plan END
            WHERE foodID = ? AND userID = ?
        ");
        $update->execute([$qty, $qty, $qty, $foodID, $userID]);
    }

    $pdo->commit();
    respond(['success' => true, 'message' => 'Meal completed successfully.']);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    respond(['success' => false, 'message' => $e->getMessage()]);
}
