<?php
// test_mail.php - 用于测试 Gmail 发信功能
require __DIR__ . '/vendor/autoload.php';  // 载入 PHPMailer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Gmail SMTP 设置
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;

    // ⚠️ 修改成你的 Gmail 邮箱与“应用专用密码”
    $mail->Username   = 'elainliow@gmail.com';
    $mail->Password   = 'karn eihf zwhl rleg';

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // 发件人和收件人
    $mail->setFrom('elainliow@gmail.com', 'IYO Smart Pantry');
    $mail->addAddress('zclim01234@gmail.com', 'Test User'); // 测试收件人

    // 邮件内容
    $mail->isHTML(true);
    $mail->Subject = '✅ Gmail PHPMailer Test Success!';
    $mail->Body    = '<h2>恭喜 🎉</h2><p>I LOVE YOU</p>';

    $mail->send();
    echo json_encode(['ok' => true, 'message' => 'Mail sent successfully']);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => $mail->ErrorInfo]);
}
