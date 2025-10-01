<?php
// api/units_list.php
require __DIR__ . '/config.php';

$sql = "SELECT unitID AS id, unitName AS name FROM units ORDER BY name";
$res = $mysqli->query($sql);
$data = [];
while ($row = $res->fetch_assoc()) $data[] = $row;

send_json(['ok'=>true, 'data'=>$data]);
