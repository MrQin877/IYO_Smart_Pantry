<?php
require __DIR__.'/config.php';
session_start();
error_log("SESSION userID: " . ($_SESSION['userID'] ?? 'none'));

header('Content-Type: application/json');

$userID = $_SESSION['userID'] ?? null;

// For local dev (no login session)
if (!$userID) {
  $tmp = json_decode(file_get_contents('php://input'), true);
  if (isset($tmp['userID'])) $userID = $tmp['userID'];
}

if (!$userID) {
  echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
  exit;
}

try {
  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare('SELECT twoFA FROM USERS WHERE userID = ?');
    $stmt->execute([$userID]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // ✅ Debug
    error_log("Fetched twoFA for user $userID: " . json_encode($result));

    echo json_encode(['ok' => true, 'settings' => $result]);
    exit;
  }


  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $twoFA = isset($body['twoFA']) ? (int)$body['twoFA'] : 0;

    $stmt = $pdo->prepare('UPDATE USERS SET twoFA = ? WHERE userID = ?');
    $stmt->execute([$twoFA, $userID]);

    echo json_encode(['ok' => true, 'message' => 'Settings updated']);
    exit;
  }

  echo json_encode(['ok' => false, 'error' => 'Invalid request']);
} catch (Exception $e) {
  echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
