DELIMITER $$

DROP TRIGGER IF EXISTS trg_foods_after_update_used $$
CREATE TRIGGER trg_foods_after_update_used
AFTER UPDATE ON foods
FOR EACH ROW
BEGIN
  DECLARE used_diff DECIMAL(10,2);
  DECLARE used_str  VARCHAR(32);

  -- compute newly used amount in this update
  SET used_diff = IFNULL(NEW.usedQty,0) - IFNULL(OLD.usedQty,0);

  IF used_diff > 0.0001 THEN
    -- pretty print number (trim trailing zeros and dot)
    SET used_str = TRIM(TRAILING '.' FROM TRIM(TRAILING '0' FROM CAST(used_diff AS CHAR)));

    INSERT INTO notifications
      (noticeID, title, message, is_read, created_at, targetID, targetType, userID, noticeCateID)
    VALUES
      (
        next_notice_id(),
        'Used Food Reminder',
        CONCAT('You used ', NEW.foodName, ' (', used_str, ')'),
        0,
        NOW(),
        NEW.foodID,
        'Food',
        NEW.userID,
        (SELECT noticeCateID
           FROM notification_categories
          WHERE noticeCateName='Inventory'
          LIMIT 1)
      );
  END IF;
END $$

DELIMITER ;
