<?php
require 'config.php';

try {
    $stmt = $pdo->prepare("
        SELECT 
            d.donationID,
            d.quantity AS donationQuantity,
            d.contact,
            d.note,
            d.pickupLocation,
            f.foodName,
            f.quantity AS foodQuantity,
            f.expiryDate,
            c.categoryName,
            un.unitName,
            u.fullName AS donorName,
            GROUP_CONCAT(pt.pickTime SEPARATOR '|') AS availabilityTimes
        FROM donations d
        LEFT JOIN foods f ON d.foodID = f.foodID
        LEFT JOIN categories c ON f.categoryID = c.categoryID
        LEFT JOIN units un ON f.unitID = un.unitID
        LEFT JOIN users u ON d.userID = u.userID
        LEFT JOIN pickup_times pt ON d.donationID = pt.donationID
        GROUP BY d.donationID
        ORDER BY d.donationID DESC
    ");

    // Filter by category
    if (!empty($category)) {
        $query .= " AND f.categoryID = :category";
        $params[':category'] = $category;
    }

    // Filter by storage
    if (!empty($storageID)) {
        $query .= " AND f.storageID = :storageID";
        $params[':storageID'] = $storageID;
    }

    // Filter by expiry
    if (!empty($expiryRange)) {
        if ($expiryRange === '3days') {
            $query .= " AND f.expiryDate <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)";
        } elseif ($expiryRange === 'week') {
            $query .= " AND f.expiryDate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
        } elseif ($expiryRange === 'month') {
            $query .= " AND f.expiryDate <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH)";
        }
    }

    // Filter by pickup area (if applicable)
    if (!empty($pickupArea)) {
        $query .= " AND d.pickupLocation LIKE :pickupArea";
        $params[':pickupArea'] = "%$pickupArea%";
    }
    
    $stmt->execute();
    $donations = $stmt->fetchAll();

    respond([
        'ok' => true,
        'data' => $donations
    ]);
} catch (Throwable $e) {
    respond([
        'ok' => false,
        'error' => $e->getMessage()
    ], 500);
}
