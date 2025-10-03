<?php
// api/units_list.php
require __DIR__ . '/config.php';

try {
  $stmt = $pdo->query("SELECT storageID AS id, storageName AS name FROM storages ORDER BY storageName");
  $rows = $stmt->fetchAll();
  respond(['ok' => true, 'data' => $rows]); // [{id,name},...]
} catch (Throwable $e) {
  respond(['ok' => false, 'error' => 'DB error'], 500);
}