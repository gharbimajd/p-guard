-- Database schema for P-guard (MySQL / phpMyAdmin)
CREATE DATABASE IF NOT EXISTS `api_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `api_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `immatricule` VARCHAR(100) NOT NULL,
  `adresse` VARCHAR(255) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial default test users
INSERT INTO `users` (`username`, `password`, `immatricule`, `adresse`)
VALUES 
  ('admin', 'password123', 'PG-001', 'admin@pguard.com'),
  ('user', 'password123', 'PG-002', 'user@pguard.com')
ON DUPLICATE KEY UPDATE `username`=`username`;
