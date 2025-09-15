<?php
require __DIR__ . '/config.php';   // this should start the session (guarded)

// Optional: ensure clean JSON output
header('Content-Type: application/json; charset=utf-8');

// Read JSON
$body = json_input();
$email = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';

// Validate input (align rules with frontend)
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
  respond(['ok' => false, 'error' => 'Invalid input'], 422);
}

// Find user
$stmt = $pdo->prepare('SELECT userID, password, status FROM USERS WHERE email=? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
  respond(['ok' => false, 'error' => 'User not found'], 404);
}

if ($user['status'] !== 'Active') {
  respond(['ok' => false, 'error' => 'Account not activated'], 403);
}

// Verify password
if (!password_verify($password, $user['password'])) {
  respond(['ok' => false, 'error' => 'Wrong email or password'], 401);
}

// Set session (if you need it)
$_SESSION['userID'] = $user['userID'];

// Success
respond(['ok' => true, 'userID' => $user['userID']]);
