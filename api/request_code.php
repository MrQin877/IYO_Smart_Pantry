<?php
require __DIR__ . '/config.php';
require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$body = json_input();
$email = strtolower(trim($body['email'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(['ok' => false, 'error' => 'Invalid email']);
}

// 新验证码
$code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
$_SESSION['verify_email'] = $email;
$_SESSION['verify_code'] = $code;
$_SESSION['verify_expire'] = time() + 60;

// 寄信
$mail = new PHPMailer(true);
try {
  $mail->isSMTP();
  $mail->Host = 'smtp.gmail.com';
  $mail->SMTPAuth = true;
  $mail->Username = 'elainliow@gmail.com'; 
  $mail->Password = 'akse gbpy etdl iiax'; 
  $mail->SMTPSecure = 'tls';
  $mail->Port = 587;

  $mail->setFrom('elainliow@gmail.com', 'IYO Smart Pantry');
  $mail->addAddress($email);
  $mail->isHTML(true);
  $mail->Subject = 'Your New Verification Code';
  $mail->Body = "Your new code is <b>$code</b>. It expires in 6 seconds.";

  $mail->send();
  respond(['ok' => true, 'message' => 'New code sent']);
} catch (Exception $e) {
  respond(['ok' => false, 'error' => $mail->ErrorInfo]);
}
