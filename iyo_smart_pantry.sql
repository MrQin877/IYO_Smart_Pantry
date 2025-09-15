-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 15, 2025 at 04:01 AM
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
  `actionDate` date NOT NULL,
  `userID` varchar(10) NOT NULL,
  `foodID` varchar(10) NOT NULL,
  `unitID` varchar(10) NOT NULL,
  `actionTypeID` varchar(10) NOT NULL,
  `mealEntryID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `actions`
--
DELIMITER $$
CREATE TRIGGER `bi_actions` BEFORE INSERT ON `actions` FOR EACH ROW BEGIN
  IF NEW.actionID IS NULL OR NEW.actionID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(actionID, 3) AS UNSIGNED)) FROM ACTIONS WHERE LEFT(actionID,2)='AC'
    ), 0) + 1;
    SET NEW.actionID = CONCAT('AC', @n);
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
-- Triggers `action_types`
--
DELIMITER $$
CREATE TRIGGER `bi_action_types` BEFORE INSERT ON `action_types` FOR EACH ROW BEGIN
  IF NEW.actionTypeID IS NULL OR NEW.actionTypeID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(actionTypeID, 3) AS UNSIGNED)) FROM ACTION_TYPES WHERE LEFT(actionTypeID,2)='AT'
    ), 0) + 1;
    SET NEW.actionTypeID = CONCAT('AT', @n);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE `address` (
  `addressID` varchar(10) NOT NULL,
  `addressLabel` varchar(255) DEFAULT NULL,
  `line1` varchar(255) NOT NULL,
  `line2` varchar(255) NOT NULL,
  `postcode` char(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `address`
--
DELIMITER $$
CREATE TRIGGER `bi_address` BEFORE INSERT ON `address` FOR EACH ROW BEGIN
  IF NEW.addressID IS NULL OR NEW.addressID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(addressID, 2) AS UNSIGNED)) FROM ADDRESS), 0) + 1;
    SET NEW.addressID = CONCAT('A', @n);
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
-- Triggers `categories`
--
DELIMITER $$
CREATE TRIGGER `bi_categories` BEFORE INSERT ON `categories` FOR EACH ROW BEGIN
  IF NEW.categoryID IS NULL OR NEW.categoryID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(categoryID, 2) AS UNSIGNED)) FROM CATEGORIES), 0) + 1;
    SET NEW.categoryID = CONCAT('C', @n);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `claims`
--

CREATE TABLE `claims` (
  `claimID` varchar(10) NOT NULL,
  `pickupID` varchar(10) NOT NULL,
  `donationID` varchar(10) NOT NULL,
  `claim_statusID` varchar(10) NOT NULL,
  `userID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `claims`
--
DELIMITER $$
CREATE TRIGGER `bi_claims` BEFORE INSERT ON `claims` FOR EACH ROW BEGIN
  IF NEW.claimID IS NULL OR NEW.claimID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(claimID, 3) AS UNSIGNED)) FROM CLAIMS WHERE LEFT(claimID,2)='CL'
    ), 0) + 1;
    SET NEW.claimID = CONCAT('CL', @n);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `claim_status`
--

CREATE TABLE `claim_status` (
  `claim_statusID` varchar(10) NOT NULL,
  `claim_statusName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `claim_status`
--
DELIMITER $$
CREATE TRIGGER `bi_claim_status` BEFORE INSERT ON `claim_status` FOR EACH ROW BEGIN
  IF NEW.claim_statusID IS NULL OR NEW.claim_statusID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(claim_statusID, 3) AS UNSIGNED)) FROM CLAIM_STATUS WHERE LEFT(claim_statusID,2)='CS'
    ), 0) + 1;
    SET NEW.claim_statusID = CONCAT('CS', @n);
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
  `contact` varchar(15) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `userID` varchar(10) NOT NULL,
  `addressID` varchar(10) NOT NULL,
  `foodID` varchar(10) NOT NULL,
  `donation_statusID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `donations`
--
DELIMITER $$
CREATE TRIGGER `bi_donations` BEFORE INSERT ON `donations` FOR EACH ROW BEGIN
  IF NEW.donationID IS NULL OR NEW.donationID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(donationID, 2) AS UNSIGNED)) FROM DONATIONS), 0) + 1;
    SET NEW.donationID = CONCAT('D', @n);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `donation_status`
