<?php
// api/categories_list.php
require __DIR__ . '/config.php';

$sql = "SELECT categoryID AS id, categoryName AS name FROM categories ORDER BY name";
$res = $mysqli->query($sql);
$data = [];
while ($row = $res->fetch_assoc()) $data[] = $row;

send_json(['ok'=>true, 'data'=>$data]);
