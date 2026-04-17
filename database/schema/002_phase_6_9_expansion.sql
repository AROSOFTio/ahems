USE ahems;

CREATE TABLE IF NOT EXISTS automation_rule_runs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rule_id BIGINT UNSIGNED NOT NULL,
  room_id BIGINT UNSIGNED NULL,
  appliance_id BIGINT UNSIGNED NULL,
  triggered_by_user_id BIGINT UNSIGNED NULL,
  trigger_source ENUM('SIMULATION', 'COMMAND', 'SCHEDULED', 'MANUAL', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
  status ENUM('TRIGGERED', 'SKIPPED', 'FAILED') NOT NULL DEFAULT 'TRIGGERED',
  matched_conditions_json JSON NULL,
  executed_actions_json JSON NULL,
  error_message VARCHAR(255) NULL,
  triggered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_automation_rule_runs_rule (rule_id),
  INDEX idx_automation_rule_runs_room (room_id),
  INDEX idx_automation_rule_runs_appliance (appliance_id),
  INDEX idx_automation_rule_runs_status (status),
  INDEX idx_automation_rule_runs_triggered_at (triggered_at),
  CONSTRAINT fk_automation_rule_runs_rule FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE,
  CONSTRAINT fk_automation_rule_runs_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_automation_rule_runs_appliance FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE SET NULL,
  CONSTRAINT fk_automation_rule_runs_user FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
