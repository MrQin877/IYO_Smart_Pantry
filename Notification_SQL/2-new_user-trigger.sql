DELIMITER $$
DROP TRIGGER IF EXISTS trg_users_welcome_ai $$
CREATE TRIGGER trg_users_welcome_ai
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO notifications
    (noticeID, title, message, is_read, created_at, targetID, targetType, userID, noticeCateID)
  VALUES
    (
      next_notice_id(),
      'Welcome to IYO Smart Pantry',
      CONCAT('Hi ', NEW.fullName, '! Your account was created successfully.'),
      0,
      NOW(),
      NEW.userID,
      'Account',
      NEW.userID,
      (SELECT noticeCateID FROM notification_categories WHERE noticeCateName='System' LIMIT 1)
    );
END$$
DELIMITER ;
