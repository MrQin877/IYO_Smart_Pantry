-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2025 at 08:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `iyo_smart_pantry`
--

-- --------------------------------------------------------

--
-- Table structure for table `actions`
--

CREATE TABLE `actions` (
  `actionID` varchar(10) NOT NULL,
  `actionQty` decimal(10,2) NOT NULL,
  `actionDate` date DEFAULT NULL,
  `userID` varchar(10) NOT NULL,
  `foodID` varchar(10) NOT NULL,
  `unitID` varchar(10) NOT NULL,
  `actionTypeID` varchar(10) NOT NULL,
  `mealEntryID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `actions`
--
DELIMITER $$
CREATE TRIGGER `bi_actions` BEFORE INSERT ON `actions` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.actionID IS NULL OR NEW.actionID = '' THEN
    SELECT GET_LOCK('seq_A', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(actionID, 2) AS UNSIGNED)),0)+1
      INTO n FROM actions WHERE actionID LIKE 'A%';
    SET NEW.actionID = CONCAT('A', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_A') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `action_types`
--

CREATE TABLE `action_types` (
  `actionTypeID` varchar(10) NOT NULL,
  `actionTypeName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `action_types`
--

INSERT INTO `action_types` (`actionTypeID`, `actionTypeName`) VALUES
('AT0001', 'Used'),
('AT0002', 'Donated'),
('AT0003', 'Reserved');

--
-- Triggers `action_types`
--
DELIMITER $$
CREATE TRIGGER `bi_action_types` BEFORE INSERT ON `action_types` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.actionTypeID IS NULL OR NEW.actionTypeID = '' THEN
    SELECT GET_LOCK('seq_AT', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(actionTypeID, 3) AS UNSIGNED)),0)+1
      INTO n FROM action_types WHERE actionTypeID LIKE 'AT%';
    SET NEW.actionTypeID = CONCAT('AT', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_AT') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `categoryID` varchar(10) NOT NULL,
  `categoryName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`categoryID`, `categoryName`) VALUES
('C0001', 'Protein'),
('C0002', 'Grains'),
('C0003', 'Fruits'),
('C0004', 'Vegetables'),
('C0005', 'Dairy'),
('C0006', 'Canned Food'),
('C0007', 'Other');

--
-- Triggers `categories`
--
DELIMITER $$
CREATE TRIGGER `bi_categories` BEFORE INSERT ON `categories` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.categoryID IS NULL OR NEW.categoryID = '' THEN
    SELECT GET_LOCK('seq_C', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(categoryID, 2) AS UNSIGNED)),0)+1
      INTO n FROM categories WHERE categoryID LIKE 'C%';
    SET NEW.categoryID = CONCAT('C', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_C') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `donationID` varchar(10) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `contact` varchar(15) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `pickupLocation` varchar(255) DEFAULT NULL,
  `foodID` varchar(10) DEFAULT NULL,
  `userID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `donations`
--
DELIMITER $$
CREATE TRIGGER `bi_donations` BEFORE INSERT ON `donations` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.donationID IS NULL OR NEW.donationID = '' THEN
    SELECT GET_LOCK('seq_D', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(donationID, 2) AS UNSIGNED)),0)+1
      INTO n FROM donations WHERE donationID LIKE 'D%';
    SET NEW.donationID = CONCAT('D', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_D') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `foods`
--

CREATE TABLE `foods` (
  `foodID` varchar(10) NOT NULL,
  `foodName` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `expiryDate` date DEFAULT NULL,
  `is_plan` tinyint(1) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `storageID` varchar(10) DEFAULT NULL,
  `userID` varchar(10) DEFAULT NULL,
  `categoryID` varchar(10) DEFAULT NULL,
  `unitID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `foods`
--
DELIMITER $$
CREATE TRIGGER `bi_foods` BEFORE INSERT ON `foods` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.foodID IS NULL OR NEW.foodID = '' THEN
    SELECT GET_LOCK('seq_F', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(foodID, 2) AS UNSIGNED)),0)+1
      INTO n FROM foods WHERE foodID LIKE 'F%';
    SET NEW.foodID = CONCAT('F', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_F') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `ingredientID` varchar(10) NOT NULL,
  `ingredientName` varchar(255) NOT NULL,
  `categoryID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `ingredients`
--
DELIMITER $$
CREATE TRIGGER `bi_ingredients` BEFORE INSERT ON `ingredients` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.ingredientID IS NULL OR NEW.ingredientID = '' THEN
    SELECT GET_LOCK('seq_I', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(ingredientID, 2) AS UNSIGNED)),0)+1
      INTO n FROM ingredients WHERE ingredientID LIKE 'I%';
    SET NEW.ingredientID = CONCAT('I', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_I') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `meal_entries`
--

CREATE TABLE `meal_entries` (
  `mealEntryID` varchar(10) NOT NULL,
  `mealDate` date NOT NULL,
  `mealName` varchar(255) DEFAULT NULL,
  `mealPlanID` varchar(10) NOT NULL,
  `mealTypeID` varchar(10) DEFAULT NULL,
  `recipeID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `meal_entries`
--
DELIMITER $$
CREATE TRIGGER `bi_meal_entries` BEFORE INSERT ON `meal_entries` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.mealEntryID IS NULL OR NEW.mealEntryID = '' THEN
    SELECT GET_LOCK('seq_ME', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(mealEntryID, 3) AS UNSIGNED)),0)+1
      INTO n FROM meal_entries WHERE mealEntryID LIKE 'ME%';
    SET NEW.mealEntryID = CONCAT('ME', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_ME') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `meal_plan_calendars`
--

CREATE TABLE `meal_plan_calendars` (
  `mealPlanID` varchar(10) NOT NULL,
  `weekStart` date NOT NULL,
  `userID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `meal_plan_calendars`
--
DELIMITER $$
CREATE TRIGGER `bi_meal_plan_calendars` BEFORE INSERT ON `meal_plan_calendars` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.mealPlanID IS NULL OR NEW.mealPlanID = '' THEN
    SELECT GET_LOCK('seq_MP', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(mealPlanID, 3) AS UNSIGNED)),0)+1
      INTO n FROM meal_plan_calendars WHERE mealPlanID LIKE 'MP%';
    SET NEW.mealPlanID = CONCAT('MP', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_MP') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `meal_types`
--

CREATE TABLE `meal_types` (
  `mealTypeID` varchar(10) NOT NULL,
  `mealTypeName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meal_types`
--

INSERT INTO `meal_types` (`mealTypeID`, `mealTypeName`) VALUES
('MT0001', 'Breakfast'),
('MT0002', 'Brunch'),
('MT0003', 'Lunch'),
('MT0004', 'Tea Time'),
('MT0005', 'Dinner');

--
-- Triggers `meal_types`
--
DELIMITER $$
CREATE TRIGGER `bi_meal_types` BEFORE INSERT ON `meal_types` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.mealTypeID IS NULL OR NEW.mealTypeID = '' THEN
    SELECT GET_LOCK('seq_MT', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(mealTypeID, 3) AS UNSIGNED)),0)+1
      INTO n FROM meal_types WHERE mealTypeID LIKE 'MT%';
    SET NEW.mealTypeID = CONCAT('MT', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_MT') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `noticeID` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `message` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `targetID` varchar(10) DEFAULT NULL,
  `targetType` enum('FOOD','MEAL_ENTRY','DONATION','SYSTEM') NOT NULL,
  `userID` varchar(10) NOT NULL,
  `noticeCateID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `notifications`
--
DELIMITER $$
CREATE TRIGGER `bi_notifications` BEFORE INSERT ON `notifications` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.noticeID IS NULL OR NEW.noticeID = '' THEN
    SELECT GET_LOCK('seq_N', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(noticeID, 2) AS UNSIGNED)),0)+1
      INTO n FROM notifications WHERE noticeID LIKE 'N%';
    SET NEW.noticeID = CONCAT('N', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_N') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `notification_categories`
--

CREATE TABLE `notification_categories` (
  `noticeCateID` varchar(10) NOT NULL,
  `noticeCateName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_categories`
--

INSERT INTO `notification_categories` (`noticeCateID`, `noticeCateName`) VALUES
('NC0001', 'Inventory'),
('NC0002', 'Expiry'),
('NC0003', 'MealPlan'),
('NC0004', 'Donation'),
('NC0005', 'System'),
('NC0006', 'Account');

--
-- Triggers `notification_categories`
--
DELIMITER $$
CREATE TRIGGER `bi_notification_categories` BEFORE INSERT ON `notification_categories` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.noticeCateID IS NULL OR NEW.noticeCateID = '' THEN
    SELECT GET_LOCK('seq_NC', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(noticeCateID, 3) AS UNSIGNED)),0)+1
      INTO n FROM notification_categories WHERE noticeCateID LIKE 'NC%';
    SET NEW.noticeCateID = CONCAT('NC', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_NC') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `pickup_times`
--

CREATE TABLE `pickup_times` (
  `pickupID` varchar(10) NOT NULL,
  `pickTime` varchar(100) NOT NULL,
  `donationID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `pickup_times`
--
DELIMITER $$
CREATE TRIGGER `bi_pickup_times` BEFORE INSERT ON `pickup_times` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.pickupID IS NULL OR NEW.pickupID = '' THEN
    SELECT GET_LOCK('seq_PK', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(pickupID, 3) AS UNSIGNED)),0)+1
      INTO n FROM pickup_times WHERE pickupID LIKE 'PK%';
    SET NEW.pickupID = CONCAT('PK', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_PK') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `recipeID` varchar(10) NOT NULL,
  `recipeName` varchar(255) NOT NULL,
  `instruction` text DEFAULT NULL,
  `serving` int(11) DEFAULT NULL,
  `isGeneric` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `recipes`
--
DELIMITER $$
CREATE TRIGGER `bi_recipes` BEFORE INSERT ON `recipes` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.recipeID IS NULL OR NEW.recipeID = '' THEN
    SELECT GET_LOCK('seq_R', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(recipeID, 2) AS UNSIGNED)),0)+1
      INTO n FROM recipes WHERE recipeID LIKE 'R%';
    SET NEW.recipeID = CONCAT('R', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_R') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `recipe_ingredients`
--

CREATE TABLE `recipe_ingredients` (
  `recipe_ingredientID` varchar(10) NOT NULL,
  `recipeID` varchar(10) NOT NULL,
  `ingredientID` varchar(10) NOT NULL,
  `quantityNeeded` decimal(10,2) NOT NULL,
  `unitID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `recipe_ingredients`
--
DELIMITER $$
CREATE TRIGGER `bi_recipe_ingredients` BEFORE INSERT ON `recipe_ingredients` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.recipe_ingredientID IS NULL OR NEW.recipe_ingredientID = '' THEN
    SELECT GET_LOCK('seq_RI', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(recipe_ingredientID, 3) AS UNSIGNED)),0)+1
      INTO n FROM recipe_ingredients WHERE recipe_ingredientID LIKE 'RI%';
    SET NEW.recipe_ingredientID = CONCAT('RI', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_RI') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `storages`
--

CREATE TABLE `storages` (
  `storageID` varchar(10) NOT NULL,
  `storageName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `storages`
--
DELIMITER $$
CREATE TRIGGER `bi_storages` BEFORE INSERT ON `storages` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.storageID IS NULL OR NEW.storageID = '' THEN
    SELECT GET_LOCK('seq_ST', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(storageID, 3) AS UNSIGNED)),0)+1
      INTO n FROM storages WHERE storageID LIKE 'ST%';
    SET NEW.storageID = CONCAT('ST', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_ST') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `unitID` varchar(10) NOT NULL,
  `unitName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`unitID`, `unitName`) VALUES
('UN0001', 'kg'),
('UN0002', 'g'),
('UN0003', 'pcs'),
('UN0004', 'pack'),
('UN0005', 'ml'),
('UN0006', 'l'),
('UN0007', 'bottle'),
('UN0008', 'Other');

--
-- Triggers `units`
--
DELIMITER $$
CREATE TRIGGER `bi_units` BEFORE INSERT ON `units` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.unitID IS NULL OR NEW.unitID = '' THEN
    SELECT GET_LOCK('seq_UN', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(unitID, 3) AS UNSIGNED)),0)+1
      INTO n FROM units WHERE unitID LIKE 'UN%';
    SET NEW.unitID = CONCAT('UN', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_UN') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` varchar(10) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `twoFA` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `householdSize` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `fullName`, `email`, `password`, `twoFA`, `status`, `createdAt`, `householdSize`) VALUES
