DELIMITER $$
DROP TRIGGER IF EXISTS trg_donations_ai $$
CREATE TRIGGER trg_donations_ai
AFTER INSERT ON donations
FOR EACH ROW
BEGIN
  INSERT INTO notifications
    (noticeID, title, message, is_read, created_at, targetID, targetType, userID, noticeCateID)
  VALUES
    (
      next_notice_id(),
      'Donation Created',
      CONCAT('Donation ', NEW.donationID, ' created. Pickup at: ', COALESCE(NEW.pickupLocation,'')),
      0,
      NOW(),
      NEW.donationID,
      'Donation',
      NEW.userID,
      (SELECT noticeCateID FROM notification_categories WHERE noticeCateName='Donation' LIMIT 1)
    );
END$$
DELIMITER ;
