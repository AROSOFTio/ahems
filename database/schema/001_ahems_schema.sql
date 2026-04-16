CREATE DATABASE IF NOT EXISTS ahems CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ahems;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
  avatar_url VARCHAR(255) NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_role (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS room_types (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  room_type_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  floor_level VARCHAR(50) NULL,
  occupancy_state ENUM('OCCUPIED', 'VACANT', 'TRANSITIONAL') NOT NULL DEFAULT 'VACANT',
  current_temperature DECIMAL(5,2) NOT NULL DEFAULT 22.00,
  current_light_level DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  max_temperature_threshold DECIMAL(5,2) NOT NULL DEFAULT 25.00,
  min_light_threshold DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_rooms_owner_name (owner_user_id, name),
  INDEX idx_rooms_owner (owner_user_id),
  INDEX idx_rooms_type (room_type_id),
  INDEX idx_rooms_occupancy (occupancy_state),
  CONSTRAINT fk_rooms_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rooms_type FOREIGN KEY (room_type_id) REFERENCES room_types(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_room_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  room_id BIGINT UNSIGNED NOT NULL,
  assignment_type ENUM('OWNER', 'OPERATOR', 'VIEWER') NOT NULL DEFAULT 'OPERATOR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_room_assignment (user_id, room_id, assignment_type),
  INDEX idx_user_room_assignments_user (user_id),
  INDEX idx_user_room_assignments_room (room_id),
  CONSTRAINT fk_user_room_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_room_assignments_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appliance_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  icon VARCHAR(100) NULL,
  color_code VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appliances (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  name VARCHAR(150) NOT NULL,
  power_rating_watts DECIMAL(10,2) NOT NULL,
  status ENUM('ON', 'OFF', 'DIMMED', 'STANDBY') NOT NULL DEFAULT 'OFF',
  mode ENUM('MANUAL', 'AUTO') NOT NULL DEFAULT 'MANUAL',
  brightness_level INT UNSIGNED NOT NULL DEFAULT 0,
  runtime_minutes_today INT UNSIGNED NOT NULL DEFAULT 0,
  estimated_energy_kwh DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  estimated_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  last_state_changed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_appliances_room_name (room_id, name),
  INDEX idx_appliances_room (room_id),
  INDEX idx_appliances_category (category_id),
  INDEX idx_appliances_status (status),
  INDEX idx_appliances_mode (mode),
  CONSTRAINT fk_appliances_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_appliances_category FOREIGN KEY (category_id) REFERENCES appliance_categories(id),
  CONSTRAINT fk_appliances_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS simulated_conditions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  target_temperature DECIMAL(5,2) NOT NULL DEFAULT 22.00,
  target_light_intensity DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  target_occupancy ENUM('OCCUPIED', 'VACANT', 'TRANSITIONAL') NOT NULL DEFAULT 'VACANT',
  time_of_day ENUM('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT') NOT NULL DEFAULT 'MORNING',
  randomization_enabled TINYINT(1) NOT NULL DEFAULT 0,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_simulated_conditions_room (room_id),
  CONSTRAINT fk_simulated_conditions_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_simulated_conditions_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  description VARCHAR(255) NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_system_settings_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  reading_type ENUM('TEMPERATURE', 'LIGHT', 'OCCUPANCY') NOT NULL,
  reading_value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(30) NOT NULL,
  source ENUM('MANUAL', 'SCHEDULED', 'RANDOMIZED', 'AUTOMATION') NOT NULL DEFAULT 'MANUAL',
  recorded_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sensor_readings_room (room_id),
  INDEX idx_sensor_readings_type (reading_type),
  INDEX idx_sensor_readings_recorded_at (recorded_at),
  CONSTRAINT fk_sensor_readings_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS automation_rules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_user_id BIGINT UNSIGNED NULL,
  room_id BIGINT UNSIGNED NULL,
  appliance_id BIGINT UNSIGNED NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  scope ENUM('SYSTEM', 'ROOM', 'DEVICE') NOT NULL DEFAULT 'ROOM',
  priority INT NOT NULL DEFAULT 1,
  logical_operator ENUM('ALL', 'ANY') NOT NULL DEFAULT 'ALL',
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_automation_rules_user (owner_user_id),
  INDEX idx_automation_rules_room (room_id),
  INDEX idx_automation_rules_appliance (appliance_id),
  INDEX idx_automation_rules_enabled (is_enabled),
  CONSTRAINT fk_automation_rules_user FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_automation_rules_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_automation_rules_appliance FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS automation_rule_conditions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rule_id BIGINT UNSIGNED NOT NULL,
  metric ENUM('TEMPERATURE', 'LIGHT', 'OCCUPANCY', 'TIME_OF_DAY', 'ENERGY_USAGE', 'DEVICE_STATUS') NOT NULL,
  operator ENUM('GT', 'LT', 'EQ', 'GTE', 'LTE', 'NEQ', 'IN') NOT NULL,
  comparison_value VARCHAR(255) NOT NULL,
  comparison_unit VARCHAR(50) NULL,
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rule_conditions_rule (rule_id),
  CONSTRAINT fk_rule_conditions_rule FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS automation_rule_actions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rule_id BIGINT UNSIGNED NOT NULL,
  action_type ENUM('TURN_ON', 'TURN_OFF', 'DIM', 'RESTORE_BRIGHTNESS', 'SET_MODE_AUTO', 'SET_MODE_MANUAL', 'SEND_NOTIFICATION') NOT NULL,
  action_value VARCHAR(255) NULL,
  delay_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rule_actions_rule (rule_id),
  CONSTRAINT fk_rule_actions_rule FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  room_id BIGINT UNSIGNED NULL,
  appliance_id BIGINT UNSIGNED NULL,
  type ENUM('HIGH_TEMP', 'LOW_LIGHT', 'EXCESS_USAGE', 'ABNORMAL_CONSUMPTION', 'DEVICE_LEFT_ON', 'IDLE_ROOM_ACTIVE_DEVICE', 'THRESHOLD_EXCEEDED', 'RULE_TRIGGERED', 'MONTHLY_TARGET_EXCEEDED', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('INFO', 'SUCCESS', 'WARNING', 'DANGER') NOT NULL DEFAULT 'INFO',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_type (type),
  INDEX idx_notifications_severity (severity),
  INDEX idx_notifications_read (is_read),
  INDEX idx_notifications_created_at (created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_notifications_appliance FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS energy_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  appliance_id BIGINT UNSIGNED NULL,
  usage_date DATE NOT NULL,
  usage_kwh DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  cost_estimate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  runtime_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  source ENUM('MANUAL', 'AUTO', 'SIMULATION', 'RULE_ENGINE') NOT NULL DEFAULT 'SIMULATION',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_energy_logs_room_appliance_date (room_id, appliance_id, usage_date, source),
  INDEX idx_energy_logs_room (room_id),
  INDEX idx_energy_logs_appliance (appliance_id),
  INDEX idx_energy_logs_usage_date (usage_date),
  CONSTRAINT fk_energy_logs_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_energy_logs_appliance FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tariff_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  rate_per_kwh DECIMAL(10,4) NOT NULL,
  peak_rate_per_kwh DECIMAL(10,4) NULL,
  off_peak_rate_per_kwh DECIMAL(10,4) NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tariff_settings_active (is_active),
  CONSTRAINT fk_tariff_settings_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  report_type ENUM('ROOM_USAGE', 'APPLIANCE_USAGE', 'AUTOMATION_HISTORY', 'ENERGY_SUMMARY', 'COST_SUMMARY', 'THRESHOLD_VIOLATIONS', 'ACTIVE_VS_INACTIVE', 'TREND') NOT NULL,
  title VARCHAR(180) NOT NULL,
  filters_json JSON NULL,
  status ENUM('QUEUED', 'GENERATING', 'READY', 'FAILED') NOT NULL DEFAULT 'READY',
  file_path VARCHAR(255) NULL,
  generated_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reports_user (user_id),
  INDEX idx_reports_type (report_type),
  INDEX idx_reports_status (status),
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS report_exports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id BIGINT UNSIGNED NOT NULL,
  exported_by BIGINT UNSIGNED NULL,
  export_format ENUM('CSV', 'PDF') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NULL,
  exported_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_report_exports_report (report_id),
  CONSTRAINT fk_report_exports_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_exports_user FOREIGN KEY (exported_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  actor_role VARCHAR(50) NULL,
  action VARCHAR(255) NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id BIGINT UNSIGNED NULL,
  description TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_logs_user (user_id),
  INDEX idx_activity_logs_module (module_name),
  INDEX idx_activity_logs_created_at (created_at),
  CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS device_commands (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  room_id BIGINT UNSIGNED NULL,
  appliance_id BIGINT UNSIGNED NULL,
  command_source ENUM('BUTTON', 'VOICE', 'TYPED', 'AUTOMATION', 'SYSTEM') NOT NULL DEFAULT 'BUTTON',
  command_text VARCHAR(255) NOT NULL,
  command_payload JSON NULL,
  executed_action VARCHAR(255) NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  executed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_device_commands_user (user_id),
  INDEX idx_device_commands_room (room_id),
  INDEX idx_device_commands_appliance (appliance_id),
  CONSTRAINT fk_device_commands_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_device_commands_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_device_commands_appliance FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(150) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_resets_user (user_id),
  INDEX idx_password_resets_token (token),
  INDEX idx_password_resets_expires_at (expires_at),
  CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
