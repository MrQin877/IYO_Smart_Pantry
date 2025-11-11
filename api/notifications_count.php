<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\notifications_count.php
require_once __DIR__ . '/config.php';

// Never cache this endpoint
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Content-Type: application/json; charset=utf-8');

$userID = $_SESSION['userID'] ?? null;
if (!$userID) {
  echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
  http_response_code(401);
  exit;
}

$st = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE userID = :u AND is_read = 0");
$st->execute([':u' => $userID]);
$count = (int)$st->fetchColumn();

echo json_encode(['ok' => true, 'count' => $count]);
