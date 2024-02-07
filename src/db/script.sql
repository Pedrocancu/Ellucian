DROP TABLE IF EXISTS `auths`;
CREATE TABLE `auths` (
`id` INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
`email` VARCHAR(100) NOT NULL UNIQUE,
`password` VARCHAR(255) NOT NULL,
`lastlogin` TIMESTAMP,
`status` INT NOT NULL DEFAULT 0,
`session_id` TEXT,
`verified_at` TIMESTAMP,
`createdAt` TIMESTAMP NOT NULL DEFAULT current_timestamp,
`updatedAt` TIMESTAMP NOT NULL DEFAULT current_timestamp,
`deletedAt` TIMESTAMP)

