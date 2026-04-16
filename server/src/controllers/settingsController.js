import * as settingsService from "../services/settingsService.js";
import { sendSuccess } from "../utils/response.js";

export async function show(_req, res) {
  const data = await settingsService.getSettings();
  return sendSuccess(res, data, "Settings retrieved successfully.");
}

export async function update(req, res) {
  const data = await settingsService.updateSettings(req.body, req.user);
  return sendSuccess(res, data, "Settings updated successfully.");
}

