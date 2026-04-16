import * as automationService from "../services/automationService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await automationService.getAutomationRules();
  return sendSuccess(res, data, "Automation rules retrieved successfully.");
}

export async function show(req, res) {
  const data = await automationService.getAutomationRuleById(req.params.id);
  return sendSuccess(res, data, "Automation rule retrieved successfully.");
}

export async function create(req, res) {
  const data = await automationService.createAutomationRuleRecord(req.body, req.user);
  return sendSuccess(res, data, "Automation rule created successfully.", 201);
}

export async function update(req, res) {
  const data = await automationService.updateAutomationRuleRecord(req.params.id, req.body, req.user);
  return sendSuccess(res, data, "Automation rule updated successfully.");
}

export async function destroy(req, res) {
  const data = await automationService.deleteAutomationRuleRecord(req.params.id, req.user);
  return sendSuccess(res, data, "Automation rule deleted successfully.");
}

export async function history(_req, res) {
  const data = await automationService.getAutomationHistory();
  return sendSuccess(res, data, "Automation history retrieved successfully.");
}

