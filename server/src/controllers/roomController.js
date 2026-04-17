import * as roomService from "../services/roomService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await roomService.getRooms();
  return sendSuccess(res, data, "Rooms retrieved successfully.");
}

export async function show(req, res) {
  const data = await roomService.getRoomById(req.params.id);
  return sendSuccess(res, data, "Room retrieved successfully.");
}

export async function update(req, res) {
  const data = await roomService.updateRoomSensors(req.params.id, req.body);
  return sendSuccess(res, data, "Room updated successfully.");
}
