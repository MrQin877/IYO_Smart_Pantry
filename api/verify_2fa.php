<?php
require __DIR__ . '/config.php';

$body = json_input();
$email = strtolower(trim($body['email'] ?? ''));
$code = trim($body['code'] ?? '');
$password = trim($body['password'] ?? '');

if (!$email || !$code) {
  respond(['ok' => false, 'error' => 'Missing input']);
}

if (
  !isset($_SESSION['verify_email']) ||
  !isset($_SESSION['verify_code']) ||
  !isset($_SESSION['verify_expire'])
) {
  respond(['ok' => false, 'error' => 'No verification in progress']);
}

// Check expiry
if (time() > $_SESSION['verify_expire']) {
  unset($_SESSION['verify_code']);
  respond(['ok' => false, 'error' => 'Code expired']);
}

// Check code & email match
if ($_SESSION['verify_email'] !== $email || $_SESSION['verify_code'] !== $code) {
  respond(['ok' => false, 'error' => 'Invalid code']);
}

// ✅ Verification success: handle based on context
if ($password) {
  // Registration verification (set password)
  if (strlen($password) < 8) {
    respond(['ok' => false, 'error' => 'Password must be at least 8 characters']);
  }
  $hashed = password_hash($password, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare("UPDATE users SET password=?, status='Active' WHERE email=?");
  $stmt->execute([$hashed, $email]);
} else {
  // Login 2FA verification (don’t change password)
  $stmt = $pdo->prepare("UPDATE users SET status='Active' WHERE email=?");
  $stmt->execute([$email]);
}

// Clear session
unset($_SESSION['verify_email'], $_SESSION['verify_code'], $_SESSION['verify_expire']);

respond(['ok' => true, 'message' => 'Account verified successfully']);
?>
