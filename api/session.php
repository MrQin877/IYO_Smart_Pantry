<?php
require __DIR__ . '/config.php';

$secure   = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
session_set_cookie_params([
  'lifetime' => 0,
  'path'     => '/',
  'domain'   => '',
  'secure'   => $secure,
  'httponly' => true,
  'samesite' => 'Lax',
]);

session_start();
header('Content-Type: application/json; charset=utf-8');

if (!empty($_SESSION['user'])) {
  respond(['ok'=>true, 'user'=>$_SESSION['user']]);
}
respond(['ok'=>false, 'user'=>null], 401);
