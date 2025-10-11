<?php
require __DIR__ . '/config.php';
respond([
  'ok' => true,
  'userID' => $_SESSION['userID'] ?? null
]);
