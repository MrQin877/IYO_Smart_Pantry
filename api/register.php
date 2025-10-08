<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\register.php
require_once "config.php";

$data = json_input();

$fullName = trim($data["fullName"] ?? "");
$email = trim($data["email"] ?? "");
$password = trim($data["password"] ?? "");
$householdSize = intval($data["householdSize"] ?? 1);

// === 1️⃣ Validate input ===
if ($fullName === "" || $email === "" || $password === "") {
  respond(["ok" => false, "error" => "All fields are required"], 400);
}

// === 2️⃣ Check duplicate email ===
$stmt = $pdo->prepare("SELECT userID FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
  respond(["ok" => false, "error" => "Email already registered"], 409);
}

// === 3️⃣ Hash password securely ===
$hashedPwd = password_hash($password, PASSWORD_DEFAULT);

// === 4️⃣ Insert new user ===
$stmt = $pdo->prepare("
  INSERT INTO users (fullName, email, password, twoFA, status, createdAt, householdSize)
  VALUES (?, ?, ?, 1, 'Active', NOW(), ?)
");

try {
  $stmt->execute([$fullName, $email, $hashedPwd, $householdSize]);
  respond(["ok" => true, "message" => "User registered successfully"]);
} catch (Throwable $e) {
  respond(["ok" => false, "error" => "Database insert failed: " . $e->getMessage()], 500);
}
