<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\notification_detail.php
require_once __DIR__ . '/config.php';

$userID = $_SESSION['user_id'] ?? null;
if (!$userID) respond(['ok'=>false,'error'=>'Unauthorized'], 401);

$noticeID = $_GET['id'] ?? '';
if ($noticeID === '') respond(['ok'=>false,'error'=>'Bad id'], 400);

// Base notification + category name
$sql = "SELECT n.noticeID, n.title, n.message, n.is_read, n.created_at,
               n.targetID, n.targetType, n.noticeCateID,
               c.noticeCateName
        FROM notifications n
        LEFT JOIN notification_categories c ON c.noticeCateID = n.noticeCateID
        WHERE n.noticeID = :id AND n.userID = :uid
        LIMIT 1";
$stmt = $pdo->prepare($sql);
$stmt->execute([':id'=>$noticeID, ':uid'=>$userID]);
$N = $stmt->fetch();
if (!$N) respond(['ok'=>false,'error'=>'Not found'], 404);

// Mark read
if ((int)$N['is_read'] !== 1) {
  $pdo->prepare("UPDATE notifications SET is_read=1 WHERE noticeID=:id AND userID=:uid")
      ->execute([':id'=>$noticeID, ':uid'=>$userID]);
  $N['is_read'] = 1;
}

$out = [
  'id'        => $N['noticeID'],
  'category'  => $N['noticeCateName'] ?? 'System',
  'title'     => $N['title'],
  'message'   => $N['message'] ?? '',
  'createdAt' => date(DATE_ATOM, strtotime($N['created_at'])),
  'isRead'    => (int)$N['is_read'] === 1,
];

$cat = $out['category'];
$tID = $N['targetID'];       // varchar(10)
$tTp = $N['targetType'];     // 'Food'|'Donation'|'MealPlan'|'Account'|'System'

// ---------- Category-specific enrichment ----------
switch ($cat) {
  case 'Expiry':
  case 'Inventory': {
    if ($tTp === 'Food' && $tID) {
      // foods + units + storages
      $stmt = $pdo->prepare("
        SELECT f.foodName, f.quantity, f.unitID, f.expiryDate, f.storageID, f.categoryID,
               u.unitName, s.storageName
        FROM foods f
        LEFT JOIN units u    ON u.unitID    = f.unitID
        LEFT JOIN storages s ON s.storageID = f.storageID
        WHERE f.foodID = :fid AND f.userID = :uid
        LIMIT 1");
      $stmt->execute([':fid'=>$tID, ':uid'=>$userID]);
      if ($F = $stmt->fetch()) {
        $out['item'] = [
          'name'            => $F['foodName'],
          'quantity'        => (float)$F['quantity'],
          'unit'            => $F['unitName'],
          'unitID'          => (string)$F['unitID'],
          'expiryISO'       => $F['expiryDate'] ? date('Y-m-d', strtotime($F['expiryDate'])) : null,
          'storageLocation' => $F['storageName'] ?? null,
          'categoryID'      => (string)$F['categoryID'],
        ];
      }
    }
    break;
  }

  case 'MealPlan': {
    // Your meal plan data lives in:
    //   - meal_plan_calendars(mealPlanID, weekStart, userID)
    //   - meal_entries(mealEntryID, mealDate, mealName, mealPlanID, mealTypeID, recipeID)
    // We’ll treat targetID = mealPlanID and surface “today” entries if present,
    // else just show the next/nearest entry.
    $planID = $tTp === 'MealPlan' ? $tID : null;
    $today = date('Y-m-d');

    $out['mealPlan'] = ['dateISO'=>$today, 'planTitle'=>'Meal plan', 'notes'=>null];

    if ($planID) {
      // Fetch today's entry title (or nearest future)
      $stmt = $pdo->prepare("
        SELECT me.mealDate, me.mealName
        FROM meal_entries me
        WHERE me.mealPlanID = :pid
        ORDER BY
          (me.mealDate >= :today) DESC,  -- prefer today/future
          ABS(DATEDIFF(me.mealDate, :today)) ASC
        LIMIT 1");
      $stmt->execute([':pid'=>$planID, ':today'=>$today]);
      if ($ME = $stmt->fetch()) {
        $out['mealPlan'] = [
          'dateISO'   => $ME['mealDate'] ? date('Y-m-d', strtotime($ME['mealDate'])) : $today,
          'planTitle' => $ME['mealName'] ?: 'Meal plan',
          'notes'     => null,
        ];
      }
    }
    break;
  }

  case 'Donation': {
    if ($tTp === 'Donation' && $tID) {
      // donations + foods + units
      $stmt = $pdo->prepare("
        SELECT d.donationID, d.pickupLocation,
               f.foodName, f.quantity, f.unitID, f.expiryDate,
               u.unitName
        FROM donations d
        LEFT JOIN foods f ON f.foodID = d.foodID AND f.userID = d.userID
        LEFT JOIN units u ON u.unitID = f.unitID
        WHERE d.donationID = :did AND d.userID = :uid
        LIMIT 1");
      $stmt->execute([':did'=>$tID, ':uid'=>$userID]);
      if ($D = $stmt->fetch()) {
        $out['item'] = [
          'name'      => $D['foodName'],
          'quantity'  => isset($D['quantity']) ? (float)$D['quantity'] : null,
          'unit'      => $D['unitName'],
          'expiryISO' => $D['expiryDate'] ? date('Y-m-d', strtotime($D['expiryDate'])) : null,
        ];

        // pickup_times.pickTime format example: "2025-10-29, 14:23 - 17:55"
        $slots = [];
        $s = $pdo->prepare("SELECT pickTime FROM pickup_times WHERE donationID = :did ORDER BY pickTime ASC");
        $s->execute([':did'=>$tID]);
        foreach ($s->fetchAll() as $row) {
          $pt = trim($row['pickTime'] ?? '');
          if ($pt !== '') {
            // Robust parse: split by comma, then by '-'
            // Accepts "YYYY-MM-DD, HH:MM - HH:MM" or "DD/MM/YYYY, HH:MM - HH:MM"
            $parts = explode(',', $pt, 2);
            $dateStr = trim($parts[0] ?? '');
            $times   = trim($parts[1] ?? '');
            $from = null; $to = null; $iso = null;

            // parse date (try Y-m-d, then d/m/Y)
            $d1 = DateTime::createFromFormat('Y-m-d', $dateStr);
            if ($d1) { $iso = $d1->format('Y-m-d'); }
            else {
              $d2 = DateTime::createFromFormat('d/m/Y', $dateStr);
              if ($d2) $iso = $d2->format('Y-m-d');
            }

            if (strpos($times, '-') !== false) {
              [$fromStr, $toStr] = array_map('trim', explode('-', $times, 2));
              // normalize hh:mm
              $from = substr($fromStr, 0, 5);
              $to   = substr($toStr,   0, 5);
            }

            $slots[] = ['date'=>$iso, 'from'=>$from, 'to'=>$to];
          }
        }

        $out['donation'] = [
          'location' => $D['pickupLocation'] ?? null,
          'slots'    => $slots,
        ];
      }
    }
    break;
  }

  case 'System': {
    // no extra fields
    break;
  }

  case 'Account': {
    // use message as the change summary
    $out['account'] = ['change' => $N['message'] ?? 'Account setting updated'];
    break;
  }
}

respond(['ok'=>true, 'data'=>$out]);
