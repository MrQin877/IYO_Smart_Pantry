<?php
// save.php
// CORS for dev (vite). Adjust origin for production.
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php'; // adjust path if needed

 $in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) respond(['ok' => false, 'error' => 'Bad JSON'], 400);

// Required fields: recipeID (opt), mealDate (YYYY-MM-DD), mealTypeID, mealName (opt), userID
 $recipeID   = $in['recipeID']   ?? null;
 $mealDate   = $in['mealDate']   ?? null;
 $mealTypeID = $in['mealTypeID'] ?? null;
 $mealName   = $in['mealName']   ?? null;
 $userID     = $in['userID']     ?? 'U2'; // fallback to U2 for dev/testing

// Add debug logging
error_log("SAVE: userID=$userID, mealDate=$mealDate, mealTypeID=$mealTypeID, recipeID=$recipeID");

if (!$mealDate || !$mealTypeID || !$userID) {
  respond(['ok' => false, 'error' => 'Missing mealDate / mealTypeID / userID'], 400);
}

// compute weekStart (Monday) from mealDate
try {
  $dt = new DateTime($mealDate);
} catch (Exception $e) {
  respond(['ok' => false, 'error' => 'Invalid mealDate'], 400);
}
 $dayOfWeek = (int)$dt->format('N'); // 1 (Mon) .. 7 (Sun)
 $daysToMon = $dayOfWeek - 1;
 $weekStart = clone $dt;
 $weekStart->modify("-{$daysToMon} days");
 $weekStartStr = $weekStart->format('Y-m-d');

// Add debug logging
error_log("SAVE: Calculated weekStart=$weekStartStr for mealDate=$mealDate (dayOfWeek=$dayOfWeek, daysToMon=$daysToMon)");

try {
  $pdo->beginTransaction();

  // 1) ensure meal_plan_calendars exists for (userID, weekStart)
  $stmt = $pdo->prepare("SELECT mealPlanID FROM meal_plan_calendars WHERE userID = ? AND weekStart = ? LIMIT 1");
  $stmt->execute([$userID, $weekStartStr]);
  $row = $stmt->fetch();

  if ($row) {
    $mealPlanID = $row['mealPlanID'];
    error_log("SAVE: Found existing mealPlanID=$mealPlanID");
  } else {
    $ins = $pdo->prepare("INSERT INTO meal_plan_calendars (weekStart, userID) VALUES (?, ?)");
    $ins->execute([$weekStartStr, $userID]);
    // read it back
    $stmt->execute([$userID, $weekStartStr]);
    $row2 = $stmt->fetch();
    if (!$row2) {
      $pdo->rollBack();
      respond(['ok' => false, 'error' => 'Failed to create meal plan calendar'], 500);
    }
    $mealPlanID = $row2['mealPlanID'];
    error_log("SAVE: Created new mealPlanID=$mealPlanID");
  }

  // 2) insert into meal_entries
  $ins2 = $pdo->prepare("INSERT INTO meal_entries (mealDate, mealName, mealPlanID, mealTypeID, recipeID) VALUES (?, ?, ?, ?, ?)");
  $ins2->execute([$mealDate, $mealName, $mealPlanID, $mealTypeID, $recipeID]);

  // return the inserted entry (fetch by last inserted PK may be tricky because trigger creates ID; fetch latest by idx)
  $stmt3 = $pdo->prepare("SELECT * FROM meal_entries WHERE mealPlanID = ? AND mealDate = ? AND mealTypeID = ? ORDER BY mealEntryID DESC LIMIT 1");
  $stmt3->execute([$mealPlanID, $mealDate, $mealTypeID]);
  $entry = $stmt3->fetch();

  error_log("SAVE: Inserted entry with mealEntryID=" . ($entry ? $entry['mealEntryID'] : 'NULL'));

  $pdo->commit();
  respond(['ok' => true, 'entry' => $entry, 'mealPlanID' => $mealPlanID]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  respond(['ok' => false, 'error' => $e->getMessage()], 500);
}