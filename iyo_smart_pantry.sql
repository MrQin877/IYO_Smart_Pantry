-- =========================================================
-- IYO SMART PANTRY – schema + ID autoincrement (VARCHAR)
-- MySQL 8.0+
-- =========================================================
DROP DATABASE IF EXISTS iyo_smart_pantry;
CREATE DATABASE iyo_smart_pantry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iyo_smart_pantry;

-- ---------------------------------------------------------
-- BASE (natural key)
-- ---------------------------------------------------------
CREATE TABLE POSTCODES (
  postcode CHAR(5) PRIMARY KEY,
  city     VARCHAR(255) NOT NULL,
  state    VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ADDRESS
-- ---------------------------------------------------------
CREATE TABLE ADDRESS (
  addressID    VARCHAR(10) PRIMARY KEY,
  addressLabel VARCHAR(255),
  line1        VARCHAR(255) NOT NULL,
  line2        VARCHAR(255) NOT NULL,
  postcode     CHAR(5) NOT NULL,
  CONSTRAINT fk_address_postcode
    FOREIGN KEY (postcode) REFERENCES POSTCODES(postcode)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- USERS
-- ---------------------------------------------------------
CREATE TABLE USERS (
  userID        VARCHAR(10) PRIMARY KEY,
  fullName      VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password      VARCHAR(255) NOT NULL,
  status        VARCHAR(255) NOT NULL,
  createdAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  householdSize INT,
  contact       VARCHAR(15),
  addressID     VARCHAR(10),
  CONSTRAINT chk_users_status
    CHECK (status IN ('Active','Pending')),
  CONSTRAINT fk_users_address
    FOREIGN KEY (addressID) REFERENCES ADDRESS(addressID)
      ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON USERS(email);

-- ---------------------------------------------------------
-- USER_SETTINGS (1:1 with USERS)
-- ---------------------------------------------------------
CREATE TABLE USER_SETTINGS (
  settingID      VARCHAR(10) PRIMARY KEY,
  twoFA          BOOLEAN NOT NULL,
  foodVisibility BOOLEAN NOT NULL,
  notification   BOOLEAN NOT NULL,
  userID         VARCHAR(10) NOT NULL UNIQUE,
  CONSTRAINT fk_usersettings_user
    FOREIGN KEY (userID) REFERENCES USERS(userID)
      ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- LOOKUPS
-- ---------------------------------------------------------
DROP TABLE IF EXISTS CATEGORIES;
CREATE TABLE CATEGORIES (
  categoryID   VARCHAR(10) PRIMARY KEY,
  categoryName VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS UNITS;
CREATE TABLE UNITS (
  unitID   VARCHAR(10) PRIMARY KEY,
  unitName VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS ACTION_TYPES;
CREATE TABLE ACTION_TYPES (
  actionTypeID   VARCHAR(10) PRIMARY KEY,
  actionTypeName VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS MEAL_TYPES;
CREATE TABLE MEAL_TYPES (
  mealTypeID   VARCHAR(10) PRIMARY KEY,
  mealTypeName VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- RECIPES / INGREDIENTS
-- ---------------------------------------------------------
CREATE TABLE RECIPES (
  recipeID    VARCHAR(10) PRIMARY KEY,
  recipeName  VARCHAR(255) NOT NULL,
  instruction TEXT,
  serving     INT,
  isGeneric   BOOLEAN NOT NULL
) ENGINE=InnoDB;

CREATE TABLE INGREDIENTS (
  ingredientID   VARCHAR(10) PRIMARY KEY,
  ingredientName VARCHAR(255) NOT NULL,
  categoryID     VARCHAR(10) NOT NULL,
  CONSTRAINT fk_ing_category
    FOREIGN KEY (categoryID) REFERENCES CATEGORIES(categoryID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE RECIPE_INGREDIENTS (
  recipe_ingredientID VARCHAR(10) PRIMARY KEY,
  quantityNeeded      DECIMAL(10,2) NOT NULL,
  recipeID            VARCHAR(10) NOT NULL,
  ingredientID        VARCHAR(10) NOT NULL,
  unitID              VARCHAR(10) NOT NULL,
  CONSTRAINT fk_ri_recipe
    FOREIGN KEY (recipeID) REFERENCES RECIPES(recipeID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ri_ingredient
    FOREIGN KEY (ingredientID) REFERENCES INGREDIENTS(ingredientID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ri_unit
    FOREIGN KEY (unitID) REFERENCES UNITS(unitID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- MEAL PLANNING
-- ---------------------------------------------------------
CREATE TABLE MEAL_PLAN_CALENDARS (
  mealPlanID VARCHAR(10) PRIMARY KEY,
  weekStart  DATE NOT NULL,
  userID     VARCHAR(10) NOT NULL,
  CONSTRAINT fk_mpc_user
    FOREIGN KEY (userID) REFERENCES USERS(userID)
      ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE MEAL_ENTRIES (
  mealEntryID VARCHAR(10) PRIMARY KEY,
  mealDate    DATE NOT NULL,
  mealName    VARCHAR(255) NOT NULL,
  mealPlanID  VARCHAR(10) NOT NULL,
  mealTypeID  VARCHAR(10) NOT NULL,
  recipeID    VARCHAR(10) NOT NULL,
  CONSTRAINT fk_me_mpc
    FOREIGN KEY (mealPlanID) REFERENCES MEAL_PLAN_CALENDARS(mealPlanID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_me_mealtype
    FOREIGN KEY (mealTypeID) REFERENCES MEAL_TYPES(mealTypeID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_me_recipe
    FOREIGN KEY (recipeID) REFERENCES RECIPES(recipeID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- FOODS / INVENTORY
-- ---------------------------------------------------------
CREATE TABLE FOODS (
  foodID          VARCHAR(10) PRIMARY KEY,
  foodName        VARCHAR(255) NOT NULL,
  quantity        DECIMAL(10,2) NOT NULL,
  expiryDate      DATE NOT NULL,
  is_expiryStatus BOOLEAN NOT NULL,
  is_plan         BOOLEAN NOT NULL,
  storageLocation VARCHAR(255),
  remark          VARCHAR(255),
  userID          VARCHAR(10) NOT NULL,
  categoryID      VARCHAR(10) NOT NULL,
  unitID          VARCHAR(10) NOT NULL,
  CONSTRAINT fk_food_user
    FOREIGN KEY (userID) REFERENCES USERS(userID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_food_category
    FOREIGN KEY (categoryID) REFERENCES CATEGORIES(categoryID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_food_unit
    FOREIGN KEY (unitID) REFERENCES UNITS(unitID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_foods_user ON FOODS(userID);

CREATE TABLE FOOD_RESERVATIONS (
  reservationID VARCHAR(10) PRIMARY KEY,
  qty           DECIMAL(10,2) NOT NULL,
  foodID        VARCHAR(10) NOT NULL,
  mealEntryID   VARCHAR(10) NOT NULL,
  unitID        VARCHAR(10) NOT NULL,
  CONSTRAINT fk_fr_food
    FOREIGN KEY (foodID) REFERENCES FOODS(foodID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_fr_me
    FOREIGN KEY (mealEntryID) REFERENCES MEAL_ENTRIES(mealEntryID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_fr_unit
    FOREIGN KEY (unitID) REFERENCES UNITS(unitID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ACTIONS (usage log)
-- ---------------------------------------------------------
CREATE TABLE ACTIONS (
  actionID     VARCHAR(10) PRIMARY KEY,
  actionQty    DECIMAL(10,2) NOT NULL,
  actionDate   DATE NOT NULL,
  userID       VARCHAR(10) NOT NULL,
  foodID       VARCHAR(10) NOT NULL,
  unitID       VARCHAR(10) NOT NULL,
  actionTypeID VARCHAR(10) NOT NULL,
  mealEntryID  VARCHAR(10),
  CONSTRAINT fk_act_user
    FOREIGN KEY (userID) REFERENCES USERS(userID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_act_food
    FOREIGN KEY (foodID) REFERENCES FOODS(foodID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_act_unit
    FOREIGN KEY (unitID) REFERENCES UNITS(unitID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_act_type
    FOREIGN KEY (actionTypeID) REFERENCES ACTION_TYPES(actionTypeID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_act_me
    FOREIGN KEY (mealEntryID) REFERENCES MEAL_ENTRIES(mealEntryID)
      ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- DONATIONS
-- ---------------------------------------------------------
DROP TABLE IF EXISTS DONATION_STATUS;
CREATE TABLE DONATION_STATUS (
  donation_statusID   VARCHAR(10) PRIMARY KEY,
  donation_statusName VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE DONATIONS (
  donationID        VARCHAR(10) PRIMARY KEY,
  quantity          DECIMAL(10,2) NOT NULL,
  contact           VARCHAR(15) NOT NULL,
  note              VARCHAR(255),
  userID            VARCHAR(10) NOT NULL,
  addressID         VARCHAR(10) NOT NULL,
  foodID            VARCHAR(10) NOT NULL,
  donation_statusID VARCHAR(10) NOT NULL,
  CONSTRAINT fk_don_user
    FOREIGN KEY (userID) REFERENCES USERS(userID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_don_address
    FOREIGN KEY (addressID) REFERENCES ADDRESS(addressID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_don_food
    FOREIGN KEY (foodID) REFERENCES FOODS(foodID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_don_status
    FOREIGN KEY (donation_statusID) REFERENCES DONATION_STATUS(donation_statusID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE PICKUP_TIMES (
  pickupID   VARCHAR(10) PRIMARY KEY,
  pickTime   VARCHAR(100) NOT NULL,
  donationID VARCHAR(10) NOT NULL,
  CONSTRAINT fk_pickup_donation
    FOREIGN KEY (donationID) REFERENCES DONATIONS(donationID)
      ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CLAIMS
-- ---------------------------------------------------------
DROP TABLE IF EXISTS CLAIM_STATUS;
CREATE TABLE CLAIM_STATUS (
  claim_statusID   VARCHAR(10) PRIMARY KEY,
  claim_statusName VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE CLAIMS (
  claimID        VARCHAR(10) PRIMARY KEY,
  pickupID       VARCHAR(10) NOT NULL,
  donationID     VARCHAR(10) NOT NULL,
  claim_statusID VARCHAR(10) NOT NULL,
  userID         VARCHAR(10) NOT NULL,
  CONSTRAINT fk_claim_pickup
    FOREIGN KEY (pickupID) REFERENCES PICKUP_TIMES(pickupID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_claim_donation
    FOREIGN KEY (donationID) REFERENCES DONATIONS(donationID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_claim_status
    FOREIGN KEY (claim_statusID) REFERENCES CLAIM_STATUS(claim_statusID)
      ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_claim_user
    FOREIGN KEY (userID) REFERENCES USERS(userID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------
DROP TABLE IF EXISTS NOTIFICATION_CATEGORIES;
CREATE TABLE NOTIFICATION_CATEGORIES (
  noticeCateID   VARCHAR(10) PRIMARY KEY,
  noticeCateName VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE NOTIFICATIONS (
  noticeID    VARCHAR(10) PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  is_read     BOOLEAN NOT NULL,
  message     VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP NOT NULL,
  foodID      VARCHAR(10),
  mealEntryID VARCHAR(10),
  claimID     VARCHAR(10),
  donationID  VARCHAR(10),
  userID      VARCHAR(10) NOT NULL,
  noticeCateID VARCHAR(10) NOT NULL,
  CONSTRAINT fk_n_food
    FOREIGN KEY (foodID) REFERENCES FOODS(foodID)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_n_me
    FOREIGN KEY (mealEntryID) REFERENCES MEAL_ENTRIES(mealEntryID)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_n_claim
    FOREIGN KEY (claimID) REFERENCES CLAIMS(claimID)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_n_donation
    FOREIGN KEY (donationID) REFERENCES DONATIONS(donationID)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_n_user
    FOREIGN KEY (userID) REFERENCES USERS(userID)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_n_category
    FOREIGN KEY (noticeCateID) REFERENCES NOTIFICATION_CATEGORIES(noticeCateID)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =========================================================
-- ID AUTOINCREMENT TRIGGERS (prefix + 3 digits)
-- Change prefix in each block if you want different codes
-- =========================================================
DELIMITER $$

-- ADDRESS -> 'A'
DROP TRIGGER IF EXISTS bi_address $$
CREATE TRIGGER bi_address
BEFORE INSERT ON ADDRESS
FOR EACH ROW
BEGIN
  IF NEW.addressID IS NULL OR NEW.addressID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(addressID, 2) AS UNSIGNED)) FROM ADDRESS), 0) + 1;
    SET NEW.addressID = CONCAT('A', @n);
  END IF;
END$$

-- USERS -> 'U'
DROP TRIGGER IF EXISTS bi_users $$
CREATE TRIGGER bi_users
BEFORE INSERT ON USERS
FOR EACH ROW
BEGIN
  IF NEW.userID IS NULL OR NEW.userID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(userID, 2) AS UNSIGNED)) FROM USERS), 0) + 1;
    SET NEW.userID = CONCAT('U', @n);
  END IF;
END$$

-- USER_SETTINGS -> 'S'
DROP TRIGGER IF EXISTS bi_usersettings $$
CREATE TRIGGER bi_usersettings
BEFORE INSERT ON USER_SETTINGS
FOR EACH ROW
BEGIN
  IF NEW.settingID IS NULL OR NEW.settingID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(settingID, 2) AS UNSIGNED)) FROM USER_SETTINGS), 0) + 1;
    SET NEW.settingID = CONCAT('S', @n);
  END IF;
END$$

-- CATEGORIES -> 'C'
DROP TRIGGER IF EXISTS bi_categories $$
CREATE TRIGGER bi_categories
BEFORE INSERT ON CATEGORIES
FOR EACH ROW
BEGIN
  IF NEW.categoryID IS NULL OR NEW.categoryID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(categoryID, 2) AS UNSIGNED)) FROM CATEGORIES), 0) + 1;
    SET NEW.categoryID = CONCAT('C', @n);
  END IF;
END$$

-- UNITS -> 'UN'
DROP TRIGGER IF EXISTS bi_units $$
CREATE TRIGGER bi_units
BEFORE INSERT ON UNITS
FOR EACH ROW
BEGIN
  IF NEW.unitID IS NULL OR NEW.unitID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(unitID, 3) AS UNSIGNED)) FROM UNITS WHERE LEFT(unitID,2)='UN'
    ), 0) + 1;
    SET NEW.unitID = CONCAT('UN', @n);
  END IF;
END$$

-- ACTION_TYPES -> 'AT'
DROP TRIGGER IF EXISTS bi_action_types $$
CREATE TRIGGER bi_action_types
BEFORE INSERT ON ACTION_TYPES
FOR EACH ROW
BEGIN
  IF NEW.actionTypeID IS NULL OR NEW.actionTypeID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(actionTypeID, 3) AS UNSIGNED)) FROM ACTION_TYPES WHERE LEFT(actionTypeID,2)='AT'
    ), 0) + 1;
    SET NEW.actionTypeID = CONCAT('AT', @n);
  END IF;
END$$

-- MEAL_TYPES -> 'MT'
DROP TRIGGER IF EXISTS bi_meal_types $$
CREATE TRIGGER bi_meal_types
BEFORE INSERT ON MEAL_TYPES
FOR EACH ROW
BEGIN
  IF NEW.mealTypeID IS NULL OR NEW.mealTypeID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(mealTypeID, 3) AS UNSIGNED)) FROM MEAL_TYPES WHERE LEFT(mealTypeID,2)='MT'
    ), 0) + 1;
    SET NEW.mealTypeID = CONCAT('MT', @n);
  END IF;
END$$

-- RECIPES -> 'R'
DROP TRIGGER IF EXISTS bi_recipes $$
CREATE TRIGGER bi_recipes
BEFORE INSERT ON RECIPES
FOR EACH ROW
BEGIN
  IF NEW.recipeID IS NULL OR NEW.recipeID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(recipeID, 2) AS UNSIGNED)) FROM RECIPES), 0) + 1;
    SET NEW.recipeID = CONCAT('R', @n);
  END IF;
END$$

-- INGREDIENTS -> 'IG'
DROP TRIGGER IF EXISTS bi_ingredients $$
CREATE TRIGGER bi_ingredients
BEFORE INSERT ON INGREDIENTS
FOR EACH ROW
BEGIN
  IF NEW.ingredientID IS NULL OR NEW.ingredientID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(ingredientID, 3) AS UNSIGNED)) FROM INGREDIENTS WHERE LEFT(ingredientID,2)='IG'
    ), 0) + 1;
    SET NEW.ingredientID = CONCAT('IG', @n);
  END IF;
END$$

-- RECIPE_INGREDIENTS -> 'RI'
DROP TRIGGER IF EXISTS bi_recipe_ingredients $$
CREATE TRIGGER bi_recipe_ingredients
BEFORE INSERT ON RECIPE_INGREDIENTS
FOR EACH ROW
BEGIN
  IF NEW.recipe_ingredientID IS NULL OR NEW.recipe_ingredientID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(recipe_ingredientID, 3) AS UNSIGNED)) FROM RECIPE_INGREDIENTS WHERE LEFT(recipe_ingredientID,2)='RI'
    ), 0) + 1;
    SET NEW.recipe_ingredientID = CONCAT('RI', @n);
  END IF;
END$$

-- MEAL_PLAN_CALENDARS -> 'MP'
DROP TRIGGER IF EXISTS bi_meal_plan_calendars $$
CREATE TRIGGER bi_meal_plan_calendars
BEFORE INSERT ON MEAL_PLAN_CALENDARS
FOR EACH ROW
BEGIN
  IF NEW.mealPlanID IS NULL OR NEW.mealPlanID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(mealPlanID, 3) AS UNSIGNED)) FROM MEAL_PLAN_CALENDARS WHERE LEFT(mealPlanID,2)='MP'
    ), 0) + 1;
    SET NEW.mealPlanID = CONCAT('MP', @n);
  END IF;
END$$

-- MEAL_ENTRIES -> 'ME'
DROP TRIGGER IF EXISTS bi_meal_entries $$
CREATE TRIGGER bi_meal_entries
BEFORE INSERT ON MEAL_ENTRIES
FOR EACH ROW
BEGIN
  IF NEW.mealEntryID IS NULL OR NEW.mealEntryID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(mealEntryID, 3) AS UNSIGNED)) FROM MEAL_ENTRIES WHERE LEFT(mealEntryID,2)='ME'
    ), 0) + 1;
    SET NEW.mealEntryID = CONCAT('ME', @n);
  END IF;
