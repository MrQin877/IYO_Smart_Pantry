<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\config.php

// Session (如不需要可删)
session_name('IYOSESSID');
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

date_default_timezone_set('Asia/Kuala_Lumpur');

// 建议：线上关闭屏幕报错，避免污染 JSON；调试时可改为 1
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// 统一返回 JSON
function respond($arr, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

// 读取 JSON/POST/GET
function json_input() {
  $raw = file_get_contents('php://input');
  $d = json_decode($raw, true);
  if (is_array($d)) return $d;
  if (!empty($_POST)) return $_POST;
  if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($_GET)) return $_GET;
  return [];
}

// （可选）CORS：仅在 vite 开发时需要
// header('Access-Control-Allow-Origin: http://localhost:5173');
// header('Access-Control-Allow-Credentials: true');
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// --- PDO 连接（核心） ---
$dsn  = 'mysql:host=localhost;dbname=iyo_smart_pantry;charset=utf8mb4';
$user = 'root';
$pass = '';

$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
  // 这里一定要叫 $pdo ！！其他文件都会用到这个变量名
  $pdo = new PDO($dsn, $user, $pass, $options);
} catch (Throwable $e) {
  respond(['ok' => false, 'error' => 'DB connect failed'], 500);
}
