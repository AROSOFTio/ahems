-- ============================================================
-- AHEMS Seed Data — Clean Demo Dataset
-- Passwords: demo@ahems.io / Demo@12345
-- ============================================================

USE ahems;

INSERT INTO room_types (id, name, description) VALUES
  (1, 'Living Room', 'Shared lounge area'),
  (2, 'Kitchen',     'Cooking and utility area'),
  (3, 'Bedroom',     'Private sleeping area'),
  (4, 'Office',      'Study or work zone')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Demo user (single resident — naigaga.nahiya@studmc.kiu.ac.ug / Nahiya@2013)
INSERT INTO users (id, first_name, last_name, email, password_hash, status, last_login_at) VALUES
  (1, 'Naigaga', 'Nahiya', 'naigaga.nahiya@studmc.kiu.ac.ug',
   '$2a$12$Dv0LdACuXOEMcfZdSbptguSTAEM.I7g0PUE80lEkm6/Ij9Suug1Ue',
   'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE last_login_at = VALUES(last_login_at);

-- password for the above hash = Demo@12345

INSERT INTO appliance_categories (id, name, icon) VALUES
  (1, 'Lighting',       'Lightbulb'),
  (2, 'Climate',        'Fan'),
  (3, 'Entertainment',  'Tv')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Living room — the primary home zone
INSERT INTO rooms (id, owner_user_id, room_type_id, name, floor_level, occupancy_state,
                   current_temperature, current_light_level,
                   max_temperature_threshold, min_light_threshold) VALUES
  (1, 1, 1, 'Living Room', 'Ground', 'OCCUPIED', 26.00, 45.00, 30.00, 40.00)
ON DUPLICATE KEY UPDATE current_temperature = VALUES(current_temperature),
                        current_light_level = VALUES(current_light_level);

-- Three hardcoded appliances matching Arduino pin assignments:
--   pin 10 = Bulb (60W), pin 6 = TV (120W), pin 13 = Fan (75W)
INSERT INTO appliances (id, room_id, category_id, name, power_rating_watts, status, mode,
                        brightness_level, last_state_changed_at) VALUES
  (1, 1, 1, 'Smart Bulb', 60.00,  'OFF', 'AUTO', 0,   NOW()),
  (2, 1, 3, 'Television', 120.00, 'OFF', 'AUTO', 0,   NOW()),
  (3, 1, 2, 'Cooling Fan', 75.00, 'OFF', 'AUTO', 0,   NOW())
ON DUPLICATE KEY UPDATE status = VALUES(status), mode = VALUES(mode);

-- Bootstrap sensor readings
INSERT INTO sensor_readings (room_id, reading_type, reading_value, unit, source, recorded_at) VALUES
  (1, 'TEMPERATURE', 26.00, 'C',       'SIMULATION', NOW()),
  (1, 'LIGHT',       45.00, '%',       'SIMULATION', NOW()),
  (1, 'OCCUPANCY',   1.00,  'BOOLEAN', 'SIMULATION', NOW());

-- Three predefined automation rules mirroring Arduino logic
INSERT INTO automation_rules (id, name, description, metric, operator, threshold,
                               action_type, target, is_enabled) VALUES
  (1, 'DARK_LIGHTS_ON',
      'If light level is below 40% (LDR reads DARK), turn Bulb ON',
      'LIGHT', 'LT', 40.00, 'TURN_ON', 'BULB', 1),
  (2, 'HIGH_TEMP_FAN',
      'If temperature exceeds 30°C, turn Fan ON automatically',
      'TEMPERATURE', 'GT', 30.00, 'TURN_ON', 'FAN', 1),
  (3, 'NO_OCCUPANCY_OFF',
      'If room is vacant, turn all devices off',
      'OCCUPANCY', 'EQ', 0.00, 'TURN_OFF', 'ALL_DEVICES', 0)
ON DUPLICATE KEY UPDATE description = VALUES(description),
                        threshold  = VALUES(threshold),
                        is_enabled = VALUES(is_enabled);

-- Active tariff (UMEME Uganda residential rate)
INSERT INTO tariff_settings (id, name, rate_per_kwh, currency, effective_from, is_active) VALUES
  (1, 'UMEME Residential', 780.0000, 'UGX', CURRENT_DATE, 1)
ON DUPLICATE KEY UPDATE rate_per_kwh = VALUES(rate_per_kwh), is_active = VALUES(is_active);
