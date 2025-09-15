<?php
// api/config.php

// 1) Session（OTP 需要）
session_name('IYOSESSID');
session_start();

header('Content-Type: application/json; charset=utf-8');

// 3) 可选 CORS（同源不需要；如果用 Vite 5173 开发服才打开下两行）
// header('Access-Control-Allow-Origin: http://localhost:5173');
// header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ exit; }

// 4) PDO 连接
$dsn  = 'mysql:host=localhost;dbname=iyo_smart_pantry;charset=utf8mb4';
$user = 'root';
$pass = '';

$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  // 可选：禁用模拟预处理，防止某些 edge case
  // PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
  $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok'=>false,'error'=>'DB connect failed']);
  exit;
}

// 5) 小工具
function json_input() {
  $raw = file_get_contents('php://input');
  $d = json_decode($raw, true);
  if (is_array($d)) return $d;
  if (!empty($_POST)) return $_POST;
  if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($_GET)) return $_GET;
  return [];
}

function respond($arr, $code=200){
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($arr);
  exit;
}
