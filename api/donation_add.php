<?php
require_once __DIR__ . '/config.php';

function s($v){ return is_string($v) ? trim($v) : ''; }

function format_address_multiline(array $a): string {
  $label   = s($a['label'] ?? '');
  $line1   = s($a['line1'] ?? '');
  $line2   = s($a['line2'] ?? '');
  $postcode= s($a['postcode'] ?? '');
  $city    = s($a['city'] ?? '');
  $state   = s($a['state'] ?? '');
  $country = s($a['country'] ?? '');
  $lines = [];
  $firstLine = trim(($label ? $label.', ' : '').$line1);
  if ($firstLine !== '') $lines[] = $firstLine;
  if ($line2 !== '') $lines[] = $line2;
  $tail = implode(', ', array_filter([$postcode, $city, $state, $country]));
  if ($tail !== '') $lines[] = $tail;
  return implode("\n", $lines);
}

function format_picktime_string(array $slot): string {
  $date = s($slot['date'] ?? '');
  $start= s($slot['start']?? '');
  $end  = s($slot['end']  ?? '');
  $note = s($slot['note'] ?? '');
  if ($date === '') return '';
  $window = $start && $end ? "$start - $end" : ($start ?: $end);
  $core = $window ? "$date, $window" : $date;
  return $note ? "$core ($note)" : $core;
}

$d = json_input();

$userID = $_SESSION['userID'] ?? null;
if (!$userID) {
  respond(['ok'=>false,'error'=>'Not authenticated'], 401);
}
if (empty($d['contact'])) respond(['ok'=>false,'error'=>'Missing contact'],400);
if (empty($d['food']) || !is_array($d['food'])) respond(['ok'=>false,'error'=>'Missing food'],400);

$food = $d['food'];
$needFood = ['name','quantity','expiryDate','categoryID','unitID'];
foreach ($needFood as $k) {
  if (empty($food[$k])) respond(['ok'=>false,'error'=>"Missing food.$k"],400);
}

$pickupLocation = format_address_multiline($d['address'] ?? []);
$slots = is_array($d['availability'] ?? null) ? $d['availability'] : [];

try {
  $pdo->beginTransaction();

  // 1️⃣ Insert into FOODS
  $sqlFood = "INSERT INTO foods
    (foodName, quantity, expiryDate, is_plan, remark, storageID, userID, categoryID, unitID)
    VALUES (:foodName, :quantity, :expiryDate, 0, :remark, NULL, :userID, :categoryID, :unitID)";
  $stmt = $pdo->prepare($sqlFood);
  $stmt->execute([
    ':foodName'   => $food['name'],
    ':quantity'   => (float)$food['quantity'],
    ':expiryDate' => $food['expiryDate'],
    ':remark'     => $food['remark'] ?? null,
    ':userID'     => $userID,
    ':categoryID' => $food['categoryID'],
    ':unitID'     => $food['unitID'],
  ]);

  // get generated foodID
  $qFood = $pdo->prepare("SELECT foodID FROM foods WHERE userID = :uid ORDER BY CAST(SUBSTRING(foodID,2) AS UNSIGNED) DESC LIMIT 1");
  $qFood->execute([':uid'=>$userID]);
  $foodID = $qFood->fetchColumn();
  if (!$foodID) throw new RuntimeException('Failed to fetch foodID');

  // 2️⃣ Insert into DONATIONS
  $sqlDon = "INSERT INTO donations
    (quantity, contact, note, pickupLocation, foodID, userID)
    VALUES (:quantity, :contact, :note, :pickupLocation, :foodID, :userID)";
  $stmt2 = $pdo->prepare($sqlDon);
  $stmt2->execute([
    ':quantity'       => (float)$food['quantity'],
    ':contact'        => $d['contact'],
    ':note'           => $d['donationNote'] ?? null,
    ':pickupLocation' => $pickupLocation,
    ':foodID'         => $foodID,
    ':userID'         => $userID,
  ]);

  // get donationID
  $qDon = $pdo->prepare("SELECT donationID FROM donations WHERE userID = :uid ORDER BY CAST(SUBSTRING(donationID,2) AS UNSIGNED) DESC LIMIT 1");
  $qDon->execute([':uid'=>$userID]);
  $donationID = $qDon->fetchColumn();
  if (!$donationID) throw new RuntimeException('Failed to fetch donationID');

  // 3️⃣ Deduct from FOOD quantity when donation made
  $stmt3 = $pdo->prepare("UPDATE foods SET quantity = quantity - :donQty WHERE foodID = :fid");
  $stmt3->execute([':donQty' => (float)$food['quantity'], ':fid' => $foodID]);

  // 4️⃣ Insert pickup times
  if (!empty($slots)) {
    $stmt4 = $pdo->prepare("INSERT INTO pickup_times (pickTime, donationID) VALUES (:pickTime, :donationID)");
    foreach ($slots as $s) {
      $ptxt = format_picktime_string($s);
      if ($ptxt === '') continue;
      $stmt4->execute([
        ':pickTime'   => $ptxt,
        ':donationID' => $donationID,
      ]);
    }
  }

  $pdo->commit();
  respond(['ok'=>true, 'donationID'=>$donationID, 'foodID'=>$foodID]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  error_log('donation_add: '.$e->getMessage());
  respond(['ok'=>false,'error'=>$e->getMessage()],500);
}
