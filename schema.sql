-- ============================================================
-- StreamVault Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS streamvault
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE streamvault;

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  email         VARCHAR(100)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  avatar        VARCHAR(500)  DEFAULT NULL,
  bio           TEXT          DEFAULT NULL,
  subscriber_count INT        DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Videos
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id              CHAR(36)      NOT NULL PRIMARY KEY,
  title           VARCHAR(255)  NOT NULL,
  description     TEXT          DEFAULT NULL,
  video_url       VARCHAR(500)  NOT NULL,
  thumbnail_url   VARCHAR(500)  DEFAULT NULL,
  user_id         CHAR(36)      NOT NULL,
  views           BIGINT        DEFAULT 0,
  duration        INT           DEFAULT 0 COMMENT 'seconds',
  likes_count     INT           DEFAULT 0,
  comments_count  INT           DEFAULT 0,
  status          ENUM('processing','published','private','deleted') DEFAULT 'published',
  tags            TEXT          DEFAULT NULL COMMENT 'JSON array',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_videos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_videos_user_id (user_id),
  INDEX idx_videos_status (status),
  INDEX idx_videos_created_at (created_at),
  FULLTEXT INDEX ft_videos_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id            CHAR(36)  NOT NULL PRIMARY KEY,
  user_id       CHAR(36)  NOT NULL,
  video_id      CHAR(36)  NOT NULL,
  comment_text  TEXT      NOT NULL,
  likes_count   INT       DEFAULT 0,
  created_at    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_comments_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  INDEX idx_comments_video_id (video_id),
  INDEX idx_comments_user_id  (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Likes
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
  id        CHAR(36)                  NOT NULL PRIMARY KEY,
  user_id   CHAR(36)                  NOT NULL,
  video_id  CHAR(36)                  NOT NULL,
  type      ENUM('like','dislike')    DEFAULT 'like',
  created_at DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_likes_user_video (user_id, video_id),
  CONSTRAINT fk_likes_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_likes_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  INDEX idx_likes_video_id (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id             CHAR(36) NOT NULL PRIMARY KEY,
  subscriber_id  CHAR(36) NOT NULL,
  channel_id     CHAR(36) NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subscription (subscriber_id, channel_id),
  CONSTRAINT fk_sub_subscriber FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_channel    FOREIGN KEY (channel_id)    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sub_channel_id    (channel_id),
  INDEX idx_sub_subscriber_id (subscriber_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Sample seed data (optional — remove in production)
-- ============================================================

-- INSERT INTO users (id, username, email, password, subscriber_count, created_at, updated_at)
-- VALUES
--   (UUID(), 'demo_user', 'demo@streamvault.io', '$2a$12$...hashed...', 0, NOW(), NOW());
