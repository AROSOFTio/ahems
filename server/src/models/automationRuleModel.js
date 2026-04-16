import { addActivityLog, createId, ensureStore } from "../utils/mockData.js";

export async function listAutomationRules() {
  const store = await ensureStore();
  return store.automationRules;
}

export async function findAutomationRuleById(id) {
  const store = await ensureStore();
  return store.automationRules.find((rule) => rule.id === id) || null;
}

export async function createAutomationRule(payload, actorId) {
  const store = await ensureStore();
  const rule = {
    id: createId("rule"),
    ...payload,
  };
  store.automationRules.push(rule);
  addActivityLog(actorId, `Created automation rule ${payload.name}`, "Automation");
  return rule;
}

export async function updateAutomationRule(id, updates, actorId) {
  const rule = await findAutomationRuleById(id);
  if (!rule) return null;
  Object.assign(rule, updates);
  addActivityLog(actorId, `Updated automation rule ${rule.name}`, "Automation");
  return rule;
}

export async function deleteAutomationRule(id, actorId) {
  const store = await ensureStore();
  const index = store.automationRules.findIndex((rule) => rule.id === id);
  if (index === -1) return false;
  const [removed] = store.automationRules.splice(index, 1);
  addActivityLog(actorId, `Deleted automation rule ${removed.name}`, "Automation");
  return true;
}

