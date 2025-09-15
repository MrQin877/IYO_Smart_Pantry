<?php
require __DIR__.'/config.php';

$data = json_input();
$code = trim($data['code'] ?? '');
$new  = $data['newPassword'] ?? '';

if (!isset($_SESSION['reg_email'], $_SESSION['reg_otp'], $_SESSION['reg_exp'])) {
  respond(['ok'=>false,'error'=>'Session expired. Please register again.'], 440);
}
if (time() > $_SESSION['reg_exp']) {
  unset($_SESSION['reg_email'], $_SESSION['reg_userID'], $_SESSION['reg_otp'], $_SESSION['reg_exp'], $_SESSION['reg_tries']);
  respond(['ok'=>false,'error'=>'Code expired. Please request a new code.'], 410);
}

// 防爆破：最多 5 次
$_SESSION['reg_tries'] = ($_SESSION['reg_tries'] ?? 0) + 1;
if ($_SESSION['reg_tries'] > 5) {
  unset($_SESSION['reg_email'], $_SESSION['reg_userID'], $_SESSION['reg_otp'], $_SESSION['reg_exp'], $_SESSION['reg_tries']);
  respond(['ok'=>false,'error'=>'Too many attempts. Request a new code.'], 429);
}

if (!preg_match('/^\d{6}$/', $code)) {
  respond(['ok'=>false,'error'=>'Invalid code format'], 400);
}
if (!preg_match('/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?]).{8,}$/', $new)) {
  respond(['ok'=>false,'error'=>'Weak password'], 400);
}
if ($code !== $_SESSION['reg_otp']) {
  respond(['ok'=>false,'error'=>'Wrong code'], 400);
}

// ✅ 激活 + 更新密码
$email   = $_SESSION['reg_email'];
$newHash = password_hash($new, PASSWORD_DEFAULT);

$pdo->prepare('UPDATE USERS SET password=?, status="Active" WHERE email=?')->execute([$newHash, $email]);

// 清理本流程的 Session
unset($_SESSION['reg_email'], $_SESSION['reg_userID'], $_SESSION['reg_otp'], $_SESSION['reg_exp'], $_SESSION['reg_tries']);

respond(['ok'=>true,'message'=>'Account activated']);