END$$

-- FOODS -> 'F'
DROP TRIGGER IF EXISTS bi_foods $$
CREATE TRIGGER bi_foods
BEFORE INSERT ON FOODS
FOR EACH ROW
BEGIN
  IF NEW.foodID IS NULL OR NEW.foodID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(foodID, 2) AS UNSIGNED)) FROM FOODS), 0) + 1;
    SET NEW.foodID = CONCAT('F', @n);
  END IF;
END$$

-- FOOD_RESERVATIONS -> 'FR'
DROP TRIGGER IF EXISTS bi_food_reservations $$
CREATE TRIGGER bi_food_reservations
BEFORE INSERT ON FOOD_RESERVATIONS
FOR EACH ROW
BEGIN
  IF NEW.reservationID IS NULL OR NEW.reservationID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(reservationID, 3) AS UNSIGNED)) FROM FOOD_RESERVATIONS WHERE LEFT(reservationID,2)='FR'
    ), 0) + 1;
    SET NEW.reservationID = CONCAT('FR', @n);
  END IF;
END$$

-- ACTIONS -> 'AC'
DROP TRIGGER IF EXISTS bi_actions $$
CREATE TRIGGER bi_actions
BEFORE INSERT ON ACTIONS
FOR EACH ROW
BEGIN
  IF NEW.actionID IS NULL OR NEW.actionID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(actionID, 3) AS UNSIGNED)) FROM ACTIONS WHERE LEFT(actionID,2)='AC'
    ), 0) + 1;
    SET NEW.actionID = CONCAT('AC', @n);
  END IF;
