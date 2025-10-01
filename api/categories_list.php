<?php
// api/categories_list.php
require __DIR__ . '/config.php';

try {
  $stmt = $pdo->query("SELECT categoryID AS id, categoryName AS name FROM categories ORDER BY categoryName");
  $rows = $stmt->fetchAll();
  respond(['ok' => true, 'data' => $rows]); // [{id,name},...]
} catch (Throwable $e) {
  respond(['ok' => false, 'error' => 'DB error'], 500);
}
