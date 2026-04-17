import * as catalogService from "../services/catalogService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await catalogService.getCatalog();
  return sendSuccess(res, data, "Catalog retrieved successfully.");
}

export async function createRoomType(req, res) {
  const data = await catalogService.createRoomTypeRecord(req.body, req.user);
  return sendSuccess(res, data, "Room type created successfully.", 201);
}

export async function updateRoomType(req, res) {
  const data = await catalogService.updateRoomTypeRecord(req.params.id, req.body, req.user);
  return sendSuccess(res, data, "Room type updated successfully.");
}

export async function deleteRoomType(req, res) {
  const data = await catalogService.deleteRoomTypeRecord(req.params.id, req.user);
  return sendSuccess(res, data, "Room type deleted successfully.");
}

export async function createApplianceCategory(req, res) {
  const data = await catalogService.createApplianceCategoryRecord(req.body, req.user);
  return sendSuccess(res, data, "Appliance category created successfully.", 201);
}

export async function updateApplianceCategory(req, res) {
  const data = await catalogService.updateApplianceCategoryRecord(req.params.id, req.body, req.user);
  return sendSuccess(res, data, "Appliance category updated successfully.");
}

export async function deleteApplianceCategory(req, res) {
  const data = await catalogService.deleteApplianceCategoryRecord(req.params.id, req.user);
  return sendSuccess(res, data, "Appliance category deleted successfully.");
}
