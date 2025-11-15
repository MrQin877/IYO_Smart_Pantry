DROP FUNCTION IF EXISTS next_notice_id;
DELIMITER //
CREATE FUNCTION next_notice_id() RETURNS VARCHAR(10)
  NO SQL  -- (or READS SQL DATA) — MariaDB allows NEXTVAL() in functions
RETURN CONCAT('N', LPAD(NEXTVAL(notif_seq), 9, '0'));
//
DELIMITER ;