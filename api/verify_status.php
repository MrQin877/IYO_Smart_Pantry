<?php
require __DIR__.'/config.php';

if (!isset($_SESSION['reg_email'], $_SESSION['reg_otp'], $_SESSION['reg_exp'])) {
  respond(['ok'=>false,'error'=>'No pending verification'], 400);
}

respond([
  'ok'=>true,
  'email'=>$_SESSION['reg_email'],
  'remain'=> max(0, $_SESSION['reg_exp'] - time()) // 剩余秒数
]);
