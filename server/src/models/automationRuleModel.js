import { execute, query, queryOne, withTransaction } from "../config/db.js";

const automationRuleSelect = `
  SELECT
    ar.id,
    ar.owner_user_id,
    ar.room_id,
    ar.appliance_id,
    ar.name,
    ar.description,
    ar.scope,
    ar.priority,
    ar.logical_operator,
    ar.is_enabled,
    ar.created_at,
    ar.updated_at,
    CONCAT(u.first_name, ' ', u.last_name) AS owner_name,
    r.name AS room_name,
    a.name AS appliance_name
  FROM automation_rules ar
  LEFT JOIN users u ON u.id = ar.owner_user_id
  LEFT JOIN rooms r ON r.id = ar.room_id
  LEFT JOIN appliances a ON a.id = ar.appliance_id
`;

export async function listAutomationRules() {
  return query(`${automationRuleSelect} ORDER BY ar.priority ASC, ar.created_at DESC`);
}

export async function findAutomationRuleById(id) {
  return queryOne(`${automationRuleSelect} WHERE ar.id = ? LIMIT 1`, [id]);
}

export async function createAutomationRule(payload) {
  const result = await execute(
    `
      INSERT INTO automation_rules (
        owner_user_id,
        room_id,
        appliance_id,
        name,
        description,
        scope,
        priority,
        logical_operator,
        is_enabled
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.userId,
      payload.roomId || null,
      payload.applianceId || null,
      payload.name,
      payload.description || null,
      payload.scope,
      payload.priority ?? 1,
      payload.logicalOperator || "ALL",
      payload.isEnabled ?? 1,
    ],
  );

  return findAutomationRuleById(result.insertId);
}

export async function updateAutomationRule(id, updates) {
  const fields = [];
  const values = [];

  const fieldMap = {
    name: "name",
    description: "description",
    roomId: "room_id",
    applianceId: "appliance_id",
    scope: "scope",
    priority: "priority",
    logicalOperator: "logical_operator",
    isEnabled: "is_enabled",
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${column} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return findAutomationRuleById(id);
  }

  values.push(id);

  await execute(
    `
      UPDATE automation_rules
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    values,
  );

  return findAutomationRuleById(id);
}

export async function deleteAutomationRule(id) {
  const result = await execute("DELETE FROM automation_rules WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getAutomationRuleConditions(ruleId) {
  return query(
    `
      SELECT id, rule_id, metric, operator, comparison_value, comparison_unit, sort_order, created_at
      FROM automation_rule_conditions
      WHERE rule_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [ruleId],
  );
}

export async function getAutomationRuleActions(ruleId) {
  return query(
    `
      SELECT id, rule_id, action_type, action_value, delay_seconds, sort_order, created_at
      FROM automation_rule_actions
      WHERE rule_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [ruleId],
  );
}

export async function replaceAutomationConditionsAndActions(ruleId, conditions = [], actions = []) {
  return withTransaction(async (executor) => {
    await executor.execute("DELETE FROM automation_rule_conditions WHERE rule_id = ?", [ruleId]);
    await executor.execute("DELETE FROM automation_rule_actions WHERE rule_id = ?", [ruleId]);

    for (const [index, condition] of conditions.entries()) {
      await executor.execute(
        `
          INSERT INTO automation_rule_conditions (
            rule_id,
            metric,
            operator,
            comparison_value,
            comparison_unit,
            sort_order
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          ruleId,
          condition.metric,
          condition.operator,
          condition.comparisonValue,
          condition.comparisonUnit || null,
          condition.sortOrder ?? index + 1,
        ],
      );
    }

    for (const [index, action] of actions.entries()) {
      await executor.execute(
        `
          INSERT INTO automation_rule_actions (
            rule_id,
            action_type,
            action_value,
            delay_seconds,
            sort_order
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          ruleId,
          action.actionType,
          action.actionValue || null,
          action.delaySeconds ?? 0,
          action.sortOrder ?? index + 1,
        ],
      );
    }
  });
}

export async function countAutomationRules() {
  const row = await queryOne("SELECT COUNT(*) AS total_rules FROM automation_rules");
  return row?.totalRules ?? 0;
}
