<?php
// deleteMeal.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../services/MealActionService.php';

 $data = json_decode(file_get_contents('php://input'), true);
 $mealEntryID = $data['mealEntryID'] ?? '';
 $userID = $data['userID'] ?? '';

if (!$mealEntryID || !$userID) {
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'error' => 'Missing mealEntryID or userID']);
  exit;
}

try {
  $mealActionService = new MealActionService();
  $result = $mealActionService->deleteMeal($mealEntryID, $userID);
  
  header('Content-Type: application/json');
  echo json_encode($result);
} catch (Exception $e) {
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>