--

CREATE TABLE `donation_status` (
  `donation_statusID` varchar(10) NOT NULL,
  `donation_statusName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `donation_status`
--
DELIMITER $$
CREATE TRIGGER `bi_donation_status` BEFORE INSERT ON `donation_status` FOR EACH ROW BEGIN
  IF NEW.donation_statusID IS NULL OR NEW.donation_statusID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(donation_statusID, 3) AS UNSIGNED)) FROM DONATION_STATUS WHERE LEFT(donation_statusID,2)='DS'
    ), 0) + 1;
    SET NEW.donation_statusID = CONCAT('DS', @n);
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
  `expiryDate` date NOT NULL,
  `is_expiryStatus` tinyint(1) NOT NULL,
  `is_plan` tinyint(1) NOT NULL,
  `storageLocation` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `userID` varchar(10) NOT NULL,
  `categoryID` varchar(10) NOT NULL,
  `unitID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `foods`
--
DELIMITER $$
CREATE TRIGGER `bi_foods` BEFORE INSERT ON `foods` FOR EACH ROW BEGIN
  IF NEW.foodID IS NULL OR NEW.foodID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(foodID, 2) AS UNSIGNED)) FROM FOODS), 0) + 1;
    SET NEW.foodID = CONCAT('F', @n);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `food_reservations`
--

CREATE TABLE `food_reservations` (
  `reservationID` varchar(10) NOT NULL,
  `qty` decimal(10,2) NOT NULL,
  `foodID` varchar(10) NOT NULL,
  `mealEntryID` varchar(10) NOT NULL,
  `unitID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `food_reservations`
--
DELIMITER $$
CREATE TRIGGER `bi_food_reservations` BEFORE INSERT ON `food_reservations` FOR EACH ROW BEGIN
  IF NEW.reservationID IS NULL OR NEW.reservationID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(reservationID, 3) AS UNSIGNED)) FROM FOOD_RESERVATIONS WHERE LEFT(reservationID,2)='FR'
    ), 0) + 1;
    SET NEW.reservationID = CONCAT('FR', @n);
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
  `categoryID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `ingredients`
--
DELIMITER $$
CREATE TRIGGER `bi_ingredients` BEFORE INSERT ON `ingredients` FOR EACH ROW BEGIN
  IF NEW.ingredientID IS NULL OR NEW.ingredientID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(ingredientID, 3) AS UNSIGNED)) FROM INGREDIENTS WHERE LEFT(ingredientID,2)='IG'
    ), 0) + 1;
    SET NEW.ingredientID = CONCAT('IG', @n);
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
  `mealName` varchar(255) NOT NULL,
  `mealPlanID` varchar(10) NOT NULL,
  `mealTypeID` varchar(10) NOT NULL,
  `recipeID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `meal_entries`
--
DELIMITER $$
CREATE TRIGGER `bi_meal_entries` BEFORE INSERT ON `meal_entries` FOR EACH ROW BEGIN
  IF NEW.mealEntryID IS NULL OR NEW.mealEntryID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(mealEntryID, 3) AS UNSIGNED)) FROM MEAL_ENTRIES WHERE LEFT(mealEntryID,2)='ME'
    ), 0) + 1;
    SET NEW.mealEntryID = CONCAT('ME', @n);
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
  IF NEW.mealPlanID IS NULL OR NEW.mealPlanID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(mealPlanID, 3) AS UNSIGNED)) FROM MEAL_PLAN_CALENDARS WHERE LEFT(mealPlanID,2)='MP'
    ), 0) + 1;
    SET NEW.mealPlanID = CONCAT('MP', @n);
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
-- Triggers `meal_types`
--
DELIMITER $$
CREATE TRIGGER `bi_meal_types` BEFORE INSERT ON `meal_types` FOR EACH ROW BEGIN
  IF NEW.mealTypeID IS NULL OR NEW.mealTypeID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(mealTypeID, 3) AS UNSIGNED)) FROM MEAL_TYPES WHERE LEFT(mealTypeID,2)='MT'
    ), 0) + 1;
    SET NEW.mealTypeID = CONCAT('MT', @n);
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
  `is_read` tinyint(1) NOT NULL,
  `message` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `foodID` varchar(10) DEFAULT NULL,
  `mealEntryID` varchar(10) DEFAULT NULL,
  `claimID` varchar(10) DEFAULT NULL,
  `donationID` varchar(10) DEFAULT NULL,
  `userID` varchar(10) NOT NULL,
  `noticeCateID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `notifications`
