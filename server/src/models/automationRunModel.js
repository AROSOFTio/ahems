import { execute, query } from "../config/db.js";

const automationRunSelect = `
  SELECT
    arr.id,
    arr.rule_id,
    arr.room_id,
    arr.appliance_id,
    arr.triggered_by_user_id,
    arr.trigger_source,
    arr.status,
    arr.matched_conditions_json,
    arr.executed_actions_json,
    arr.error_message,
    arr.triggered_at,
    arr.created_at,
    ar.name AS rule_name,
    r.name AS room_name,
    a.name AS appliance_name,
    CONCAT(u.first_name, ' ', u.last_name) AS triggered_by_name
  FROM automation_rule_runs arr
  INNER JOIN automation_rules ar ON ar.id = arr.rule_id
  LEFT JOIN rooms r ON r.id = arr.room_id
  LEFT JOIN appliances a ON a.id = arr.appliance_id
  LEFT JOIN users u ON u.id = arr.triggered_by_user_id
`;

export async function createAutomationRuleRun(payload) {
  const result = await execute(
    `
      INSERT INTO automation_rule_runs (
        rule_id,
        room_id,
        appliance_id,
        triggered_by_user_id,
        trigger_source,
        status,
        matched_conditions_json,
        executed_actions_json,
        error_message,
        triggered_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      payload.ruleId,
      payload.roomId || null,
      payload.applianceId || null,
      payload.triggeredByUserId || null,
      payload.triggerSource || "SYSTEM",
      payload.status || "TRIGGERED",
      payload.matchedConditions ? JSON.stringify(payload.matchedConditions) : null,
      payload.executedActions ? JSON.stringify(payload.executedActions) : null,
      payload.errorMessage || null,
    ],
  );

  const rows = await query(`${automationRunSelect} WHERE arr.id = ? LIMIT 1`, [result.insertId]);
  return rows[0] || null;
}

export async function listAutomationRuleRuns({ limit = 50, ruleId = null, roomIds = null } = {}) {
  const params = [];
  const clauses = [];

  if (ruleId) {
    clauses.push("arr.rule_id = ?");
    params.push(ruleId);
  }

  if (Array.isArray(roomIds)) {
    if (!roomIds.length) {
      return [];
    }

    clauses.push(`arr.room_id IN (${roomIds.map(() => "?").join(", ")})`);
    params.push(...roomIds);
  }

  params.push(limit);

  return query(
    `
      ${automationRunSelect}
      ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      ORDER BY arr.triggered_at DESC, arr.id DESC
      LIMIT ?
    `,
    params,
  );
}
