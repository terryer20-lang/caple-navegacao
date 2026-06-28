-- Semedo Sync Backend — MySQL Schema
-- TencentDB for MySQL 5.7+

CREATE DATABASE IF NOT EXISTS semedo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE semedo;

-- ─── Users ───
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hash
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── My Vocabulary ───
CREATE TABLE IF NOT EXISTS vocab (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  pt          VARCHAR(255) NOT NULL,
  zh          VARCHAR(255) NOT NULL,
  pos         VARCHAR(50) NOT NULL DEFAULT '',
  direction   ENUM('zh2pt','pt2zh') NOT NULL,
  source      VARCHAR(50) DEFAULT 'manual',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_pt_dir (user_id, pt, direction),
  KEY idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Wrong Words (Ebbinghaus SRS) ───
CREATE TABLE IF NOT EXISTS wrong_words (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  pt              VARCHAR(255) NOT NULL,
  zh              VARCHAR(255) NOT NULL,
  pos             VARCHAR(50) NOT NULL DEFAULT '',
  wrong_count     INT UNSIGNED NOT NULL DEFAULT 1,
  correct_count   INT UNSIGNED NOT NULL DEFAULT 0,
  stage           TINYINT UNSIGNED NOT NULL DEFAULT 0,
  next_review     DATETIME NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_pt (user_id, pt),
  KEY idx_user_next (user_id, next_review),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Wrong Word Review History ───
CREATE TABLE IF NOT EXISTS wrong_word_history (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wrong_word_id   INT UNSIGNED NOT NULL,
  action          ENUM('wrong','correct') NOT NULL,
  direction       VARCHAR(10) DEFAULT '',
  reviewed_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_wwid (wrong_word_id),
  FOREIGN KEY (wrong_word_id) REFERENCES wrong_words(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Favorites ───
CREATE TABLE IF NOT EXISTS favorites (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  pt          VARCHAR(255) NOT NULL,
  zh          VARCHAR(255) NOT NULL DEFAULT '',
  type        ENUM('dicionario','expressao','outro') NOT NULL DEFAULT 'outro',
  src         VARCHAR(100) DEFAULT '',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_pt_src (user_id, pt, src),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Study Log (daily stats) ───
CREATE TABLE IF NOT EXISTS study_log (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  log_date    DATE NOT NULL,
  minutes     INT UNSIGNED NOT NULL DEFAULT 0,
  words       INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_date (user_id, log_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
