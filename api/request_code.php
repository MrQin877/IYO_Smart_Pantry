<?php
require __DIR__.'/config.php';

$data = json_input();
$email = strtolower(trim($data['email'] ?? ''));

if (!isset($_SESSION['reg_email']) || $_SESSION['reg_email'] !== $email) {
  respond(['ok'=>false,'error'=>'No active registration session'], 400);
}

$otp = str_pad(strval(random_int(0,999999)), 6, '0', STR_PAD_LEFT);
$_SESSION['reg_otp']   = $otp;
$_SESSION['reg_exp']   = time() + 1800;
$_SESSION['reg_tries'] = 0;

// 可在此发邮件；开发期直接返回
respond(['ok'=>true, 'dev_otp'=>$otp]);
