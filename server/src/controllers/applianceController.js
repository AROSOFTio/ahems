import * as applianceService from "../services/applianceService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await applianceService.getAppliances(req.user);
  return sendSuccess(res, data, "Appliances retrieved successfully.");
}

export async function show(req, res) {
  const data = await applianceService.getApplianceById(req.params.id, req.user);
  return sendSuccess(res, data, "Appliance retrieved successfully.");
}

export async function create(req, res) {
  const data = await applianceService.createApplianceRecord(req.body, req.user);
  return sendSuccess(res, data, "Appliance created successfully.", 201);
}

export async function update(req, res) {
  const data = await applianceService.updateApplianceRecord(req.params.id, req.body, req.user);
  return sendSuccess(res, data, "Appliance updated successfully.");
}

export async function destroy(req, res) {
  const data = await applianceService.deleteApplianceRecord(req.params.id, req.user);
  return sendSuccess(res, data, "Appliance deleted successfully.");
}
