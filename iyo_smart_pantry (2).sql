-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2025 at 09:28 PM
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
CREATE DATABASE IF NOT EXISTS `iyo_smart_pantry` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `iyo_smart_pantry`;

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
) ;

--
-- Triggers `actions`
--
DELIMITER $$
CREATE TRIGGER `bi_actions` BEFORE INSERT ON `actions` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.actionID IS NULL OR NEW.actionID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(actionID,2) AS UNSIGNED)),0)+1 INTO n FROM ACTIONS;
    SET NEW.actionID = CONCAT('A', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `action_types`
--

INSERT INTO `action_types` (`actionTypeID`, `actionTypeName`) VALUES
('AT1', 'Used'),
('AT2', 'Reserved'),
('AT3', 'Donated');

--
-- Triggers `action_types`
--
DELIMITER $$
CREATE TRIGGER `bi_action_types` BEFORE INSERT ON `action_types` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.actionTypeID IS NULL OR NEW.actionTypeID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(actionTypeID,3) AS UNSIGNED)),0)+1 INTO n
    FROM ACTION_TYPES WHERE LEFT(actionTypeID,2)='AT';
    SET NEW.actionTypeID = CONCAT('AT', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`categoryID`, `categoryName`) VALUES
('C1', 'Protein'),
('C2', 'Grains'),
('C3', 'Fruits'),
('C4', 'Vegetables'),
('C5', 'Dairy'),
('C6', 'Canned Food'),
('C7', 'Other');

--
-- Triggers `categories`
--
DELIMITER $$
CREATE TRIGGER `bi_categories` BEFORE INSERT ON `categories` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.categoryID IS NULL OR NEW.categoryID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(categoryID,2) AS UNSIGNED)),0)+1 INTO n FROM CATEGORIES;
    SET NEW.categoryID = CONCAT('C', n);
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
) ;

--
-- Triggers `donations`
--
DELIMITER $$
CREATE TRIGGER `bi_donations` BEFORE INSERT ON `donations` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.donationID IS NULL OR NEW.donationID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(donationID,2) AS UNSIGNED)),0)+1 INTO n FROM DONATIONS;
    SET NEW.donationID = CONCAT('D', n);
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
) ;

