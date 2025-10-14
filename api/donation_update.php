<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\donation_update.php
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
  // Expects keys: date (dd/mm/yyyy or yyyy-mm-dd), start, end, note
  $date = s($slot['date'] ?? '');
  $start= s($slot['start']?? '');
  $end  = s($slot['end']  ?? '');
  $note = s($slot['note'] ?? '');
  if ($date === '') return '';
  $window = ($start && $end) ? "$start - $end" : ($start ?: $end);
  $core = $window ? "$date, $window" : $date;
  return $note ? "$core ($note)" : $core;
}

/**
 * Normalize incoming availability into an array of strings:
 * - accepts 'availabilityTimes' pipe string: "dd/mm/yyyy, HH:MM - HH:MM|..."
 * - accepts 'slots' or 'availability' as array of {date,start,end,note}
 * - accepts 'availability'/'pickup_times' as array of already-formatted strings
 */
function normalize_availability($d): array {
  // 1) Pipe-joined string
  $pipe = $d['availabilityTimes'] ?? null;
  if (is_string($pipe)) {
    $pipe = trim($pipe);
    if ($pipe === '') return [];
    return array_values(array_filter(array_map('trim', explode('|', $pipe))));
  }

  // 2) JSON arrays (prefer 'slots', fallback 'availability', 'pickup_times')
  foreach (['slots','availability','pickup_times'] as $k) {
    if (isset($d[$k]) && is_array($d[$k])) {
      $arr = $d[$k];
      $out = [];
      foreach ($arr as $item) {
        if (is_string($item)) {
          $t = trim($item);
          if ($t !== '') $out[] = $t;
          continue;
        }
        if (is_array($item)) {
          if (!empty($item['pickTime']) && is_string($item['pickTime'])) {
            $t = trim($item['pickTime']);
            if ($t !== '') $out[] = $t;
            continue;
          }
          $t = format_picktime_string($item);
          if ($t !== '') $out[] = $t;
        }
      }
      return $out;
    }
  }

  return [];
}

try {
  $d = json_input();

  // Detect whether the client actually included availability in this request
  $hasTimes = array_key_exists('availabilityTimes', $d)
           || array_key_exists('slots', $d)
           || array_key_exists('availability', $d)
           || array_key_exists('pickup_times', $d);

  // Authentication via session (adjust if you want to allow posted userID instead)
  $userID = $_SESSION['userID'] ?? null;
  if (!$userID) {
    // Optional fallback: $userID = s($d['userID'] ?? '');
    // if ($userID === '') respond(['ok'=>false,'error'=>'Not authenticated'], 401);
    respond(['ok'=>false,'error'=>'Not authenticated'], 401);
  }

  $donationID = s($d['donationID'] ?? '');
  if ($donationID === '') {
    respond(['ok'=>false,'error'=>'Missing donationID'], 400);
  }

  // Optional fields (null = do not modify)
  $contact = array_key_exists('contact', $d) ? s($d['contact']) : null;
  $note    = array_key_exists('note',    $d) ? s($d['note'])    : null;

  // Address (may be empty → if explicitly provided, clear; else leave unchanged)
  $address = is_array($d['address'] ?? null) ? $d['address'] : [];
  $pickupLocation = format_address_multiline($address); // can be empty string

  // Availability: only normalize if the client actually sent it
  $times = null; // null means "leave pickup_times unchanged"
  if ($hasTimes) {
    $times = normalize_availability($d); // array of strings; can be empty
  }

  $pdo->beginTransaction();

  // Ownership check with row lock
  $q = $pdo->prepare("SELECT donationID FROM donations WHERE donationID = :did AND userID = :uid FOR UPDATE");
  $q->execute([':did'=>$donationID, ':uid'=>$userID]);
  $owned = $q->fetchColumn();
  if (!$owned) {
    $pdo->rollBack();
    respond(['ok'=>false,'error'=>'Donation not found or not owned'], 404);
  }

  // Build UPDATE for donations table (only update provided fields)
  $sets = [];
  $params = [':did'=>$donationID];

  if ($pickupLocation !== '') {
    $sets[] = "pickupLocation = :loc";
    $params[':loc'] = $pickupLocation;
  } else if (isset($d['address'])) {
    // address explicitly provided but built empty → clear
    $sets[] = "pickupLocation = NULL";
  }

  if ($contact !== null) {
    if ($contact === '') {
      $sets[] = "contact = NULL";
    } else {
      $sets[] = "contact = :contact";
      $params[':contact'] = $contact;
    }
  }

  if ($note !== null) {
    if ($note === '') {
      $sets[] = "note = NULL";
    } else {
      $sets[] = "note = :note";
      $params[':note'] = $note;
    }
  }

  if (!empty($sets)) {
    $sql = "UPDATE donations SET ".implode(', ', $sets)." WHERE donationID = :did";
    $upd = $pdo->prepare($sql);
    $upd->execute($params);
  }

  // Replace pickup times ONLY if client provided availability in this request
  if ($hasTimes) {
    // If you NEVER want to allow clearing all slots, block empty here:
    if (empty($times)) {
      $pdo->rollBack();
      respond(['ok'=>false,'error'=>'At least one pickup time is required'], 400);
    }

    // Simple replace strategy
    $pdo->prepare("DELETE FROM pickup_times WHERE donationID = :did")
        ->execute([':did' => $donationID]);

    $ins = $pdo->prepare("INSERT INTO pickup_times (pickTime, donationID) VALUES (:t, :did)");
    foreach ($times as $t) {
      $t = trim((string)$t);
      if ($t === '') continue;

      // (Optional) format sanity check:
      // if (!preg_match('/^\d{2}\/\d{2}\/\d{4},\s[0-2]\d:[0-5]\d\s-\s[0-2]\d:[0-5]\d(?:\s\(.{0,100}\))?$/', $t)) {
      //   continue; // or rollback + 400
      // }

      $ins->execute([':t' => $t, ':did' => $donationID]);
    }
  }

  $pdo->commit();
  respond([
    'ok' => true,
    'donationID' => $donationID,
    'updatedTimes' => $hasTimes ? count($times) : null
  ]);

} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  error_log('donation_update: '.$e->getMessage());
  respond(['ok'=>false,'error'=>'DB error'], 500);
}
