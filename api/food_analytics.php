<?php
// api/food_analytics.php - Backend API for Food Analytics Dashboard

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function for debugging
function logMessage($message) {
    $logFile = __DIR__ . '/debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

logMessage("API request received: " . $_SERVER['REQUEST_METHOD']);

require_once __DIR__ . '/config.php';

// Get userID from request
 $userID = $_POST['userID'] ?? $_GET['userID'] ?? null;

logMessage("UserID received: " . ($userID ? $userID : 'NULL'));

if (!$userID) {
    logMessage("Error: Missing userID");
    echo json_encode(['ok' => false, 'error' => 'Missing userID']);
    exit;
}

try {
    // Check database connection
    if (!isset($pdo) || $pdo->errorInfo()[0] !== '00000') {
        logMessage("Database connection error");
        throw new Exception('Database connection failed');
    }
    
    logMessage("Database connection successful");

    // ========== QUERY 1: Summary Metrics ==========
    $stmt1 = $pdo->prepare("
        SELECT 
            u.userID,
            CASE WHEN COUNT(DISTINCT f.foodID) > 0 THEN 1 ELSE 0 END AS hasData,
            COALESCE(SUM(f.usedQty), 0) AS totalUsed,
            (SELECT COALESCE(SUM(d2.quantity), 0) 
             FROM donations d2 
             WHERE d2.userID = u.userID) AS totalDonated,
            COALESCE(SUM(f.usedQty), 0)
            + COALESCE((SELECT SUM(d2.quantity) 
                        FROM donations d2 
                        WHERE d2.userID = u.userID), 0) AS totalSaved,
            SUM(CASE 
                WHEN f.expiryDate < CURDATE() AND f.quantity > 0 THEN f.quantity 
                ELSE 0 
            END) AS totalWasted
        FROM users u
        LEFT JOIN foods f ON u.userID = f.userID
        WHERE u.userID = :userID
        GROUP BY u.userID
    ");
    
    $stmt1->execute(['userID' => $userID]);
    $summary = $stmt1->fetch(PDO::FETCH_ASSOC);
    
    logMessage("Summary query executed. Result: " . json_encode($summary));

    // ========== QUERY 2: Expiring Soon ==========
    $stmt2 = $pdo->prepare("
        SELECT 
            f.foodID AS id,
            f.foodName,
            f.expiryDate,
            CONCAT(f.quantity, ' ', u.unitName) AS quantity
        FROM foods f
        LEFT JOIN units u ON f.unitID = u.unitID
        WHERE f.userID = :userID
          AND f.quantity > 0
          AND f.expiryDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY f.expiryDate ASC
        LIMIT 10
    ");
    
    $stmt2->execute(['userID' => $userID]);
    $expiringSoon = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    
    logMessage("Expiring soon query executed. Count: " . count($expiringSoon));

    // ========== QUERY 3: Monthly Trends ==========
    $stmt3 = $pdo->prepare("
        SELECT 
            DATE_FORMAT(f.expiryDate, '%b') AS month,
            ROUND(COALESCE(SUM(f.usedQty), 0), 2) AS used,
            ROUND(
                SUM(
                    CASE 
                        WHEN f.expiryDate < CURDATE() 
                             AND (f.quantity - f.usedQty) > 0
                        THEN (f.quantity - f.usedQty)
                        ELSE 0 
                    END
                ),
            2) AS wasted
        FROM foods f
        WHERE f.userID = :userID
          AND f.expiryDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(f.expiryDate, '%Y-%m'), DATE_FORMAT(f.expiryDate, '%b')
        ORDER BY DATE_FORMAT(f.expiryDate, '%Y-%m') ASC
    ");
    
    $stmt3->execute(['userID' => $userID]);
    $usedVsWaste = $stmt3->fetchAll(PDO::FETCH_ASSOC);
    
    logMessage("Used vs waste query executed. Count: " . count($usedVsWaste));

    // ========== BUILD RESPONSE ==========
    $response = [
        'ok' => true,
        'hasData' => (bool)($summary['hasData'] ?? 0),
        'summary' => [
            'totalSaved' => (int)($summary['totalSaved'] ?? 0),
            'totalDonated' => (int)($summary['totalDonated'] ?? 0),
            'totalUsed' => (int)($summary['totalUsed'] ?? 0),
        ],
        'statusOverview' => [
            ['name' => 'Used', 'value' => (int)($summary['totalUsed'] ?? 0), 'color' => '#7FA34B'],
            ['name' => 'Saved', 'value' => (int)($summary['totalSaved'] ?? 0) - (int)($summary['totalUsed'] ?? 0), 'color' => '#4A90E2'],
            ['name' => 'Donated', 'value' => (int)($summary['totalDonated'] ?? 0), 'color' => '#F5A962'],
            ['name' => 'Wasted', 'value' => (int)($summary['totalWasted'] ?? 0), 'color' => '#E85D75']
        ],
        'expiringSoon' => $expiringSoon,
        'usedVsWaste' => $usedVsWaste
    ];
    
    logMessage("Final response: " . json_encode($response));
    echo json_encode($response);

} catch (PDOException $e) {
    logMessage("PDO Error: " . $e->getMessage());
    echo json_encode(['ok' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    logMessage("General Error: " . $e->getMessage());
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>