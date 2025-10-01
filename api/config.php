<?php
// Session (if you need cookies)
session_name('IYOSESSID');
session_start();

// CORS: enable when calling from Vite (http://localhost:5173)
if (isset($_SERVER['HTTP_ORIGIN'])) {
  if (preg_match('~^https?://localhost(:5173)?$~', $_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
  }
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
  exit;
}

// ---- DB (mysqli to match your other files) ----
$DB_HOST = '127.0.0.1';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'iyo_smart_pantry';

$mysqli = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok'=>false, 'error'=>'DB connect failed', 'detail'=>$mysqli->connect_error]);
  exit;
}
$mysqli->set_charset('utf8mb4');

// ---- Helpers (both names for compatibility) ----
function read_json() {
  $raw = file_get_contents('php://input');
  $d = json_decode($raw, true);
  if (is_array($d)) return $d;
  if (!empty($_POST)) return $_POST;
  if (!empty($_GET))  return $_GET;
  return [];
}

function send_json($arr, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($arr);
  exit;
}

// Aliases so older/newer files work the same
function json_input() { return read_json(); }
function respond($arr, $code = 200) { return send_json($arr, $code); }
