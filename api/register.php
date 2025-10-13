<?php
require __DIR__ . '/config.php';
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$body = json_input();
$name = trim($body['fullName'] ?? '');
$email = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';
$household = $body['householdSize'] ?? null;
if ($household === "NA" || $household === null || $household === "") {
  $household = null; // store as NULL in DB
} else {
  $household = intval($household);
}


// Name validation
if (!preg_match("/^[A-Za-z\s]{2,50}$/", $name)) {
  respond(['ok' => false, 'error' => 'Invalid name: only letters and spaces allowed (2–50 characters)']);
}

// Email validation
if (!preg_match('/^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/i', $email)) {
  respond(['ok' => false, 'error' => 'Only Gmail, Yahoo or Outlook emails allowed']);
}

// Password validation
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
$_SESSION['verify_expire'] = time() + 60; // 1 minutes

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

  $appName = "IYO Smart Pantry";
  $frontendBase = "http://localhost:5173";
  $verifyLink = "{$frontendBase}/Verify?email=" . urlencode($email) . "&code=" . urlencode($code);

  $mail->Body = "
    <div style='font-family: Arial, Helvetica, sans-serif; color: #222; line-height: 1.4;'>
      <h2 style='margin:0 0 10px 0; color:#303116;'>Welcome to {$appName}, {$name}!</h2>

      <p style='margin:0 0 12px 0;'>Use the <strong>6-digit</strong> verification code below to complete signing in to your account:</p>

      <p style='display:inline-block; font-size:24px; letter-spacing:4px; font-weight:700;
                padding:12px 18px; background:#f5f7fb; border-radius:8px; margin:8px 0;'>
        {$code}
      </p>

      <p style='margin:12px 0 0 0;'>This code will expire in <strong>1 minute</strong>. Do not share it with anyone.</p>

      <p>Or, you can verify directly by clicking the button below:</p>

      <p>
        <a href='{$verifyLink}'
          style='background:#1a73e8; color:#fff; text-decoration:none; 
                  padding:12px 24px; border-radius:6px; display:inline-block; 
                  font-weight:600;'>
          Verify My Email
        </a>
      </p>

      <hr style='border:none; border-top:1px solid #eee; margin:18px 0;'>

      <p style='font-size:13px; color:#666; margin:0;'>If you didn't request this, you can safely ignore this email or <a href='mailto:iyosmartpantry@gmail.com'>contact support</a>.</p>

      <p style='font-size:12px; color:#999; margin-top:10px;'>— The {$appName} Team</p>
    </div>
  ";

  $mail->send();
  respond(['ok' => true, 'message' => 'Verification code sent.']);
} catch (Exception $e) {
  respond(['ok' => false, 'error' => 'Mailer Error: ' . $mail->ErrorInfo]);
}
