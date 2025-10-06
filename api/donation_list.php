<?php
// C:\xampp\htdocs\IYO_Smart_Pantry\api\donation_list.php
require 'config.php';

try {
    // Fetch all donations with food and user info
    $stmt = $pdo->prepare("
        SELECT 
            d.donationID, 
            d.quantity, 
            d.contact, 
            d.note, 
            d.pickupLocation,
            f.foodName, 
            u.fullName AS donorName
        FROM donations d
        LEFT JOIN foods f ON d.foodID = f.foodID
        LEFT JOIN users u ON d.userID = u.userID
        ORDER BY d.donationID DESC
    ");
    $stmt->execute();
    $donations = $stmt->fetchAll();

    // Return JSON
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