('U0001', 'MrQin', 'kuanchinzhong@gmail.com', '$2y$10$VyV23qizU/z..UY0Xay8AOEfsn8weU9GQK2zQXaaIDXDnR4snzInq', 0, 'Pending', '2025-10-03 18:27:23', 1);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `bi_users` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
  DECLARE n INT;
  DECLARE got_lock INT;
  DECLARE rel_lock INT;

  IF NEW.userID IS NULL OR NEW.userID = '' THEN
    SELECT GET_LOCK('seq_U', 5) INTO got_lock;
    SELECT COALESCE(MAX(CAST(SUBSTRING(userID, 2) AS UNSIGNED)),0)+1
      INTO n FROM users WHERE userID LIKE 'U%';
    SET NEW.userID = CONCAT('U', LPAD(n,4,'0'));
    SELECT RELEASE_LOCK('seq_U') INTO rel_lock;
  END IF;
END
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actions`
--
ALTER TABLE `actions`
  ADD PRIMARY KEY (`actionID`),
  ADD KEY `fk_act_unit` (`unitID`),
  ADD KEY `fk_act_me` (`mealEntryID`),
  ADD KEY `idx_actions_food` (`foodID`,`actionDate`),
  ADD KEY `idx_actions_user` (`userID`,`actionDate`),
  ADD KEY `idx_actions_type` (`actionTypeID`,`actionDate`);

--
-- Indexes for table `action_types`
--
ALTER TABLE `action_types`
  ADD PRIMARY KEY (`actionTypeID`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categoryID`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`donationID`),
  ADD KEY `fk_don_food` (`foodID`),
  ADD KEY `fk_don_user` (`userID`);

