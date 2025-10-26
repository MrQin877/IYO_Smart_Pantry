DELIMITER $$
DROP TRIGGER IF EXISTS trg_foods_added_ai $$
CREATE TRIGGER trg_foods_added_ai
AFTER INSERT ON foods
FOR EACH ROW
BEGIN
  INSERT INTO notifications
    (noticeID, title, message, is_read, created_at, targetID, targetType, userID, noticeCateID)
  VALUES
    (
      next_notice_id(),
      'New Food Added',
      CONCAT('Added "', NEW.foodName, '" (', NEW.quantity, ' ',
             COALESCE((SELECT unitName FROM units WHERE unitID=NEW.unitID), ''), ').'),
      0,
      NOW(),
      NEW.foodID,
      'Food',
      NEW.userID,
      (SELECT noticeCateID FROM notification_categories WHERE noticeCateName='Inventory' LIMIT 1)
    );
END$$
DELIMITER ;
