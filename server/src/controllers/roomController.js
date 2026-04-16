import * as roomService from "../services/roomService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await roomService.getRooms(req.user);
  return sendSuccess(res, data, "Rooms retrieved successfully.");
}

export async function show(req, res) {
  const data = await roomService.getRoomById(req.params.id, req.user);
  return sendSuccess(res, data, "Room retrieved successfully.");
}

export async function create(req, res) {
  const data = await roomService.createRoomRecord(req.body, req.user);
  return sendSuccess(res, data, "Room created successfully.", 201);
}

export async function update(req, res) {
  const data = await roomService.updateRoomRecord(req.params.id, req.body, req.user);
  return sendSuccess(res, data, "Room updated successfully.");
}

export async function destroy(req, res) {
  const data = await roomService.deleteRoomRecord(req.params.id, req.user);
  return sendSuccess(res, data, "Room deleted successfully.");
}