--
-- Indexes for table `foods`
--
ALTER TABLE `foods`
  ADD PRIMARY KEY (`foodID`),
  ADD KEY `fk_food_storage` (`storageID`),
  ADD KEY `fk_food_category` (`categoryID`),
  ADD KEY `fk_food_unit` (`unitID`),
  ADD KEY `idx_foods_user` (`userID`),
  ADD KEY `idx_foods_expiry` (`expiryDate`);

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`ingredientID`),
  ADD KEY `fk_ing_category` (`categoryID`);

--
-- Indexes for table `meal_entries`
--
ALTER TABLE `meal_entries`
  ADD PRIMARY KEY (`mealEntryID`),
  ADD KEY `fk_me_type` (`mealTypeID`),
  ADD KEY `fk_me_recipe` (`recipeID`),
  ADD KEY `idx_me_plan_date` (`mealPlanID`,`mealDate`);

--
-- Indexes for table `meal_plan_calendars`
--
ALTER TABLE `meal_plan_calendars`
  ADD PRIMARY KEY (`mealPlanID`),
  ADD KEY `fk_mpc_user` (`userID`);

--
-- Indexes for table `meal_types`
--
ALTER TABLE `meal_types`
  ADD PRIMARY KEY (`mealTypeID`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`noticeID`),
  ADD KEY `fk_notif_cate` (`noticeCateID`),
  ADD KEY `idx_notif_user_read` (`userID`,`is_read`,`created_at`),
  ADD KEY `idx_notif_target` (`targetType`,`targetID`,`created_at`);