END$$

-- DONATION_STATUS -> 'DS'
DROP TRIGGER IF EXISTS bi_donation_status $$
CREATE TRIGGER bi_donation_status
BEFORE INSERT ON DONATION_STATUS
FOR EACH ROW
BEGIN
  IF NEW.donation_statusID IS NULL OR NEW.donation_statusID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(donation_statusID, 3) AS UNSIGNED)) FROM DONATION_STATUS WHERE LEFT(donation_statusID,2)='DS'
    ), 0) + 1;
    SET NEW.donation_statusID = CONCAT('DS', @n);
  END IF;
END$$

-- DONATIONS -> 'D'
DROP TRIGGER IF EXISTS bi_donations $$
CREATE TRIGGER bi_donations
BEFORE INSERT ON DONATIONS
FOR EACH ROW
BEGIN
  IF NEW.donationID IS NULL OR NEW.donationID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(donationID, 2) AS UNSIGNED)) FROM DONATIONS), 0) + 1;
    SET NEW.donationID = CONCAT('D', @n);
  END IF;
END$$

-- PICKUP_TIMES -> 'PT'
DROP TRIGGER IF EXISTS bi_pickup_times $$
CREATE TRIGGER bi_pickup_times
BEFORE INSERT ON PICKUP_TIMES
FOR EACH ROW
BEGIN
  IF NEW.pickupID IS NULL OR NEW.pickupID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(pickupID, 3) AS UNSIGNED)) FROM PICKUP_TIMES WHERE LEFT(pickupID,2)='PT'
    ), 0) + 1;
    SET NEW.pickupID = CONCAT('PT', @n);
  END IF;
