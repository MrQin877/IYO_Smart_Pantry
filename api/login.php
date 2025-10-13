<?php
require __DIR__ . '/config.php';
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Always return JSON
header('Content-Type: application/json; charset=utf-8');

// Read JSON from frontend
$data = json_input();
$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';

// Validate inputs
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
  respond(['ok' => false, 'error' => 'Invalid email or password format'], 422);
}

// Find user — match your table name exactly (MySQL is case-sensitive in some systems)
$stmt = $pdo->prepare("SELECT userID, fullName, password, status, twoFA FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
  respond(['ok' => false, 'error' => 'User not found'], 404);
}

$_SESSION['userID'] = $user['userID'];
$_SESSION['email'] = $user['email'];
$_SESSION['fullName'] = $user['fullName']??'';

// Verify hashed password
if (!password_verify($password, $user['password'])) {
  respond(['ok' => false, 'error' => 'Incorrect password'], 401);
}

if ($user['status'] !== 'Active') {
  respond(['ok' => false, 'error' => 'Account not active'], 403);
}

if ((int)$user['twoFA'] === 1){
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
    respond(['ok' => true, 'needVerify' => true, 'message' => 'Verification code sent.']);
    exit;
  } catch (Exception $e) {
    respond(['ok' => false, 'error' => 'Mailer Error: ' . $mail->ErrorInfo]);
  }

}

// ✅ Return success response to frontend
respond([
  'ok' => true,
  'userID' => $user['userID'],
  'fullName' => $user['fullName'],
  'message' => 'Login successful'
]);
