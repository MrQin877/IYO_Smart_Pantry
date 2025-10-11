<?php
require __DIR__ . '/config.php';    // starts the IYOSESSID session
header('Content-Type: application/json; charset=utf-8');

if (!empty($_SESSION['user'])) {
  respond(['ok' => true, 'user' => $_SESSION['user']]);
}
// (Optional backward compat: fall back to userID if you still have old sessions)
if (!empty($_SESSION['userID'])) {
  respond(['ok' => true, 'user' => ['id' => $_SESSION['userID']]]);
}

respond(['ok' => false, 'user' => null], 401);
