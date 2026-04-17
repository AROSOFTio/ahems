import * as applianceService from "../services/applianceService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await applianceService.getAppliances();
  return sendSuccess(res, data, "Appliances retrieved successfully.");
}

export async function show(req, res) {
  const data = await applianceService.getApplianceById(req.params.id);
  return sendSuccess(res, data, "Appliance retrieved successfully.");
}

export async function update(req, res) {
  const data = await applianceService.updateApplianceRecord(req.params.id, req.body);
  return sendSuccess(res, data, "Appliance updated successfully.");
}
