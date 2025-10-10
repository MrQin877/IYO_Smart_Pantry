<?php
require __DIR__ . '/config.php';
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$body = json_input();
$name = trim($body['fullName'] ?? '');
$email = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';
$household = intval($body['householdSize'] ?? 1);


// Username validation
// Allow only letters (a–z, A–Z) and spaces, length between 2–50 characters
if (!preg_match("/^[a-zA-Z\s]{2,50}$/", $name)) {
  respond(['ok' => false, 'error' => 'Invalid name: only letters and spaces allowed (2–50 characters)']);
}


// Email and password validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(['ok' => false, 'error' => 'Invalid email address']);
}

if (strlen($password) < 8) {
  respond(['ok' => false, 'error' => 'Password must be at least 8 characters']);
}

// 检查邮箱是否已注册
$stmt = $pdo->prepare("SELECT userID FROM users WHERE email=? LIMIT 1");
$stmt->execute([$email]);
if ($stmt->fetch()) {
  respond(['ok' => false, 'error' => 'Email already registered']);
}

// 插入用户（status = Pending）
$stmt = $pdo->prepare("
  INSERT INTO users (fullName, email, password, householdSize, twoFA, status, createdAt)
  VALUES (?, ?, ?, ?, 1, 'Pending', NOW())
");
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt->execute([$name, $email, $hash, $household]);

// 产生验证码（6位）
$code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
$_SESSION['verify_email'] = $email;
$_SESSION['verify_code'] = $code;
$_SESSION['verify_expire'] = time() + 60; // 1分钟有效

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
  $mail->addAddress($email, $name);
  $mail->isHTML(true);
  $mail->Subject = 'Your Verification Code';
  $mail->Body = "<p>Hello $name,</p><p>Your verification code is <b>$code</b>.</p><p>It expires in 1 minutes.</p>";

  $mail->send();
  respond(['ok' => true, 'message' => 'Verification code sent.']);
} catch (Exception $e) {
  respond(['ok' => false, 'error' => 'Mailer Error: ' . $mail->ErrorInfo]);
}
