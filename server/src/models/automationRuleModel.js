import { execute, query, queryOne } from "../config/db.js";

const ruleSelect = `
  SELECT
    id,
    name,
    description,
    metric,
    operator,
    threshold,
    action_type,
    target,
    is_enabled,
    created_at,
    updated_at
  FROM automation_rules
`;

export async function listAutomationRules() {
  return query(`${ruleSelect} ORDER BY id ASC`);
}

export async function findAutomationRuleById(id) {
  return queryOne(`${ruleSelect} WHERE id = ? LIMIT 1`, [id]);
}

export async function enableAutomationRule(id) {
  await execute(
    "UPDATE automation_rules SET is_enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id],
  );
  return findAutomationRuleById(id);
}

export async function disableAutomationRule(id) {
  await execute(
    "UPDATE automation_rules SET is_enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id],
  );
  return findAutomationRuleById(id);
}

export async function updateRuleThreshold(id, threshold) {
  await execute(
    "UPDATE automation_rules SET threshold = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [threshold, id],
  );
  return findAutomationRuleById(id);
}

export async function countAutomationRules() {
  const row = await queryOne("SELECT COUNT(*) AS total_rules FROM automation_rules");
  return row?.totalRules ?? 0;
}
