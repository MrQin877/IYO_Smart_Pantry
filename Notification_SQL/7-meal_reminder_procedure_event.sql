DELIMITER $$

DROP PROCEDURE IF EXISTS sp_generate_mealplan_today $$
CREATE PROCEDURE sp_generate_mealplan_today()
BEGIN
  INSERT INTO notifications
    (noticeID, title, message, is_read, created_at, targetID, targetType, userID, noticeCateID)
  SELECT
    next_notice_id(),
    'Meal Plan Reminder',
    CONCAT('Today''s meal: ', COALESCE(me.mealName,'Meal plan')),
    0,
    NOW(),
    mpc.mealPlanID,
    'MealPlan',
    mpc.userID,
    (SELECT noticeCateID FROM notification_categories WHERE noticeCateName='MealPlan' LIMIT 1)
  FROM meal_entries me
  JOIN meal_plan_calendars mpc ON mpc.mealPlanID = me.mealPlanID
  WHERE me.mealDate = CURDATE()
    AND NOT EXISTS ( -- one per plan per day
      SELECT 1 FROM notifications n
      WHERE n.userID = mpc.userID
        AND n.targetType = 'MealPlan'
        AND n.targetID = mpc.mealPlanID
        AND n.noticeCateID = (SELECT noticeCateID FROM notification_categories WHERE noticeCateName='MealPlan' LIMIT 1)
        AND DATE(n.created_at) = CURDATE()
    );
END$$

DELIMITER ;

DROP EVENT IF EXISTS ev_mealplan_daily_8am;
CREATE EVENT ev_mealplan_daily_8am
ON SCHEDULE EVERY 1 DAY STARTS TIMESTAMP(CURDATE(), '08:00:00')
DO CALL sp_generate_mealplan_today();
