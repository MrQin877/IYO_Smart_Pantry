<?php
require __DIR__ . '/config.php';

$body = json_input();
$email = strtolower(trim($body['email'] ?? ''));
$code = trim($body['code'] ?? '');

if (!$email || !$code) {
  respond(['ok' => false, 'error' => 'Missing input']);
}

if (
  !isset($_SESSION['verify_email']) ||
  !isset($_SESSION['verify_code']) ||
  !isset($_SESSION['verify_expire'])
) {
  respond(['ok' => false, 'error' => 'No verification in progress']);
}

// 检查是否过期
if (time() > $_SESSION['verify_expire']) {
  unset($_SESSION['verify_code']);
  respond(['ok' => false, 'error' => 'Code expired']);
}

// 核对验证码与邮箱
if ($_SESSION['verify_email'] !== $email || $_SESSION['verify_code'] !== $code) {
  respond(['ok' => false, 'error' => 'Invalid code']);
}

// 验证成功：更新用户状态
$stmt = $pdo->prepare("UPDATE users SET status='Active' WHERE email=?");
$stmt->execute([$email]);

// 清除 session
unset($_SESSION['verify_email'], $_SESSION['verify_code'], $_SESSION['verify_expire']);

respond(['ok' => true, 'message' => 'Account verified successfully']);