--
DELIMITER $$
CREATE TRIGGER `bi_notifications` BEFORE INSERT ON `notifications` FOR EACH ROW BEGIN
  IF NEW.noticeID IS NULL OR NEW.noticeID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(noticeID, 2) AS UNSIGNED)) FROM NOTIFICATIONS), 0) + 1;
    SET NEW.noticeID = CONCAT('N', @n);
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
-- Triggers `notification_categories`
--
DELIMITER $$
CREATE TRIGGER `bi_notification_categories` BEFORE INSERT ON `notification_categories` FOR EACH ROW BEGIN
  IF NEW.noticeCateID IS NULL OR NEW.noticeCateID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(noticeCateID, 3) AS UNSIGNED)) FROM NOTIFICATION_CATEGORIES WHERE LEFT(noticeCateID,2)='NC'
    ), 0) + 1;
    SET NEW.noticeCateID = CONCAT('NC', @n);
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
  IF NEW.pickupID IS NULL OR NEW.pickupID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(pickupID, 3) AS UNSIGNED)) FROM PICKUP_TIMES WHERE LEFT(pickupID,2)='PT'
    ), 0) + 1;
    SET NEW.pickupID = CONCAT('PT', @n);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `postcodes`
--

CREATE TABLE `postcodes` (
  `postcode` char(5) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `recipeID` varchar(10) NOT NULL,
  `recipeName` varchar(255) NOT NULL,
  `instruction` text DEFAULT NULL,
  `serving` int(11) DEFAULT NULL,
  `isGeneric` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `recipes`
--
DELIMITER $$
CREATE TRIGGER `bi_recipes` BEFORE INSERT ON `recipes` FOR EACH ROW BEGIN
  IF NEW.recipeID IS NULL OR NEW.recipeID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(recipeID, 2) AS UNSIGNED)) FROM RECIPES), 0) + 1;
    SET NEW.recipeID = CONCAT('R', @n);
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
  `quantityNeeded` decimal(10,2) NOT NULL,
  `recipeID` varchar(10) NOT NULL,
  `ingredientID` varchar(10) NOT NULL,
  `unitID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `recipe_ingredients`
--
DELIMITER $$
CREATE TRIGGER `bi_recipe_ingredients` BEFORE INSERT ON `recipe_ingredients` FOR EACH ROW BEGIN
  IF NEW.recipe_ingredientID IS NULL OR NEW.recipe_ingredientID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(recipe_ingredientID, 3) AS UNSIGNED)) FROM RECIPE_INGREDIENTS WHERE LEFT(recipe_ingredientID,2)='RI'
    ), 0) + 1;
    SET NEW.recipe_ingredientID = CONCAT('RI', @n);
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
-- Triggers `units`
--
DELIMITER $$
CREATE TRIGGER `bi_units` BEFORE INSERT ON `units` FOR EACH ROW BEGIN
  IF NEW.unitID IS NULL OR NEW.unitID = '' THEN
    SET @n := COALESCE((
      SELECT MAX(CAST(SUBSTRING(unitID, 3) AS UNSIGNED)) FROM UNITS WHERE LEFT(unitID,2)='UN'
    ), 0) + 1;
    SET NEW.unitID = CONCAT('UN', @n);
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
  `status` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `householdSize` int(11) DEFAULT NULL,
  `contact` varchar(15) DEFAULT NULL,
  `addressID` varchar(10) DEFAULT NULL
) ;

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `bi_users` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
  IF NEW.userID IS NULL OR NEW.userID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(userID, 2) AS UNSIGNED)) FROM USERS), 0) + 1;
    SET NEW.userID = CONCAT('U', @n);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `settingID` varchar(10) NOT NULL,
  `twoFA` tinyint(1) NOT NULL,
  `foodVisibility` tinyint(1) NOT NULL,
  `notification` tinyint(1) NOT NULL,
  `userID` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `user_settings`
--
DELIMITER $$
CREATE TRIGGER `bi_usersettings` BEFORE INSERT ON `user_settings` FOR EACH ROW BEGIN
  IF NEW.settingID IS NULL OR NEW.settingID = '' THEN
    SET @n := COALESCE((SELECT MAX(CAST(SUBSTRING(settingID, 2) AS UNSIGNED)) FROM USER_SETTINGS), 0) + 1;
    SET NEW.settingID = CONCAT('S', @n);
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
  ADD KEY `fk_act_user` (`userID`),
  ADD KEY `fk_act_food` (`foodID`),
  ADD KEY `fk_act_unit` (`unitID`),
  ADD KEY `fk_act_type` (`actionTypeID`),
  ADD KEY `fk_act_me` (`mealEntryID`);

--
-- Indexes for table `action_types`
--
ALTER TABLE `action_types`
  ADD PRIMARY KEY (`actionTypeID`);

--
-- Indexes for table `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`addressID`),
  ADD KEY `fk_address_postcode` (`postcode`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categoryID`);

--
-- Indexes for table `claims`
--
ALTER TABLE `claims`
  ADD PRIMARY KEY (`claimID`),
  ADD KEY `fk_claim_pickup` (`pickupID`),
  ADD KEY `fk_claim_donation` (`donationID`),
  ADD KEY `fk_claim_status` (`claim_statusID`),
  ADD KEY `fk_claim_user` (`userID`);

--
-- Indexes for table `claim_status`
--
ALTER TABLE `claim_status`
  ADD PRIMARY KEY (`claim_statusID`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`donationID`),
  ADD KEY `fk_don_user` (`userID`),
  ADD KEY `fk_don_address` (`addressID`),
  ADD KEY `fk_don_food` (`foodID`),
  ADD KEY `fk_don_status` (`donation_statusID`);

--
-- Indexes for table `donation_status`
--
ALTER TABLE `donation_status`
  ADD PRIMARY KEY (`donation_statusID`);

--
-- Indexes for table `foods`
--
ALTER TABLE `foods`
  ADD PRIMARY KEY (`foodID`),
  ADD KEY `fk_food_category` (`categoryID`),
  ADD KEY `fk_food_unit` (`unitID`),
  ADD KEY `idx_foods_user` (`userID`);

--
-- Indexes for table `food_reservations`
--
ALTER TABLE `food_reservations`
  ADD PRIMARY KEY (`reservationID`),
  ADD KEY `fk_fr_food` (`foodID`),
  ADD KEY `fk_fr_me` (`mealEntryID`),
  ADD KEY `fk_fr_unit` (`unitID`);

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
  ADD KEY `fk_me_mpc` (`mealPlanID`),
  ADD KEY `fk_me_mealtype` (`mealTypeID`),
  ADD KEY `fk_me_recipe` (`recipeID`);

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
  ADD KEY `fk_n_claim` (`claimID`),
  ADD KEY `fk_n_donation` (`donationID`),
  ADD KEY `fk_n_user` (`userID`),
  ADD KEY `fk_n_category` (`noticeCateID`);

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
  ADD KEY `fk_pickup_donation` (`donationID`);

--
-- Indexes for table `postcodes`
--
ALTER TABLE `postcodes`
  ADD PRIMARY KEY (`postcode`);

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
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`unitID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD KEY `fk_users_address` (`addressID`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`settingID`),
  ADD UNIQUE KEY `userID` (`userID`);

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
-- Constraints for table `address`
--
ALTER TABLE `address`
  ADD CONSTRAINT `fk_address_postcode` FOREIGN KEY (`postcode`) REFERENCES `postcodes` (`postcode`) ON UPDATE CASCADE;

--
-- Constraints for table `claims`
--
ALTER TABLE `claims`
  ADD CONSTRAINT `fk_claim_donation` FOREIGN KEY (`donationID`) REFERENCES `donations` (`donationID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_claim_pickup` FOREIGN KEY (`pickupID`) REFERENCES `pickup_times` (`pickupID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_claim_status` FOREIGN KEY (`claim_statusID`) REFERENCES `claim_status` (`claim_statusID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_claim_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON UPDATE CASCADE;

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `fk_don_address` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_don_food` FOREIGN KEY (`foodID`) REFERENCES `foods` (`foodID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_don_status` FOREIGN KEY (`donation_statusID`) REFERENCES `donation_status` (`donation_statusID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_don_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `foods`
--
ALTER TABLE `foods`
  ADD CONSTRAINT `fk_food_category` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_food_unit` FOREIGN KEY (`unitID`) REFERENCES `units` (`unitID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_food_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `food_reservations`
--
ALTER TABLE `food_reservations`
  ADD CONSTRAINT `fk_fr_food` FOREIGN KEY (`foodID`) REFERENCES `foods` (`foodID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fr_me` FOREIGN KEY (`mealEntryID`) REFERENCES `meal_entries` (`mealEntryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fr_unit` FOREIGN KEY (`unitID`) REFERENCES `units` (`unitID`) ON UPDATE CASCADE;

--
-- Constraints for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD CONSTRAINT `fk_ing_category` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`) ON UPDATE CASCADE;

--
-- Constraints for table `meal_entries`
--
ALTER TABLE `meal_entries`
  ADD CONSTRAINT `fk_me_mealtype` FOREIGN KEY (`mealTypeID`) REFERENCES `meal_types` (`mealTypeID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_me_mpc` FOREIGN KEY (`mealPlanID`) REFERENCES `meal_plan_calendars` (`mealPlanID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_me_recipe` FOREIGN KEY (`recipeID`) REFERENCES `recipes` (`recipeID`) ON UPDATE CASCADE;

--
-- Constraints for table `meal_plan_calendars`
--
ALTER TABLE `meal_plan_calendars`
  ADD CONSTRAINT `fk_mpc_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_n_category` FOREIGN KEY (`noticeCateID`) REFERENCES `notification_categories` (`noticeCateID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_claim` FOREIGN KEY (`claimID`) REFERENCES `claims` (`claimID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_donation` FOREIGN KEY (`donationID`) REFERENCES `donations` (`donationID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_food` FOREIGN KEY (`foodID`) REFERENCES `foods` (`foodID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_me` FOREIGN KEY (`mealEntryID`) REFERENCES `meal_entries` (`mealEntryID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_n_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pickup_times`
--
ALTER TABLE `pickup_times`
  ADD CONSTRAINT `fk_pickup_donation` FOREIGN KEY (`donationID`) REFERENCES `donations` (`donationID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipe_ingredients`
--
ALTER TABLE `recipe_ingredients`
  ADD CONSTRAINT `fk_ri_ingredient` FOREIGN KEY (`ingredientID`) REFERENCES `ingredients` (`ingredientID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ri_recipe` FOREIGN KEY (`recipeID`) REFERENCES `recipes` (`recipeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ri_unit` FOREIGN KEY (`unitID`) REFERENCES `units` (`unitID`) ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_address` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `fk_usersettings_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
