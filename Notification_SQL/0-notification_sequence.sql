-- Run this once in your IYO database
CREATE SEQUENCE IF NOT EXISTS notif_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 999999999
  CACHE 10;

-- 1) Find current max numeric part of noticeID (e.g., N000000026 -> 26)
SELECT @maxn := COALESCE(MAX(CAST(SUBSTRING(noticeID,2) AS UNSIGNED)), 0)
FROM notifications;

-- 2) Make sure the next value is a plain integer
SET @next := CAST(@maxn AS UNSIGNED) + 1;

-- 3) Build the ALTER statement with that integer
SET @sql := CONCAT('ALTER SEQUENCE notif_seq RESTART WITH ', @next);

-- (Optional: check what you built)
SELECT @sql;

-- 4) Execute it
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
