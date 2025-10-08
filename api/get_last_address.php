<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\get_last_address.php
require_once __DIR__ . '/config.php';

$userID = $_GET['userID'] ?? '';
if (!$userID) {
  respond(['ok' => false, 'error' => 'Missing userID'], 400);
}

/**
 * Example pickupLocation formats we try to handle:
 *  1) "Label, Line 1\nLine 2\n12300, BUTTERWORTH, PULAU PINANG, Malaysia"
 *  2) "Line 1\n12300, City, State, Country"
 *  3) Any other messy variants — we return whatever we can parse safely
 */
function parse_pickup_location(?string $txt): ?array {
  if (!$txt) return null;

  // Normalize newlines and trim each line
  $txt = str_replace(["\r\n", "\r"], "\n", $txt);
  $lines = array_values(array_filter(array_map('trim', explode("\n", $txt)), fn($x) => $x !== ''));
  if (count($lines) === 0) return null;

  $label   = '';
  $line1   = '';
  $line2   = '';
  $postcode= '';
  $city    = '';
  $state   = '';
  $country = '';

  // Heuristic:
  // - Last line is likely: "POSTCODE, CITY, STATE, COUNTRY"
  // - First line may be "Label, Line 1" OR just "Line 1"
  // - Second line (if present) is Line 2
  $last = $lines[count($lines)-1];

  // Try to split the last line by commas
  $parts = array_values(array_filter(array_map('trim', explode(',', $last)), fn($x)=>$x!==''));
  if (count($parts) >= 2) {
    // If first token is postcode (4–6 digits), treat it as such
    if (preg_match('/^\d{4,6}$/', $parts[0])) {
      $postcode = $parts[0];
      $city     = $parts[1] ?? '';
      $state    = $parts[2] ?? '';
      $country  = $parts[3] ?? '';
    } else {
      // No obvious postcode; treat them as city/state/country
      $city     = $parts[0] ?? '';
      $state    = $parts[1] ?? '';
      $country  = $parts[2] ?? '';
    }
    // Remove tail line from list so first/second lines map to line1/line2
    array_pop($lines);
  }

  // Now parse the first line (might be "Label, Line 1" or just line1)
  if (!empty($lines)) {
    $first = array_shift($lines);
    $p = array_map('trim', explode(',', $first, 2));
    if (count($p) === 2) {
      // "Label, Line 1"
      $label = $p[0];
      $line1 = $p[1];
    } else {
      // Just line1
      $line1 = $p[0];
    }
  }

  // If another line remains, treat as line2
  if (!empty($lines)) {
    $line2 = array_shift($lines);
  }

  return [
    'label'    => $label,
    'line1'    => $line1,
    'line2'    => $line2,
    'postcode' => $postcode,
    'city'     => $city,
    'state'    => $state,
    'country'  => $country,
  ];
}

try {
  // Get the latest donation by donationID numeric part
  $sql = "
    SELECT pickupLocation
    FROM donations
    WHERE userID = :uid
    ORDER BY CAST(SUBSTRING(donationID, 2) AS UNSIGNED) DESC
    LIMIT 1
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([':uid' => $userID]);
  $row = $stmt->fetch();

  if (!$row || empty($row['pickupLocation'])) {
    respond(['ok' => true, 'address' => null]);
  }

  $parsed = parse_pickup_location($row['pickupLocation']);
  respond(['ok' => true, 'address' => $parsed]);

} catch (Throwable $e) {
  error_log("get_last_address error: " . $e->getMessage());
  respond(['ok' => false, 'error' => 'DB error'], 500);
}
