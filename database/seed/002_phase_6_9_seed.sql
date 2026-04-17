USE ahems;

INSERT INTO automation_rule_runs (
  rule_id,
  room_id,
  appliance_id,
  triggered_by_user_id,
  trigger_source,
  status,
  matched_conditions_json,
  executed_actions_json,
  triggered_at
)
VALUES
  (
    1,
    1,
    1,
    2,
    'SIMULATION',
    'TRIGGERED',
    JSON_ARRAY(JSON_OBJECT('metric', 'TIME_OF_DAY', 'value', 'EVENING')),
    JSON_ARRAY(JSON_OBJECT('actionType', 'DIM', 'actionValue', '58')),
    NOW()
  ),
  (
    2,
    1,
    2,
    1,
    'SCHEDULED',
    'TRIGGERED',
    JSON_ARRAY(JSON_OBJECT('metric', 'TEMPERATURE', 'value', '26.2')),
    JSON_ARRAY(JSON_OBJECT('actionType', 'TURN_ON', 'appliance', 'Smart Fan')),
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
  );
