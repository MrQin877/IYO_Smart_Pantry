DELIMITER $$
DROP TRIGGER IF EXISTS trg_users_2fa_bu $$
CREATE TRIGGER trg_users_2fa_bu
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  IF (OLD.twoFA <> NEW.twoFA) THEN
    INSERT INTO notifications
      (noticeID, title, message, is_read, created_at, targetID, targetType, userID, noticeCateID)
    VALUES
      (
        next_notice_id(),
        'Account Security Update',
        CONCAT('2FA setting ', IF(NEW.twoFA=1,'enabled','disabled'), '.'),
        0,
        NOW(),
        NEW.userID,
        'Account',
        NEW.userID,
        (SELECT noticeCateID FROM notification_categories WHERE noticeCateName='Account' LIMIT 1)
      );
  END IF;
END$$
DELIMITER ;
