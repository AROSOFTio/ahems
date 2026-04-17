import {
  listRooms,
  findRoomById,
  updateRoomSensorState,
} from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";

export async function getRooms() {
  return listRooms();
}

export async function getRoomById(id) {
  const room = await findRoomById(id);
  if (!room) throw new ApiError(404, "Room not found.");
  return room;
}

export async function updateRoomSensors(id, payload) {
  const room = await findRoomById(id);
  if (!room) throw new ApiError(404, "Room not found.");
  return updateRoomSensorState(id, payload);
}
