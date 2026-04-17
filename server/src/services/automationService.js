import {
  listAutomationRules,
  findAutomationRuleById,
  enableAutomationRule,
  disableAutomationRule,
} from "../models/automationRuleModel.js";
import { ApiError } from "../utils/ApiError.js";

export async function getAutomationRules() {
  return listAutomationRules();
}

export async function setRuleEnabledState(id, isEnabled) {
  const rule = await findAutomationRuleById(id);
  if (!rule) throw new ApiError(404, "Automation rule not found.");

  return isEnabled
    ? enableAutomationRule(id)
    : disableAutomationRule(id);
}
