<?php
//api/register.php
require __DIR__.'/config.php';

//如果 config.php 里没有全局设置 JSON 头，这里可以加：
//header('Content-Type: application/json; charset=utf-8');

$body = json_input();
$fullName = trim($body['fullName'] ?? '');
$email = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';
$householdSize = isset($body['householdSize']) ? (int)$body['householdSize'] : null;

if ($fullName==='' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password)<8) {
  respond(['ok'=>false,'error'=>'Invalid input'],422);
}

//唯一邮箱
$stmt = $pdo->prepare('SELECT 1 FROM USERS WHERE email=? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) respond(['ok'=>false,'error'=>'Email already registered'],409);

//插入用户（让触发器生成 userID；如果没有触发器，请改成你自己的生成逻辑）
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('
  INSERT INTO USERS (userID, fullName, email, password, status, householdSize, createdAt)
  VALUES (NULL, ?, ?, ?, "Pending", ?, NOW())
');
$stmt->execute([$fullName, $email, $hash, $householdSize]);

//获取 userID（触发器场景下 lastInsertId 可能拿不到，因此做回查兜底）
$userID = $pdo->lastInsertId();
if (!$userID) {
  $stmt=$pdo->prepare('SELECT userID FROM USERS WHERE email=?');
  $stmt->execute([$email]);
  $userID=$stmt->fetchColumn();
}

//默认设置
$stmt=$pdo->prepare('
  INSERT INTO USER_SETTINGS (settingID, twoFA, foodVisibility, notification, userID)
  VALUES (NULL, 1, 0, 1, ?)
');
$stmt->execute([$userID]);

//✅ 生成 6 位 OTP，存 Session（有效 30 分钟）
$otp = str_pad(strval(random_int(0,999999)), 6, '0', STR_PAD_LEFT);
$_SESSION['reg_email']  = $email;
$_SESSION['reg_userID'] = $userID;
$_SESSION['reg_otp']    = $otp;
$_SESSION['reg_exp']    = time() + 1800; //30 分钟
$_SESSION['reg_tries']  = 0;

// ...前面插入 USERS、写入 USER_SETTINGS、生成 OTP、写入 $_SESSION 都不变...

$verifyLink = 'http://localhost/IYO_Smart_Pantry/#/verify';

// ✅ 打开发邮件代码 —— 选 Gmail 或 Mailtrap，二选一配置
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require __DIR__.'/vendor/autoload.php';

try {
  $mail = new PHPMailer(true);

  // ---------- Gmail 示例 ----------
  $mail->isSMTP();
  $mail->Host       = 'smtp.gmail.com';
  $mail->SMTPAuth   = true;
  $mail->Username   = 'qinchong877@gmail.com';    // ← 改成你的发信邮箱
  $mail->Password   = 'dpcfhxxakogjznpd'; // ← Gmail“应用专用密码”
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port       = 587;

  // ---------- Mailtrap 示例（如用 Mailtrap，请注释掉上面 Gmail 区块，改用这段） ----------
  // $mail->isSMTP();
  // $mail->Host       = 'smtp.mailtrap.io';
  // $mail->SMTPAuth   = true;
  // $mail->Username   = 'MT_xxx'; // from Mailtrap
  // $mail->Password   = 'MT_xxx'; // from Mailtrap
  // $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  // $mail->Port       = 587;

  $mail->setFrom('qinchong877@gmail.com', 'IYO SmartPantry'); // 发件人
  $mail->addAddress($email, $fullName);                       // 收件人

  $mail->isHTML(true);
  $mail->Subject = 'Your verification code';
  // HTML 正文
  $mail->Body = "
    <h2>Welcome, {$fullName}!</h2>
    <p>Your verification code is: <b style='font-size:18px'>{$otp}</b> (valid for 30 minutes)</p>
    <p>Please open the verification page in the <b>same browser</b>, then enter the code and set a new password:</p>
    <p><a href='{$verifyLink}'>{$verifyLink}</a></p>
  ";
  // 纯文本备用（有些邮箱会用这个）
  $mail->AltBody = "Your verification code is: {$otp}\nOpen: {$verifyLink}\n(Valid 30 minutes)";

  // 调试日志（需要时打开）
  // $mail->SMTPDebug = 2;

  $mail->send();

  // 生产可不返回 dev 字段
  respond([
    'ok'=>true,
    'userID'=>$userID,
    'message'=>'Registered. We sent a verification code to your email.'
  ]);

} catch (Throwable $e) {
  // 邮件失败也可以让注册成功，只是提示用户稍后重试或使用 dev 信息
  respond([
    'ok'=>true,
    'userID'=>$userID,
    'message'=>'Registered, but sending email failed.',
    'mail_error'=>$e->getMessage(),
    'dev_otp'=>$otp,
    'dev_link'=>$verifyLink
  ]);
}
