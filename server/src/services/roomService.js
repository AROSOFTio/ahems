import { createRoom, deleteRoom, findRoomById, listRooms, updateRoom } from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";

function filterRoomsForUser(rooms, user) {
  if (user.role === "admin") return rooms;
  return rooms.filter((room) => room.userId === user.id);
}

export async function getRooms(user) {
  const rooms = await listRooms();
  return filterRoomsForUser(rooms, user);
}

export async function getRoomById(id, user) {
  const room = await findRoomById(id);
  if (!room) throw new ApiError(404, "Room not found.");
  if (user.role !== "admin" && room.userId !== user.id) {
    throw new ApiError(403, "You do not have access to this room.");
  }
  return room;
}

export async function createRoomRecord(payload, user) {
  return createRoom(
    {
      userId: user.role === "admin" ? payload.userId || user.id : user.id,
      name: payload.name,
      roomType: payload.roomType,
      occupancyState: payload.occupancyState || "VACANT",
      temperature: payload.temperature || 22,
      lightLevel: payload.lightLevel || 65,
      thresholds: payload.thresholds || { maxTemp: 25, minLight: 45 },
    },
    user.id,
  );
}

export async function updateRoomRecord(id, payload, user) {
  await getRoomById(id, user);
  return updateRoom(id, payload, user.id);
}

export async function deleteRoomRecord(id, user) {
  await getRoomById(id, user);
  const deleted = await deleteRoom(id, user.id);
  if (!deleted) throw new ApiError(404, "Room not found.");
  return { deleted: true };
}

