SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `Messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`message_id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_conversation_sent_at` (`conversation_id`,`sent_at`),
  CONSTRAINT `Messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `Conversations` (`conversation_id`),
  CONSTRAINT `Messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Conversations` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `site_uuid` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  INDEX (`site_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ConversationParticipants` (
  `conversation_id` int NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ConversationParticipants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `Conversations` (`conversation_id`),
  CONSTRAINT `ConversationParticipants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `user_id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` tinyint UNSIGNED NOT NULL,
  `groups` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `referrer` int UNSIGNED DEFAULT NULL,
  `referees` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `username` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `fname` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `lname` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `email` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `phone` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `location_longitude` float DEFAULT NULL,
  `location_latitude` float DEFAULT NULL,
  `location_city` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `password` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `preferences` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `favourite_products` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `account_status` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'stores the filename of the avatar',
  `flags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `flags_public` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'which flags are visible to everyone.',
  `booking_notice` int NOT NULL DEFAULT '0',
  `privacy` int UNSIGNED DEFAULT '0',
  `language` enum('PL','EN','FR','ES') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PL',
  `third_party_login` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;