<?php
// markAsDone.php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers FIRST (before any output)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../services/MealActionService.php';

// Log the request for debugging
error_log("markAsDone.php - Request received: " . file_get_contents('php://input'));

try {
    // Get and validate input
    $input = file_get_contents('php://input');
    if (empty($input)) {
        error_log("markAsDone.php - Empty input received");
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => 'Empty input']);
        exit;
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("markAsDone.php - JSON decode error: " . json_last_error_msg());
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
        exit;
    }
    
    $mealEntryID = $data['mealEntryID'] ?? '';
    $userID = $data['userID'] ?? '';

    error_log("markAsDone.php - Parsed data: mealEntryID=$mealEntryID, userID=$userID");

    if (!$mealEntryID || !$userID) {
        error_log("markAsDone.php - Missing parameters");
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => 'Missing mealEntryID or userID']);
        exit;
    }

    // NEW: Check if this meal is already marked as done
    $checkStmt = $pdo->prepare("
        SELECT me.mealEntryID, me.status 
        FROM meal_entries me
        WHERE me.mealEntryID = ?
    ");
    $checkStmt->execute([$mealEntryID]);
    $existingMeal = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingMeal && $existingMeal['status'] === 'completed') {
        error_log("markAsDone.php - Meal already marked as done: $mealEntryID");
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => 'Meal already marked as done']);
        exit;
    }

    // Create service and process request
    $mealActionService = new MealActionService();
    $result = $mealActionService->markMealAsDone($mealEntryID, $userID);
    
    // Set response header and output
    header('Content-Type: application/json');
    echo json_encode($result);
    
    error_log("markAsDone.php - Response sent: " . json_encode($result));
    
} catch (Exception $e) {
    error_log("markAsDone.php - Exception: " . $e->getMessage());
    error_log("markAsDone.php - Exception trace: " . $e->getTraceAsString());
    
    // Set error response
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>