--
-- Indexes for table `notification_categories`
--
ALTER TABLE `notification_categories`
  ADD PRIMARY KEY (`noticeCateID`);

--
-- Indexes for table `pickup_times`
--
ALTER TABLE `pickup_times`
  ADD PRIMARY KEY (`pickupID`),
  ADD KEY `fk_pick_don` (`donationID`);

--
-- Indexes for table `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`recipeID`);

--
-- Indexes for table `recipe_ingredients`
--
ALTER TABLE `recipe_ingredients`
  ADD PRIMARY KEY (`recipe_ingredientID`),
  ADD KEY `fk_ri_recipe` (`recipeID`),
  ADD KEY `fk_ri_ingredient` (`ingredientID`),
  ADD KEY `fk_ri_unit` (`unitID`);

--
-- Indexes for table `storages`
--
ALTER TABLE `storages`
  ADD PRIMARY KEY (`storageID`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`unitID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `actions`
--
ALTER TABLE `actions`
  ADD CONSTRAINT `fk_act_food` FOREIGN KEY (`foodID`) REFERENCES `foods` (`foodID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_act_me` FOREIGN KEY (`mealEntryID`) REFERENCES `meal_entries` (`mealEntryID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_act_type` FOREIGN KEY (`actionTypeID`) REFERENCES `action_types` (`actionTypeID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_act_unit` FOREIGN KEY (`unitID`) REFERENCES `units` (`unitID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_act_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON UPDATE CASCADE;

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `fk_don_food` FOREIGN KEY (`foodID`) REFERENCES `foods` (`foodID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_don_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `foods`
--
ALTER TABLE `foods`
  ADD CONSTRAINT `fk_food_category` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_food_storage` FOREIGN KEY (`storageID`) REFERENCES `storages` (`storageID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_food_unit` FOREIGN KEY (`unitID`) REFERENCES `units` (`unitID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_food_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD CONSTRAINT `fk_ing_category` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `meal_entries`
--
ALTER TABLE `meal_entries`
  ADD CONSTRAINT `fk_me_plan` FOREIGN KEY (`mealPlanID`) REFERENCES `meal_plan_calendars` (`mealPlanID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_me_recipe` FOREIGN KEY (`recipeID`) REFERENCES `recipes` (`recipeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_me_type` FOREIGN KEY (`mealTypeID`) REFERENCES `meal_types` (`mealTypeID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `meal_plan_calendars`
--
ALTER TABLE `meal_plan_calendars`
  ADD CONSTRAINT `fk_mpc_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_cate` FOREIGN KEY (`noticeCateID`) REFERENCES `notification_categories` (`noticeCateID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pickup_times`
--
ALTER TABLE `pickup_times`
  ADD CONSTRAINT `fk_pick_don` FOREIGN KEY (`donationID`) REFERENCES `donations` (`donationID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipe_ingredients`
--
ALTER TABLE `recipe_ingredients`
  ADD CONSTRAINT `fk_ri_ingredient` FOREIGN KEY (`ingredientID`) REFERENCES `ingredients` (`ingredientID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ri_recipe` FOREIGN KEY (`recipeID`) REFERENCES `recipes` (`recipeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ri_unit` FOREIGN KEY (`unitID`) REFERENCES `units` (`unitID`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
