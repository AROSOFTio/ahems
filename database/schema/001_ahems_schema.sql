-- ============================================================
-- AHEMS — Clean Production Schema
-- Scope: Authentication + Rooms + Sensors + Appliances +
--        Automation Rules + Energy Logs
-- Removed: reports, report_exports, notifications,
--          activity_logs, password_resets, system_settings
--          user_room_assignments (no multi-user/role concept)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ahems CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ahems;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Users (minimal: email + password only, no phone/avatar) ────────────────
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status        ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  last_login_at DATETIME NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ── Room types (Living Room, Kitchen, Bedroom, Office) ─────────────────────
CREATE TABLE IF NOT EXISTS room_types (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Rooms (holds current sensor reading state) ─────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_user_id           BIGINT UNSIGNED NOT NULL,
  room_type_id            BIGINT UNSIGNED NOT NULL,
  name                    VARCHAR(150) NOT NULL,
  floor_level             VARCHAR(50) NULL,
  occupancy_state         ENUM('OCCUPIED','VACANT','TRANSITIONAL') NOT NULL DEFAULT 'VACANT',
  current_temperature     DECIMAL(5,2) NOT NULL DEFAULT 22.00,
  current_light_level     DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  max_temperature_threshold DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  min_light_threshold     DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  is_active               TINYINT(1) NOT NULL DEFAULT 1,
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_rooms_owner_name (owner_user_id, name),
  INDEX idx_rooms_owner (owner_user_id),
  INDEX idx_rooms_type (room_type_id),
  CONSTRAINT fk_rooms_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rooms_type  FOREIGN KEY (room_type_id)  REFERENCES room_types(id)
) ENGINE=InnoDB;

-- ── Appliance categories (Lighting, Climate, Entertainment) ────────────────
CREATE TABLE IF NOT EXISTS appliance_categories (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(100) NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Appliances (Bulb, TV, Fan — matching Arduino pin mapping) ──────────────
CREATE TABLE IF NOT EXISTS appliances (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id               BIGINT UNSIGNED NOT NULL,
  category_id           BIGINT UNSIGNED NOT NULL,
  name                  VARCHAR(150) NOT NULL,
  power_rating_watts    DECIMAL(10,2) NOT NULL,
  status                ENUM('ON','OFF','DIMMED','STANDBY') NOT NULL DEFAULT 'OFF',
  mode                  ENUM('MANUAL','AUTO') NOT NULL DEFAULT 'AUTO',
  brightness_level      INT UNSIGNED NOT NULL DEFAULT 0,
  runtime_minutes_today INT UNSIGNED NOT NULL DEFAULT 0,
  estimated_energy_kwh  DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  estimated_cost        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  last_state_changed_at DATETIME NULL,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_appliances_room_name (room_id, name),
  INDEX idx_appliances_room (room_id),
  INDEX idx_appliances_status (status),
  INDEX idx_appliances_mode (mode),
  CONSTRAINT fk_appliances_room     FOREIGN KEY (room_id)     REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_appliances_category FOREIGN KEY (category_id) REFERENCES appliance_categories(id)
) ENGINE=InnoDB;

-- ── Sensor readings (temperature, light, occupancy) ────────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id      BIGINT UNSIGNED NOT NULL,
  reading_type ENUM('TEMPERATURE','LIGHT','OCCUPANCY') NOT NULL,
  reading_value DECIMAL(10,2) NOT NULL,
  unit         VARCHAR(30) NOT NULL,
  source       ENUM('SIMULATION','MANUAL','AUTO') NOT NULL DEFAULT 'SIMULATION',
  recorded_at  DATETIME NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sensor_readings_room (room_id),
  INDEX idx_sensor_readings_type (reading_type),
  INDEX idx_sensor_readings_recorded_at (recorded_at),
  CONSTRAINT fk_sensor_readings_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Automation rules (3 hardcoded: DARK_LIGHTS_ON, HIGH_TEMP_FAN, NO_OCCUPANCY_OFF) ──
CREATE TABLE IF NOT EXISTS automation_rules (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150) NOT NULL UNIQUE,
  description  TEXT NULL,
  metric       ENUM('TEMPERATURE','LIGHT','OCCUPANCY','TIME_OF_DAY','ENERGY_USAGE') NOT NULL,
  operator     ENUM('GT','LT','EQ','GTE','LTE','NEQ') NOT NULL,
  threshold    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  action_type  ENUM('TURN_ON','TURN_OFF','DIM','RESTORE_BRIGHTNESS') NOT NULL,
  target       ENUM('BULB','TV','FAN','ALL_DEVICES') NOT NULL,
  is_enabled   TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_automation_rules_enabled (is_enabled)
) ENGINE=InnoDB;

-- ── Energy logs (accumulated from simulation) ──────────────────────────────
CREATE TABLE IF NOT EXISTS energy_logs (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id        BIGINT UNSIGNED NOT NULL,
  appliance_id   BIGINT UNSIGNED NULL,
  usage_date     DATE NOT NULL,
  usage_kwh      DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  cost_estimate  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency       VARCHAR(10) NOT NULL DEFAULT 'UGX',
  runtime_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  source         ENUM('SIMULATION','MANUAL','AUTO') NOT NULL DEFAULT 'SIMULATION',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_energy_logs_room (room_id),
  INDEX idx_energy_logs_appliance (appliance_id),
  INDEX idx_energy_logs_usage_date (usage_date),
  CONSTRAINT fk_energy_logs_room      FOREIGN KEY (room_id)    REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_energy_logs_appliance FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Tariff settings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tariff_settings (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(120) NOT NULL,
  rate_per_kwh     DECIMAL(10,4) NOT NULL,
  currency         VARCHAR(10) NOT NULL DEFAULT 'UGX',
  effective_from   DATE NOT NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tariff_settings_active (is_active)
) ENGINE=InnoDB;

-- ── Device commands (voice/button log — mirrors Arduino command bus) ─────────
CREATE TABLE IF NOT EXISTS device_commands (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT UNSIGNED NULL,
  appliance_id     BIGINT UNSIGNED NULL,
  command_source   ENUM('BUTTON','VOICE','AUTO','SYSTEM') NOT NULL DEFAULT 'BUTTON',
  command_text     VARCHAR(255) NOT NULL,
  executed_action  VARCHAR(255) NULL,
  status           ENUM('SUCCESS','FAILED') NOT NULL DEFAULT 'SUCCESS',
  executed_at      DATETIME NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_device_commands_user (user_id),
  INDEX idx_device_commands_appliance (appliance_id),
  CONSTRAINT fk_device_commands_user      FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_device_commands_appliance FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