END$$

-- CLAIM_STATUS -> 'CS'
DROP TRIGGER IF EXISTS bi_claim_status $$
CREATE TRIGGER bi_claim_status
BEFORE INSERT ON CLAIM_STATUS
FOR EACH ROW
BEGIN
  IF NEW.claim_statusID IS NULL OR NEW.claim_statusID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(claim_statusID, 3) AS UNSIGNED)) FROM CLAIM_STATUS WHERE LEFT(claim_statusID,2)='CS'
    ), 0) + 1;
    SET NEW.claim_statusID = CONCAT('CS', @n);
  END IF;
END$$

-- CLAIMS -> 'CL'
DROP TRIGGER IF EXISTS bi_claims $$
CREATE TRIGGER bi_claims
BEFORE INSERT ON CLAIMS
FOR EACH ROW
BEGIN
  IF NEW.claimID IS NULL OR NEW.claimID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(claimID, 3) AS UNSIGNED)) FROM CLAIMS WHERE LEFT(claimID,2)='CL'
    ), 0) + 1;
    SET NEW.claimID = CONCAT('CL', @n);
  END IF;
END$$

-- NOTIFICATION_CATEGORIES -> 'NC'
DROP TRIGGER IF EXISTS bi_notification_categories $$
CREATE TRIGGER bi_notification_categories
BEFORE INSERT ON NOTIFICATION_CATEGORIES
FOR EACH ROW
BEGIN
  IF NEW.noticeCateID IS NULL OR NEW.noticeCateID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(noticeCateID, 3) AS UNSIGNED)) FROM NOTIFICATION_CATEGORIES WHERE LEFT(noticeCateID,2)='NC'
    ), 0) + 1;
    SET NEW.noticeCateID = CONCAT('NC', @n);
  END IF;
END$$

-- NOTIFICATIONS -> 'N'
DROP TRIGGER IF EXISTS bi_notifications $$
CREATE TRIGGER bi_notifications
BEFORE INSERT ON NOTIFICATIONS
FOR EACH ROW
BEGIN
  IF NEW.noticeID IS NULL OR NEW.noticeID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(noticeID, 2) AS UNSIGNED)) FROM NOTIFICATIONS), 0) + 1;
    SET NEW.noticeID = CONCAT('N', @n);
  END IF;
END$$

DELIMITER ;


-- =========================================================
-- Done. You can now INSERT rows without providing IDs and
-- the triggers will generate U001, A001, F001, etc.
-- =========================================================
