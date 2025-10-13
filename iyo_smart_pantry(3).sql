-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 12, 2025 at 11:13 PM
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `donations`
--

INSERT INTO `donations` (`donationID`, `quantity`, `contact`, `note`, `pickupLocation`, `foodID`, `userID`) VALUES
('D1', 1.50, '012-3456789', 'Please call before pickup', 'Block A, HELP Residence', 'F1', 'U1'),
('D10', 1.00, '014-9998887', 'Fresh juice, please collect ASAP', 'HELP Residence Kitchen', 'F10', 'U2'),
('D2', 2.00, '011-5566778', 'Still fresh, stored in fridge', 'HELP University Cafeteria Entrance', 'F3', 'U1'),
('D3', 1.00, '018-9012345', 'Family-sized pack, unopened', 'Lobby, Wisma HELP', 'F6', 'U2'),
('D4', 3.00, '010-8877665', 'Organic vegetables, please bring cooler bag', 'HELP Residence Gate 2', 'F7', 'U2'),
('D5', 0.50, '017-5544332', 'Near expiry, but still good', 'Block B, Level 2 Pantry', 'F5', 'U1'),
('D6', 2.00, '012-2223344', 'Available this weekend only', 'Outside Block K Canteen', 'F8', 'U2'),
('D7', 1.00, '019-6677889', 'Oil bottle sealed', 'HELP Main Lobby', 'F9', 'U2'),
('D8', 1.50, '013-1112223', 'Can pick up after 6 PM', 'HELP Hostel Reception', 'F2', 'U1'),
('D9', 2.00, '016-5556667', 'Stored frozen', 'HELP College Freezer Area', 'F4', 'U1');

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
  `reservedQty` decimal(10,2) NOT NULL DEFAULT 0.00,
  `usedQty` decimal(10,2) NOT NULL DEFAULT 0.00,
  `expiryDate` date DEFAULT NULL,
  `is_plan` tinyint(1) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `storageID` varchar(10) DEFAULT NULL,
  `userID` varchar(10) DEFAULT NULL,
  `categoryID` varchar(10) DEFAULT NULL,
  `unitID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `foods`
--

INSERT INTO `foods` (`foodID`, `foodName`, `quantity`, `reservedQty`, `usedQty`, `expiryDate`, `is_plan`, `remark`, `storageID`, `userID`, `categoryID`, `unitID`) VALUES
('F1', 'Chicken Breast', 2.50, 0.50, 0.20, '2025-11-05', 0, 'Fresh, store in freezer', 'ST2', 'U1', 'C1', 'UN1'),
('F10', 'Orange Juice', 2.00, 0.00, 0.30, '2025-11-12', 0, 'Freshly squeezed juice', 'ST1', 'U2', 'C3', 'UN6'),
('F11', 'dsad', 3.00, 0.00, 0.00, '2025-10-23', 0, NULL, NULL, 'U2', 'C6', 'UN7'),
('F2', 'White Rice', 5.00, 0.00, 1.00, '2026-02-10', 1, 'Staple food, store dry', 'ST7', 'U1', 'C2', 'UN1'),
('F3', 'Apple', 6.00, 0.00, 2.00, '2025-10-20', 0, 'Keep refrigerated', 'ST1', 'U1', 'C3', 'UN3'),
('F4', 'Broccoli', 3.00, 0.00, 1.00, '2025-10-18', 0, 'Fresh produce', 'ST1', 'U1', 'C4', 'UN3'),
('F5', 'Milk', 1.00, 0.00, 0.20, '2025-10-25', 0, 'Low fat milk', 'ST1', 'U1', 'C5', 'UN6'),
('F6', 'Canned Tuna', 4.00, 1.00, 0.00, '2027-03-15', 1, 'Long shelf life, protein source', 'ST3', 'U2', 'C6', 'UN4'),
('F7', 'Carrot', 10.00, 2.00, 1.00, '2025-10-22', 0, 'Organic carrots', 'ST1', 'U2', 'C4', 'UN3'),
('F8', 'Yogurt', 2.00, 0.00, 0.50, '2025-10-19', 1, 'Strawberry flavor yogurt', 'ST1', 'U2', 'C5', 'UN4'),
('F9', 'Olive Oil', 1.00, 0.00, 0.00, '2027-06-30', 0, 'Extra virgin olive oil', 'ST4', 'U2', 'C7', 'UN7');

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
-- Dumping data for table `pickup_times`
--

INSERT INTO `pickup_times` (`pickupID`, `pickTime`, `donationID`) VALUES
('PK1', '2025-10-14, 10:00 - 10:30', 'D1'),
('PK10', '2025-10-19, 08:00 - 08:15', 'D10'),
('PK2', '2025-10-14, 11:00 - 11:15', 'D2'),
('PK3', '2025-10-15, 09:00 - 09:30', 'D3'),
('PK4', '2025-10-15, 14:00 - 14:30', 'D4'),
('PK5', '2025-10-16, 16:30 - 17:00', 'D5'),
('PK6', '2025-10-17, 10:00 - 10:45', 'D6'),
('PK7', '2025-10-17, 13:00 - 13:30', 'D7'),
('PK8', '2025-10-18, 18:00 - 18:30', 'D8'),
('PK9', '2025-10-18, 09:30 - 10:00', 'D9');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Dumping data for table `storages`
--

INSERT INTO `storages` (`storageID`, `storageName`) VALUES
('ST1', 'Fridge'),
('ST10', 'Other'),
('ST2', 'Freezer'),
('ST3', 'Pantry Shelf'),
('ST4', 'Kitchen Cabinet'),
('ST5', 'Dining Room Cupboard'),
('ST6', 'Garage Storage'),
('ST7', 'Dry Storage'),
('ST8', 'Wine Cooler'),
('ST9', 'Medicine Cabinet');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `fullName`, `email`, `password`, `twoFA`, `status`, `createdAt`, `householdSize`) VALUES
('U1', 'MrQin', 'kuanchinzhong@gmail.com', '$2y$10$xPPJCflHma0rQ7LaTorv/.E8bXHFKOV151JNozkABtGOEWyalVypa', 0, 'Active', '2025-10-03 18:59:28', 1),
('U2', 'Ashton', 'zclim01234@gmail.com', '$2y$10$xPPJCflHma0rQ7LaTorv/.E8bXHFKOV151JNozkABtGOEWyalVypa', 1, 'Active', '2025-10-11 23:11:58', 2);

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
--
-- Database: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Table structure for table `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Table structure for table `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Table structure for table `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Table structure for table `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

-- --------------------------------------------------------

--
-- Table structure for table `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Table structure for table `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Table structure for table `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Dumping data for table `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('root', '[{\"db\":\"iyo_smart_pantry\",\"table\":\"users\"},{\"db\":\"iyo_smart_pantry\",\"table\":\"pickup_times\"},{\"db\":\"iyo_smart_pantry\",\"table\":\"meal_plan_calendars\"},{\"db\":\"iyo_smart_pantry\",\"table\":\"action_types\"},{\"db\":\"iyo_smart_pantry\",\"table\":\"actions\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Table structure for table `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

-- --------------------------------------------------------

--
-- Table structure for table `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Dumping data for table `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2025-10-01 02:38:22', '{\"Console\\/Mode\":\"collapse\"}');

-- --------------------------------------------------------

--
-- Table structure for table `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Table structure for table `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indexes for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indexes for table `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indexes for table `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indexes for table `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indexes for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indexes for table `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indexes for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indexes for table `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indexes for table `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indexes for table `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indexes for table `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indexes for table `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indexes for table `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Database: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;
--
-- Database: `tutorial_3`
--
CREATE DATABASE IF NOT EXISTS `tutorial_3` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `tutorial_3`;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
