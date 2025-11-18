<?php
// api/food_analytics.php - Fixed Version with Notifications-based Analytics

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$userID = $data['userID'] ?? $_POST['userID'] ?? $_GET['userID'] ?? null;
$categoryID = $data['categoryID'] ?? $_POST['categoryID'] ?? $_GET['categoryID'] ?? 'all';
$timeRange = $data['timeRange'] ?? $_POST['timeRange'] ?? $_GET['timeRange'] ?? 'last6months';
$customStartDate = $data['customStartDate'] ?? $_POST['customStartDate'] ?? $_GET['customStartDate'] ?? null;
$customEndDate = $data['customEndDate'] ?? $_POST['customEndDate'] ?? $_GET['customEndDate'] ?? null;

if (!$userID) {
    echo json_encode([
        'ok' => false, 
        'error' => 'Missing userID'
    ]);
    exit();
}

try {
    if (!isset($pdo)) {
        throw new Exception('Database connection not established');
    }

    // ========== Helper Functions ==========
    
    // Calculate date range
    function calculateDateRange($timeRange, $customStartDate, $customEndDate) {
        $today = new DateTime();
        $startDate = null;
        $endDate = null;

        switch ($timeRange) {
            case 'thisweek':
                $startDate = (clone $today)->modify('monday this week')->format('Y-m-d');
                $endDate = (clone $today)->format('Y-m-d');
                break;
                
            case 'lastweek':
                $startDate = (clone $today)->modify('monday last week')->format('Y-m-d');
                $endDate = (clone $today)->modify('sunday last week')->format('Y-m-d');
                break;
                
            case 'thismonth':
                $startDate = (clone $today)->modify('first day of this month')->format('Y-m-d');
                $endDate = (clone $today)->format('Y-m-d');
                break;
                
            case 'lastmonth':
                $startDate = (clone $today)->modify('first day of last month')->format('Y-m-d');
                $endDate = (clone $today)->modify('last day of last month')->format('Y-m-d');
                break;
                
            case 'thisyear':
                $startDate = (clone $today)->modify('first day of January this year')->format('Y-m-d');
                $endDate = (clone $today)->format('Y-m-d');
                break;
                
            case 'last6months':
                $startDate = (clone $today)->modify('-6 months')->format('Y-m-d');
                $endDate = $today->format('Y-m-d');
                break;
                
            case 'alltime':
                // Get the earliest date from notifications or foods table
                global $pdo, $userID;
                
                // Find earliest notification date
                $stmtEarliest = $pdo->prepare("
                    SELECT MIN(created_at) as earliest
                    FROM notifications
                    WHERE userID = :userID
                ");
                $stmtEarliest->execute(['userID' => $userID]);
                $earliestNotif = $stmtEarliest->fetch(PDO::FETCH_ASSOC);
                
                // Find earliest food expiry date
                $stmtEarliestFood = $pdo->prepare("
                    SELECT MIN(expiryDate) as earliest
                    FROM foods
                    WHERE userID = :userID
                ");
                $stmtEarliestFood->execute(['userID' => $userID]);
                $earliestFood = $stmtEarliestFood->fetch(PDO::FETCH_ASSOC);
                
                // Use the earliest date found, or default to 1 year ago
                $notifDate = $earliestNotif['earliest'] ? new DateTime($earliestNotif['earliest']) : null;
                $foodDate = $earliestFood['earliest'] ? new DateTime($earliestFood['earliest']) : null;
                
                if ($notifDate && $foodDate) {
                    $startDate = ($notifDate < $foodDate ? $notifDate : $foodDate)->format('Y-m-d');
                } else if ($notifDate) {
                    $startDate = $notifDate->format('Y-m-d');
                } else if ($foodDate) {
                    $startDate = $foodDate->format('Y-m-d');
                } else {
                    // Default to 1 year ago if no data
                    $startDate = (clone $today)->modify('-1 year')->format('Y-m-d');
                }
                
                $endDate = $today->format('Y-m-d');
                break;
                
            case 'custom':
                if ($customStartDate && $customEndDate) {
                    $startDate = $customStartDate;
                    $endDate = $customEndDate;
                } else {
                    $startDate = (clone $today)->modify('-6 months')->format('Y-m-d');
                    $endDate = $today->format('Y-m-d');
                }
                break;
                
            default:
                $startDate = (clone $today)->modify('-6 months')->format('Y-m-d');
                $endDate = $today->format('Y-m-d');
                break;
        }

        return ['startDate' => $startDate, 'endDate' => $endDate];
    }

    // Extract quantity from notification message
    function extractQuantity($message) {
        // Extract number from messages like "You used Broccoli (1)" or "You used Eggs (5)"
        if (preg_match('/\((\d+(?:\.\d+)?)\)/', $message, $matches)) {
            return floatval($matches[1]);
        }
        return 0;
    }

    // Extract food name from notification message
    function extractFoodName($message) {
        // Extract food name from "You used Broccoli (1)"
        if (preg_match('/You used (.+?) \(/', $message, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }

    // Generate complete date labels for X-axis
    function generateDateLabels($timeRange, $startDate, $endDate) {
        $labels = [];
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        
        // Calculate the difference in days
        $interval = $start->diff($end);
        $totalDays = $interval->days;

        switch ($timeRange) {
            case 'thisweek':
            case 'lastweek':
                // Generate 7 days (Mon-Sun)
                for ($i = 0; $i < 7; $i++) {
                    $date = clone $start;
                    $date->modify("+$i days");
                    if ($date <= $end) {
                        $labels[] = [
                            'label' => $date->format('D'),
                            'date' => $date->format('Y-m-d'),
                            'saved' => 0,
                            'wasted' => 0
                        ];
                    }
                }
                break;

            case 'thismonth':
            case 'lastmonth':
                // Generate all days in the range
                while ($start <= $end) {
                    $labels[] = [
                        'label' => $start->format('d'),
                        'date' => $start->format('Y-m-d'),
                        'fullLabel' => $start->format('d M'),
                        'saved' => 0,
                        'wasted' => 0
                    ];
                    $start->modify('+1 day');
                }
                break;

            case 'thisyear':
            case 'last6months':
            case 'alltime':
            case 'custom':
            default:
                // Determine grouping based on total time span
                if ($totalDays <= 60) {
                    // Less than 2 months: show daily
                    while ($start <= $end) {
                        $labels[] = [
                            'label' => $start->format('d M'),
                            'date' => $start->format('Y-m-d'),
                            'saved' => 0,
                            'wasted' => 0
                        ];
                        $start->modify('+1 day');
                    }
                } else {
                    // More than 2 months: show monthly
                    $current = clone $start;
                    $current->modify('first day of this month');
                    
                    while ($current <= $end) {
                        $labels[] = [
                            'label' => $current->format('M Y'),
                            'month' => $current->format('Y-m'),
                            'saved' => 0,
                            'wasted' => 0
                        ];
                        $current->modify('first day of next month');
                    }
                }
                break;
        }

        return $labels;
    }

    $dateRange = calculateDateRange($timeRange, $customStartDate, $customEndDate);
    $startDate = $dateRange['startDate'];
    $endDate = $dateRange['endDate'];

    // ========== QUERY 1: Total Used (from notifications) ==========
    $stmtUsed = $pdo->prepare("
        SELECT 
            n.noticeID,
            n.message,
            n.targetID,
            DATE(n.created_at) as usedDate,
            n.created_at
        FROM notifications n
        WHERE n.userID = :userID
          AND n.title = 'Used Food Reminder'
          AND DATE(n.created_at) BETWEEN :startDate AND :endDate
        ORDER BY n.created_at ASC
    ");
    
    $stmtUsed->execute([
        'userID' => $userID,
        'startDate' => $startDate,
        'endDate' => $endDate
    ]);
    $usedNotifications = $stmtUsed->fetchAll(PDO::FETCH_ASSOC);

    // Process used notifications and apply category filter
    $totalUsed = 0;
    $usedByDate = [];
    $usedByMonth = [];

    foreach ($usedNotifications as $notif) {
        $quantity = extractQuantity($notif['message']);
        $foodName = extractFoodName($notif['message']);
        
        if ($quantity > 0 && $foodName) {
            // Get food category
            $stmtFood = $pdo->prepare("
                SELECT categoryID 
                FROM foods 
                WHERE foodName = :foodName 
                  AND userID = :userID 
                LIMIT 1
            ");
            $stmtFood->execute(['foodName' => $foodName, 'userID' => $userID]);
            $food = $stmtFood->fetch(PDO::FETCH_ASSOC);
            
            // Apply category filter
            if ($categoryID === 'all' || ($food && $food['categoryID'] === $categoryID)) {
                $totalUsed += $quantity;
                
                $date = $notif['usedDate'];
                $month = date('Y-m', strtotime($notif['created_at']));
                
                if (!isset($usedByDate[$date])) {
                    $usedByDate[$date] = 0;
                }
                $usedByDate[$date] += $quantity;
                
                if (!isset($usedByMonth[$month])) {
                    $usedByMonth[$month] = 0;
                }
                $usedByMonth[$month] += $quantity;
            }
        }
    }

    // ========== QUERY 2: Total Donated (from notifications) ==========
    $stmtDonated = $pdo->prepare("
        SELECT 
            n.noticeID,
            n.message,
            n.targetID,
            DATE(n.created_at) as donatedDate,
            n.created_at
        FROM notifications n
        WHERE n.userID = :userID
          AND n.title = 'Donation Created'
          AND DATE(n.created_at) BETWEEN :startDate AND :endDate
        ORDER BY n.created_at ASC
    ");
    
    $stmtDonated->execute([
        'userID' => $userID,
        'startDate' => $startDate,
        'endDate' => $endDate
    ]);
    $donatedNotifications = $stmtDonated->fetchAll(PDO::FETCH_ASSOC);

    // Process donation notifications and apply category filter
    $totalDonated = 0;
    $donatedByDate = [];
    $donatedByMonth = [];

    foreach ($donatedNotifications as $notif) {
        $donationID = $notif['targetID'];
        
        if ($donationID) {
            // Get donation details
            $stmtDonation = $pdo->prepare("
                SELECT d.quantity, d.foodID, f.categoryID
                FROM donations d
                LEFT JOIN foods f ON d.foodID = f.foodID
                WHERE d.donationID = :donationID
                LIMIT 1
            ");
            $stmtDonation->execute(['donationID' => $donationID]);
            $donation = $stmtDonation->fetch(PDO::FETCH_ASSOC);
            
            if ($donation) {
                $quantity = floatval($donation['quantity']);
                
                // Apply category filter
                if ($categoryID === 'all' || $donation['categoryID'] === $categoryID) {
                    $totalDonated += $quantity;
                    
                    $date = $notif['donatedDate'];
                    $month = date('Y-m', strtotime($notif['created_at']));
                    
                    if (!isset($donatedByDate[$date])) {
                        $donatedByDate[$date] = 0;
                    }
                    $donatedByDate[$date] += $quantity;
                    
                    if (!isset($donatedByMonth[$month])) {
                        $donatedByMonth[$month] = 0;
                    }
                    $donatedByMonth[$month] += $quantity;
                }
            }
        }
    }

    // ========== QUERY 3: Total Wasted ==========
    $stmtWasted = $pdo->prepare("
        SELECT 
            COALESCE(SUM(f.quantity), 0) AS totalWasted
        FROM foods f
        WHERE f.userID = :userID
          AND f.expiryDate < CURDATE()
          AND f.quantity > 0
          AND f.expiryDate BETWEEN :startDate AND :endDate
          AND (:categoryID1 = 'all' OR f.categoryID = :categoryID2)
    ");
    
    $stmtWasted->execute([
        'userID' => $userID,
        'startDate' => $startDate,
        'endDate' => $endDate,
        'categoryID1' => $categoryID,
        'categoryID2' => $categoryID
    ]);
    $wasteResult = $stmtWasted->fetch(PDO::FETCH_ASSOC);
    $totalWasted = (int)$wasteResult['totalWasted'];

    // Calculate total saved
    $totalSaved = $totalUsed + $totalDonated;

    // Check if has data
    $hasData = ($totalSaved > 0 || $totalWasted > 0);

    // ========== QUERY 4: Expiring Soon ==========
    $stmtExpiring = $pdo->prepare("
        SELECT 
            f.foodID AS id,
            f.foodName,
            f.expiryDate,
            CONCAT(f.quantity, ' ', u.unitName) AS quantity,
            c.categoryName
        FROM foods f
        LEFT JOIN units u ON f.unitID = u.unitID
        LEFT JOIN categories c ON f.categoryID = c.categoryID
        WHERE f.userID = :userID
          AND f.quantity > 0
          AND f.expiryDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          AND (:categoryID1 = 'all' OR f.categoryID = :categoryID2)
        ORDER BY f.expiryDate ASC
        LIMIT 10
    ");
    
    $stmtExpiring->execute([
        'userID' => $userID,
        'categoryID1' => $categoryID,
        'categoryID2' => $categoryID
    ]);
    $expiringSoon = $stmtExpiring->fetchAll(PDO::FETCH_ASSOC);

    // ========== QUERY 5: Wasted by Date/Month ==========
    // ========== QUERY 5: Wasted by Date/Month ==========
    // NEW APPROACH: Get all wasted items and distribute them across the date range
    $stmtAllWasted = $pdo->prepare("
        SELECT 
            f.foodID,
            f.quantity,
            DATE(f.expiryDate) AS expiryDate
        FROM foods f
        WHERE f.userID = :userID
          AND f.expiryDate < CURDATE()
          AND f.quantity > 0
          AND f.expiryDate <= :endDate
          AND (:categoryID1 = 'all' OR f.categoryID = :categoryID2)
    ");
    
    $stmtAllWasted->execute([
        'userID' => $userID,
        'endDate' => $endDate,
        'categoryID1' => $categoryID,
        'categoryID2' => $categoryID
    ]);
    $allWastedItems = $stmtAllWasted->fetchAll(PDO::FETCH_ASSOC);

    $wastedByDate = [];
    $wastedByMonth = [];
    
    // Distribute wasted items to their expiry dates
    foreach ($allWastedItems as $item) {
        $expiryDate = $item['expiryDate'];
        $quantity = floatval($item['quantity']);
        
        // Check if expiry date falls within our date range
        if ($expiryDate >= $startDate && $expiryDate <= $endDate) {
            // Add to daily tracking
            if (!isset($wastedByDate[$expiryDate])) {
                $wastedByDate[$expiryDate] = 0;
            }
            $wastedByDate[$expiryDate] += $quantity;
            
            // Add to monthly tracking
            $month = date('Y-m', strtotime($expiryDate));
            if (!isset($wastedByMonth[$month])) {
                $wastedByMonth[$month] = 0;
            }
            $wastedByMonth[$month] += $quantity;
        }
    }

    // ========== Generate Chart Data ==========
    $labels = generateDateLabels($timeRange, $startDate, $endDate);

    foreach ($labels as &$label) {
        if (isset($label['date'])) {
            // Daily data
            $date = $label['date'];
            $saved = ($usedByDate[$date] ?? 0) + ($donatedByDate[$date] ?? 0);
            $label['saved'] = $saved;
            $label['wasted'] = $wastedByDate[$date] ?? 0;
        } else if (isset($label['month'])) {
            // Monthly data
            $month = $label['month'];
            $saved = ($usedByMonth[$month] ?? 0) + ($donatedByMonth[$month] ?? 0);
            $label['saved'] = $saved;
            $label['wasted'] = $wastedByMonth[$month] ?? 0;
        }
    }

    // Remove temporary keys
    $savedVsWaste = array_map(function($item) {
        return [
            'label' => $item['label'],
            'saved' => round($item['saved'], 2),
            'wasted' => round($item['wasted'], 2)
        ];
    }, $labels);

    // ========== Build Response ==========
    echo json_encode([
        'ok' => true,
        'hasData' => $hasData,
        'summary' => [
            'totalSaved' => round($totalSaved, 2),
            'totalDonated' => round($totalDonated, 2),
            'totalUsed' => round($totalUsed, 2),
        ],
        'statusOverview' => array_values(array_filter([
            ['name' => 'Used', 'value' => round($totalUsed, 2), 'color' => '#7FA34B'],
            ['name' => 'Donated', 'value' => round($totalDonated, 2), 'color' => '#F5A962'],
            ['name' => 'Wasted', 'value' => round($totalWasted, 2), 'color' => '#E85D75']
        ], function($item) {
            return $item['value'] > 0; // Only include items with value > 0
        })),
        'expiringSoon' => $expiringSoon,
        'savedVsWaste' => $savedVsWaste,
        'dateRange' => [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'monthLabel' => (new DateTime($startDate))->format('F Y')
        ],
        'appliedFilters' => [
            'categoryID' => $categoryID,
            'timeRange' => $timeRange,
            'customStartDate' => $customStartDate,
            'customEndDate' => $customEndDate
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
?>