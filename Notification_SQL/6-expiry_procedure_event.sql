DELIMITER $$

DROP PROCEDURE IF EXISTS sp_generate_expiry_notifications $$
CREATE PROCEDURE sp_generate_expiry_notifications(IN p_days_soon INT)
BEGIN
  INSERT INTO notifications
    (noticeID, title, message, is_read, created_at, targetID, targetType, userID, noticeCateID)
  SELECT
    CONCAT('N', LPAD(NEXTVAL(notif_seq), 9, '0')),  -- <- unique per row now
    'Inventory Reminder',
    CONCAT(
      'Item "', f.foodName, '" is expiring on ', DATE_FORMAT(f.expiryDate,'%Y-%m-%d'),
      ' (', DATEDIFF(f.expiryDate, CURDATE()), ' day(s) left).'
    ),
    0,
    NOW(),
    f.foodID,
    'Food',
    f.userID,
    (SELECT noticeCateID FROM notification_categories WHERE noticeCateName='Expiry' LIMIT 1)
  FROM foods f
  WHERE f.userID IS NOT NULL
    AND f.expiryDate IS NOT NULL
    AND DATEDIFF(f.expiryDate, CURDATE()) BETWEEN 0 AND p_days_soon
    AND NOT EXISTS (
      SELECT 1
      FROM notifications n
      WHERE n.userID = f.userID
        AND n.targetType = 'Food'
        AND n.targetID = f.foodID
        AND n.noticeCateID = (SELECT noticeCateID FROM notification_categories WHERE noticeCateName='Expiry' LIMIT 1)
        AND n.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    );
END$$

DELIMITER ;

-- Event: every 5 minutes (change interval as you like)
SET GLOBAL event_scheduler = 'ON';
DROP EVENT IF EXISTS ev_expiry_every_5min;
CREATE EVENT ev_expiry_every_5min
ON SCHEDULE EVERY 5 MINUTE
DO CALL sp_generate_expiry_notifications(3);