--
-- Triggers `foods`
--
DELIMITER $$
CREATE TRIGGER `bi_foods` BEFORE INSERT ON `foods` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.foodID IS NULL OR NEW.foodID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(foodID,2) AS UNSIGNED)),0)+1 INTO n FROM FOODS;
    SET NEW.foodID = CONCAT('F', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `ingredients`
--
DELIMITER $$
CREATE TRIGGER `bi_ingredients` BEFORE INSERT ON `ingredients` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.ingredientID IS NULL OR NEW.ingredientID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(ingredientID,2) AS UNSIGNED)),0)+1 INTO n FROM INGREDIENTS;
    SET NEW.ingredientID = CONCAT('I', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `meal_entries`
--
DELIMITER $$
CREATE TRIGGER `bi_meal_entries` BEFORE INSERT ON `meal_entries` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.mealEntryID IS NULL OR NEW.mealEntryID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(mealEntryID,3) AS UNSIGNED)),0)+1 INTO n
    FROM MEAL_ENTRIES WHERE LEFT(mealEntryID,2)='ME';
    SET NEW.mealEntryID = CONCAT('ME', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `meal_plan_calendars`
--
DELIMITER $$
CREATE TRIGGER `bi_meal_plan_calendars` BEFORE INSERT ON `meal_plan_calendars` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.mealPlanID IS NULL OR NEW.mealPlanID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(mealPlanID,3) AS UNSIGNED)),0)+1 INTO n
    FROM MEAL_PLAN_CALENDARS WHERE LEFT(mealPlanID,2)='MP';
    SET NEW.mealPlanID = CONCAT('MP', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meal_types`
--

INSERT INTO `meal_types` (`mealTypeID`, `mealTypeName`) VALUES
('MT1', 'Breakfast'),
('MT2', 'Brunch'),
('MT3', 'Lunch'),
('MT4', 'Tea Time'),
('MT5', 'Dinner');

--
-- Triggers `meal_types`
--
DELIMITER $$
CREATE TRIGGER `bi_meal_types` BEFORE INSERT ON `meal_types` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.mealTypeID IS NULL OR NEW.mealTypeID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(mealTypeID,3) AS UNSIGNED)),0)+1 INTO n
    FROM MEAL_TYPES WHERE LEFT(mealTypeID,2)='MT';
    SET NEW.mealTypeID = CONCAT('MT', n);
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
  `foodID` varchar(10) DEFAULT NULL,
  `mealEntryID` varchar(10) DEFAULT NULL,
  `donationID` varchar(10) DEFAULT NULL,
  `userID` varchar(10) NOT NULL,
  `noticeCateID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `notifications`
--
DELIMITER $$
CREATE TRIGGER `bi_notifications` BEFORE INSERT ON `notifications` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.noticeID IS NULL OR NEW.noticeID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(noticeID,2) AS UNSIGNED)),0)+1 INTO n FROM NOTIFICATIONS;
    SET NEW.noticeID = CONCAT('N', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_categories`
--

INSERT INTO `notification_categories` (`noticeCateID`, `noticeCateName`) VALUES
('NC1', 'Inventory'),
('NC2', 'Expiry'),
('NC3', 'MealPlan'),
('NC4', 'Donation'),
('NC5', 'System'),
('NC6', 'Account');

--
-- Triggers `notification_categories`
--
DELIMITER $$
CREATE TRIGGER `bi_notification_categories` BEFORE INSERT ON `notification_categories` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.noticeCateID IS NULL OR NEW.noticeCateID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(noticeCateID,3) AS UNSIGNED)),0)+1 INTO n
    FROM NOTIFICATION_CATEGORIES WHERE LEFT(noticeCateID,2)='NC';
    SET NEW.noticeCateID = CONCAT('NC', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `pickup_times`
--
DELIMITER $$
CREATE TRIGGER `bi_pickup_times` BEFORE INSERT ON `pickup_times` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.pickupID IS NULL OR NEW.pickupID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(pickupID,3) AS UNSIGNED)),0)+1 INTO n
    FROM PICKUP_TIMES WHERE LEFT(pickupID,2)='PK';
    SET NEW.pickupID = CONCAT('PK', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `recipes`
--
DELIMITER $$
CREATE TRIGGER `bi_recipes` BEFORE INSERT ON `recipes` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.recipeID IS NULL OR NEW.recipeID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(recipeID,2) AS UNSIGNED)),0)+1 INTO n FROM RECIPES;
    SET NEW.recipeID = CONCAT('R', n);
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
) ;

--
-- Triggers `recipe_ingredients`
--
DELIMITER $$
CREATE TRIGGER `bi_recipe_ingredients` BEFORE INSERT ON `recipe_ingredients` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.recipe_ingredientID IS NULL OR NEW.recipe_ingredientID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(recipe_ingredientID,3) AS UNSIGNED)),0)+1 INTO n
    FROM RECIPE_INGREDIENTS WHERE LEFT(recipe_ingredientID,2)='RI';
    SET NEW.recipe_ingredientID = CONCAT('RI', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `storages`
--
DELIMITER $$
CREATE TRIGGER `bi_storages` BEFORE INSERT ON `storages` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.storageID IS NULL OR NEW.storageID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(storageID,3) AS UNSIGNED)),0)+1 INTO n
    FROM STORAGES WHERE LEFT(storageID,2)='ST';
    SET NEW.storageID = CONCAT('ST', n);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`unitID`, `unitName`) VALUES
('UN1', 'kg'),
('UN2', 'g'),
('UN3', 'pcs'),
('UN4', 'pack'),
('UN5', 'ml'),
('UN6', 'l'),
('UN7', 'bottle'),
('UN8', 'Other');

--
-- Triggers `units`
--
DELIMITER $$
CREATE TRIGGER `bi_units` BEFORE INSERT ON `units` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.unitID IS NULL OR NEW.unitID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(unitID,3) AS UNSIGNED)),0)+1 INTO n
    FROM UNITS WHERE LEFT(unitID,2)='UN';
    SET NEW.unitID = CONCAT('UN', n);
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
) ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `fullName`, `email`, `password`, `twoFA`, `status`, `createdAt`, `householdSize`) VALUES
('U1', 'MrQin', 'kuanchinzhong@gmail.com', '$2y$10$VyV23qizU/z..UY0Xay8AOEfsn8weU9GQK2zQXaaIDXDnR4snzInq', 0, 'Pending', '2025-10-03 18:59:28', 1);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `bi_users` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
  DECLARE n BIGINT;
  IF NEW.userID IS NULL OR NEW.userID = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(userID,2) AS UNSIGNED)),0)+1 INTO n FROM USERS;
    SET NEW.userID = CONCAT('U', n);
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
  ADD KEY `idx_actions_user` (`userID`,`actionDate`),
  ADD KEY `idx_actions_type` (`actionTypeID`,`actionDate`),
  ADD KEY `idx_actions_food` (`foodID`,`actionDate`);

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
  ADD KEY `idx_ing_category` (`categoryID`);

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
  ADD KEY `fk_n_food` (`foodID`),
  ADD KEY `fk_n_me` (`mealEntryID`),
  ADD KEY `fk_n_donation` (`donationID`),
  ADD KEY `fk_n_category` (`noticeCateID`),
  ADD KEY `idx_notif_user_read` (`userID`,`is_read`,`created_at`);

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
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `actions`
--
ALTER TABLE `actions`
  ADD CONSTRAINT `fk_act_food` FOREIGN KEY (`foodID`) REFERENCES `foods` (`foodID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_act_me` FOREIGN KEY (`mealEntryID`) REFERENCES `meal_entries` (`mealEntryID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_act_type` FOREIGN KEY (`actionTypeID`) REFERENCES `action_types` (`actionTypeID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_act_unit` FOREIGN KEY (`unitID`) REFERENCES `units` (`unitID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_act_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_n_category` FOREIGN KEY (`noticeCateID`) REFERENCES `notification_categories` (`noticeCateID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_donation` FOREIGN KEY (`donationID`) REFERENCES `donations` (`donationID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_food` FOREIGN KEY (`foodID`) REFERENCES `foods` (`foodID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_me` FOREIGN KEY (`mealEntryID`) REFERENCES `meal_entries` (`mealEntryID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

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
