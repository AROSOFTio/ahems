USE ahems;

INSERT INTO roles (id, name, description) VALUES
  (1, 'admin', 'System administrator with full platform control'),
  (2, 'resident', 'Standard resident or office manager'),
  (3, 'operator', 'Operational staff with limited assigned-room access')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO users (id, first_name, last_name, email, password_hash, phone, status, last_login_at) VALUES
  (1, 'Amina', 'Kato', 'admin@ahems.io', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+256700000001', 'ACTIVE', NOW()),
  (2, 'Jonah', 'Okello', 'resident@ahems.io', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+256700000002', 'ACTIVE', NOW()),
  (3, 'Grace', 'Namutebi', 'operator@ahems.io', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '+256700000003', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE last_login_at = VALUES(last_login_at);

-- Runtime bootstrap refreshes these demo users with bcrypt hashes for:
-- admin@ahems.io / Admin@12345
-- resident@ahems.io / Resident@12345
-- operator@ahems.io / Operator@12345

INSERT INTO user_roles (user_id, role_id) VALUES
  (1, 1),
  (2, 2),
  (3, 3)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO room_types (id, name, description) VALUES
  (1, 'Living Room', 'Shared family or lounge area'),
  (2, 'Kitchen', 'Cooking and utility area'),
  (3, 'Bedroom', 'Private sleeping area'),
  (4, 'Office', 'Study or work zone')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO appliance_categories (id, name, description, icon, color_code) VALUES
  (1, 'Lighting', 'Lighting fixtures and dimmable lights', 'Lightbulb', '#3543bb'),
  (2, 'Climate', 'Fans, cooling, and climate comfort devices', 'Wind', '#06b6d4'),
  (3, 'Entertainment', 'Media and leisure devices', 'Tv', '#0f172a')
ON DUPLICATE KEY UPDATE description = VALUES(description), color_code = VALUES(color_code);

INSERT INTO rooms (id, owner_user_id, room_type_id, name, description, floor_level, occupancy_state, current_temperature, current_light_level, max_temperature_threshold, min_light_threshold) VALUES
  (1, 2, 1, 'Living Room', 'Primary family lounge', 'Ground', 'OCCUPIED', 24.00, 82.00, 26.00, 40.00),
  (2, 2, 2, 'Kitchen', 'Cooking and preparation room', 'Ground', 'VACANT', 22.00, 74.00, 25.00, 50.00),
  (3, 3, 4, 'Home Office', 'Focused work and study room', 'Upper', 'OCCUPIED', 21.00, 68.00, 24.00, 60.00)
ON DUPLICATE KEY UPDATE current_temperature = VALUES(current_temperature), current_light_level = VALUES(current_light_level);

INSERT INTO user_room_assignments (user_id, room_id, assignment_type) VALUES
  (2, 1, 'OWNER'),
  (2, 2, 'OWNER'),
  (3, 3, 'OWNER'),
  (3, 3, 'OPERATOR')
ON DUPLICATE KEY UPDATE assignment_type = VALUES(assignment_type);

INSERT INTO appliances (id, room_id, category_id, created_by, name, power_rating_watts, status, mode, brightness_level, runtime_minutes_today, estimated_energy_kwh, estimated_cost, notes, last_state_changed_at) VALUES
  (1, 1, 1, 1, 'Ceiling Panel', 48.00, 'DIMMED', 'AUTO', 45, 348, 1.840, 8.60, 'Ambient lounge lighting', NOW()),
  (2, 1, 2, 1, 'Smart Fan', 72.00, 'STANDBY', 'AUTO', 0, 252, 0.960, 4.10, 'Climate safeguard fan', NOW()),
  (3, 3, 1, 1, 'Desk Strip', 32.00, 'ON', 'MANUAL', 100, 426, 2.140, 10.40, 'Focused work lighting', NOW())
ON DUPLICATE KEY UPDATE status = VALUES(status), mode = VALUES(mode), brightness_level = VALUES(brightness_level);

INSERT INTO simulated_conditions (id, room_id, target_temperature, target_light_intensity, target_occupancy, time_of_day, randomization_enabled, updated_by) VALUES
  (1, 1, 24.00, 70.00, 'OCCUPIED', 'EVENING', 0, 2),
  (2, 3, 21.00, 68.00, 'OCCUPIED', 'MORNING', 1, 3)
ON DUPLICATE KEY UPDATE target_temperature = VALUES(target_temperature), target_light_intensity = VALUES(target_light_intensity);

INSERT INTO sensor_readings (room_id, reading_type, reading_value, unit, source, recorded_at) VALUES
  (1, 'TEMPERATURE', 24.00, 'C', 'MANUAL', NOW()),
  (1, 'LIGHT', 82.00, '%', 'SCHEDULED', NOW()),
  (3, 'OCCUPANCY', 1.00, 'BOOLEAN', 'RANDOMIZED', NOW()),
  (2, 'TEMPERATURE', 22.00, 'C', 'MANUAL', NOW()),
  (2, 'LIGHT', 74.00, '%', 'SCHEDULED', NOW());

INSERT INTO automation_rules (id, owner_user_id, room_id, appliance_id, name, description, scope, priority, logical_operator, is_enabled) VALUES
  (1, 2, 1, 1, 'Evening ambience', 'Dims living room lighting during the evening', 'ROOM', 2, 'ALL', 1),
  (2, 1, 1, 2, 'High temperature safeguard', 'Turns fan on when lounge temperature exceeds the threshold', 'DEVICE', 1, 'ALL', 1)
ON DUPLICATE KEY UPDATE description = VALUES(description), priority = VALUES(priority), is_enabled = VALUES(is_enabled);

INSERT INTO automation_rule_conditions (rule_id, metric, operator, comparison_value, comparison_unit, sort_order) VALUES
  (1, 'TIME_OF_DAY', 'EQ', 'EVENING', NULL, 1),
  (2, 'TEMPERATURE', 'GT', '25', 'C', 1);

INSERT INTO automation_rule_actions (rule_id, action_type, action_value, delay_seconds, sort_order) VALUES
  (1, 'DIM', '58', 0, 1),
  (2, 'TURN_ON', 'fan', 0, 1);

INSERT INTO notifications (user_id, room_id, appliance_id, type, title, message, severity, is_read, read_at) VALUES
  (2, 2, NULL, 'IDLE_ROOM_ACTIVE_DEVICE', 'Idle room with active lighting', 'Kitchen occupancy dropped to zero while lighting remained active.', 'WARNING', 0, NULL),
  (1, 3, 3, 'MONTHLY_TARGET_EXCEEDED', 'Projected monthly target crossed', 'Home office plug cluster is trending 8% above the configured budget baseline.', 'DANGER', 0, NULL);

INSERT INTO energy_logs (room_id, appliance_id, usage_date, usage_kwh, cost_estimate, currency, runtime_minutes, source) VALUES
  (1, 1, CURRENT_DATE, 1.840, 8.60, 'USD', 348, 'AUTO'),
  (3, 3, CURRENT_DATE, 2.140, 10.40, 'USD', 426, 'MANUAL'),
  (1, 2, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 0.960, 4.10, 'USD', 252, 'AUTO'),
  (3, 3, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 1.920, 9.30, 'USD', 390, 'MANUAL');

INSERT INTO tariff_settings (id, name, rate_per_kwh, peak_rate_per_kwh, off_peak_rate_per_kwh, currency, effective_from, effective_to, is_active, created_by) VALUES
  (1, 'Standard residential', 0.4200, 0.4800, 0.3400, 'USD', CURRENT_DATE, NULL, 1, 1)
ON DUPLICATE KEY UPDATE rate_per_kwh = VALUES(rate_per_kwh), is_active = VALUES(is_active);

INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES
  ('default_thresholds', JSON_OBJECT('maxTemperature', 25, 'minLightLevel', 45), 'Default room thresholds for new spaces', 1),
  ('notification_preferences', JSON_OBJECT('channels', JSON_ARRAY('in-app', 'email'), 'digestFrequency', 'daily'), 'Default notification routing preferences', 1),
  ('report_defaults', JSON_OBJECT('exportFormat', 'CSV', 'dateRange', 'monthly'), 'Default reporting preferences', 1)
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value),
  description = VALUES(description),
  updated_by = VALUES(updated_by);

INSERT INTO reports (id, user_id, report_type, title, filters_json, status, file_path, generated_at) VALUES
  (1, 1, 'ENERGY_SUMMARY', 'Weekly energy summary', JSON_OBJECT('range', 'weekly'), 'READY', '/exports/weekly-energy-summary.csv', NOW())
ON DUPLICATE KEY UPDATE generated_at = VALUES(generated_at);

INSERT INTO report_exports (report_id, exported_by, export_format, file_name, file_path, exported_at) VALUES
  (1, 1, 'CSV', 'weekly-energy-summary.csv', '/exports/weekly-energy-summary.csv', NOW());

INSERT INTO activity_logs (user_id, actor_role, action, module_name, entity_type, entity_id, description, ip_address, user_agent, metadata_json) VALUES
  (1, 'admin', 'Updated high-temp fallback rule', 'Automation', 'automation_rule', 2, 'Adjusted lounge safety threshold', '127.0.0.1', 'seed-script', JSON_OBJECT('priority', 1)),
  (2, 'resident', 'Adjusted office lighting threshold', 'Rooms', 'room', 3, 'Raised minimum light threshold for focus mode', '127.0.0.1', 'seed-script', JSON_OBJECT('min_light_threshold', 60)),
  (3, 'operator', 'Applied occupancy simulation override', 'Sensors', 'room', 1, 'Set temporary occupied state for visitor testing', '127.0.0.1', 'seed-script', JSON_OBJECT('occupancy_state', 'OCCUPIED'));

INSERT INTO device_commands (user_id, room_id, appliance_id, command_source, command_text, command_payload, executed_action, status, executed_at) VALUES
  (2, 3, 3, 'VOICE', 'Set office lights to focus mode', JSON_OBJECT('brightness', 100), 'DIM', 'SUCCESS', NOW());

INSERT INTO password_resets (user_id, email, token, expires_at, used_at) VALUES
  (2, 'resident@ahems.io', 'seed-reset-token-resident', DATE_ADD(NOW(), INTERVAL 1 DAY), NULL)
ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at);
