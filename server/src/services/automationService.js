import {
  createAutomationRule,
  deleteAutomationRule,
  findAutomationRuleById,
  listAutomationRules,
  updateAutomationRule,
} from "../models/automationRuleModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ensureStore } from "../utils/mockData.js";

export async function getAutomationRules() {
  return listAutomationRules();
}

export async function getAutomationRuleById(id) {
  const rule = await findAutomationRuleById(id);
  if (!rule) throw new ApiError(404, "Automation rule not found.");
  return rule;
}

export async function createAutomationRuleRecord(payload, user) {
  return createAutomationRule(
    {
      userId: user.id,
      roomId: payload.roomId || null,
      applianceId: payload.applianceId || null,
      name: payload.name,
      isEnabled: payload.isEnabled ?? true,
      priority: payload.priority || 1,
      scope: payload.scope,
    },
    user.id,
  );
}

export async function updateAutomationRuleRecord(id, payload, user) {
  await getAutomationRuleById(id);
  return updateAutomationRule(id, payload, user.id);
}

export async function deleteAutomationRuleRecord(id, user) {
  await getAutomationRuleById(id);
  const deleted = await deleteAutomationRule(id, user.id);
  if (!deleted) throw new ApiError(404, "Automation rule not found.");
  return { deleted: true };
}

export async function getAutomationHistory() {
  const store = await ensureStore();
  return store.activityLogs.filter((item) => item.module === "Automation");
}

