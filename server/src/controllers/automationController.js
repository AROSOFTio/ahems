import * as automationService from "../services/automationService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await automationService.getAutomationRules();
  return sendSuccess(res, data, "Automation rules retrieved successfully.");
}

export async function enable(req, res) {
  const data = await automationService.setRuleEnabledState(req.params.id, true);
  return sendSuccess(res, data, "Automation rule enabled successfully.");
}

export async function disable(req, res) {
  const data = await automationService.setRuleEnabledState(req.params.id, false);
  return sendSuccess(res, data, "Automation rule disabled successfully.");
}
