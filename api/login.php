<?php
require __DIR__ . '/config.php';

// Always return JSON
header('Content-Type: application/json; charset=utf-8');

// Read JSON from frontend
$data = json_input();
$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';

// Validate inputs
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
  respond(['ok' => false, 'error' => 'Invalid email or password format'], 422);
}

// Find user — match your table name exactly (MySQL is case-sensitive in some systems)
$stmt = $pdo->prepare("SELECT userID, fullName, password, status FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
  respond(['ok' => false, 'error' => 'User not found'], 404);
}

if ($user['status'] !== 'Active') {
  respond(['ok' => false, 'error' => 'Account not active'], 403);
}

// Verify hashed password
if (!password_verify($password, $user['password'])) {
  respond(['ok' => false, 'error' => 'Incorrect password'], 401);
}

$_SESSION['userID'] = $user['userID'];
$_SESSION['email'] = $user['email'];
$_SESSION['fullName'] = $user['fullName']??'';

// ✅ Return success response to frontend
respond([
  'ok' => true,
  'userID' => $user['userID'],
  'fullName' => $user['fullName'],
  'message' => 'Login successful'
]);
