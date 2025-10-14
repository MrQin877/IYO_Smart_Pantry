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
  $verifyLink = "{$frontendBase}/Verify?email=" . urlencode($email) . "&code=" . urlencode($code);
  
  $mail->Subject = 'Your New Verification Code';
  $mail->Body = "
    <div style='font-family: Arial, Helvetica, sans-serif; color: #222; line-height: 1.4;'>
      <h2 style='margin:0 0 10px 0; color:#303116;'>Resend Code</h2>

      <p style='margin:0 0 12px 0;'>Use the new <strong>6-digit</strong> verification code below to complete signing in to your account:</p>

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
  respond(['ok' => true, 'message' => 'New code sent']);
} catch (Exception $e) {
  respond(['ok' => false, 'error' => $mail->ErrorInfo]);
}
