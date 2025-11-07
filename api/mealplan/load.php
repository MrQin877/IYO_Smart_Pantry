<?php
// load.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php';

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = $_POST;

$userID = $in['userID'] ?? 'U2';
$weekStart = $in['weekStart'] ?? null;

if (!$weekStart) respond(['ok' => false, 'error' => 'Missing weekStart'], 400);

try {
  // find mealPlanID
  $stmt = $pdo->prepare("SELECT mealPlanID FROM meal_plan_calendars WHERE userID = ? AND weekStart = ? LIMIT 1");
  $stmt->execute([$userID, $weekStart]);
  $row = $stmt->fetch();

  if (!$row) {
    respond(['ok' => true, 'entries' => []]); // ✅ FIXED
  }

  $mealPlanID = $row['mealPlanID'];

  // load entries
  $q = "SELECT me.*, mt.mealTypeName
        FROM meal_entries me
        LEFT JOIN meal_types mt ON me.mealTypeID = mt.mealTypeID
        WHERE me.mealPlanID = ?
        ORDER BY me.mealDate, me.mealEntryID";

  $stmt2 = $pdo->prepare($q);
  $stmt2->execute([$mealPlanID]);
  $entries = $stmt2->fetchAll();

  respond(['ok' => true, 'entries' => $entries, 'mealPlanID' => $mealPlanID]); // ✅ FIXED

} catch (Throwable $e) {
  respond(['ok' => false, 'error' => $e->getMessage()], 500);
}
