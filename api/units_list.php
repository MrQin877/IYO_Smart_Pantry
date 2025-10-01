<?php
// api/units_list.php
require __DIR__ . '/config.php';

try {
  $stmt = $pdo->query("SELECT unitID AS id, unitName AS name FROM units ORDER BY unitName");
  $rows = $stmt->fetchAll();
  respond(['ok' => true, 'data' => $rows]); // [{id,name},...]
} catch (Throwable $e) {
  respond(['ok' => false, 'error' => 'DB error'], 500);
}
