CREATE DATABASE IF NOT EXISTS flirtopia;
USE flirtopia;

CREATE TABLE IF NOT EXISTS user (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `password` varchar(200) NOT NULL,
  `birth` date DEFAULT NULL,
  `gender` enum('man','woman') DEFAULT NULL,
  `preference` enum('man','woman','both') DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `photo1` varchar(100) DEFAULT NULL,
  `photo2` varchar(100) DEFAULT NULL,
  `photo3` varchar(100) DEFAULT NULL,
  `photo4` varchar(100) DEFAULT NULL,
  `photo5` varchar(100) DEFAULT NULL,
  `all_infos_set` tinyint(1) NOT NULL DEFAULT '0',
  `location` varchar(100) DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `verified_token` varchar(255) DEFAULT NULL,
  `popularity` int NOT NULL DEFAULT '150',
  `online` tinyint(1) DEFAULT '0',
  `lastConnection` datetime DEFAULT CURRENT_TIMESTAMP,
  `password_token` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS blockUser (
  `id_user_source` int NOT NULL,
  `id_user_target` int NOT NULL,
  PRIMARY KEY (`id_user_source`,`id_user_target`),
  KEY `id_user_target` (`id_user_target`),
  CONSTRAINT `blockuser_ibfk_1` FOREIGN KEY (`id_user_source`) REFERENCES `user` (`id`),
  CONSTRAINT `blockuser_ibfk_2` FOREIGN KEY (`id_user_target`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS conversations (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `user1_id` int NOT NULL,
  `user2_id` int NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`conversation_id`),
  KEY `user1_id` (`user1_id`),
  KEY `user2_id` (`user2_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user1_id`) REFERENCES `user` (`id`),
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user2_id`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS history (
  `id_user_source` int DEFAULT NULL,
  `id_user_target` int DEFAULT NULL,
  KEY `id_user_source` (`id_user_source`),
  KEY `id_user_target` (`id_user_target`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`id_user_source`) REFERENCES `user` (`id`),
  CONSTRAINT `history_ibfk_2` FOREIGN KEY (`id_user_target`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS likes (
  `id_user_source` int NOT NULL,
  `id_user_target` int NOT NULL,
  PRIMARY KEY (`id_user_source`,`id_user_target`),
  KEY `id_user_target` (`id_user_target`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`id_user_source`) REFERENCES `user` (`id`),
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`id_user_target`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS notifications (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_source_id` int DEFAULT NULL,
  `user_target_id` int DEFAULT NULL,
  `notification_type` varchar(20) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `timestamp` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_source_id` (`user_source_id`),
  KEY `user_target_id` (`user_target_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_source_id`) REFERENCES `user` (`id`),
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`user_target_id`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS notificationsMessages (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_id_source` int DEFAULT NULL,
  `conversation_id` int DEFAULT NULL,
  `message_content` text,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notificationsmessages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS privateMessages (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `recipient_id` int NOT NULL,
  `message_content` text NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `sender_id` (`sender_id`),
  KEY `recipient_id` (`recipient_id`),
  CONSTRAINT `privatemessages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`),
  CONSTRAINT `privatemessages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`),
  CONSTRAINT `privatemessages_ibfk_3` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS reportUser (
  `id_user_source` int NOT NULL,
  `id_user_target` int NOT NULL,
  PRIMARY KEY (`id_user_source`,`id_user_target`),
  KEY `id_user_target` (`id_user_target`),
  CONSTRAINT `reportuser_ibfk_1` FOREIGN KEY (`id_user_source`) REFERENCES `user` (`id`),
  CONSTRAINT `reportuser_ibfk_2` FOREIGN KEY (`id_user_target`) REFERENCES `user` (`id`)
);

CREATE TABLE IF NOT EXISTS tag (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_name` (`tag_name`)
);

INSERT INTO tag (tag_id, tag_name) VALUES
  (19, '42'),
  (8, 'Art'),
  (18, 'Cars'),
  (7, 'Cooking'),
  (11, 'Dancing'),
  (9, 'Fitness'),
  (10, 'Gaming'),
  (4, 'Movies'),
  (2, 'Music'),
  (16, 'Nature'),
  (15, 'Pets'),
  (13, 'Photography'),
  (6, 'Reading'),
  (14, 'Running'),
  (17, 'Sciences'),
  (1, 'Sport'),
  (12, 'Technology'),
  (3, 'Travel'),
  (5, 'TV shows');


CREATE TABLE IF NOT EXISTS user_tag (
  `user_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `user_tag_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `user_tag_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`tag_id`)
);