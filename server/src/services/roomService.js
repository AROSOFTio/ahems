import { createActivityLog } from "../models/activityLogModel.js";
import {
  createRoom,
  deleteRoom,
  findRoomById,
  listRoomsForUser,
  updateRoom,
  userHasRoomAccess,
} from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";

export async function getRooms(user) {
  return listRoomsForUser(user);
}

export async function getRoomById(id, user) {
  const room = await findRoomById(id);
  if (!room) throw new ApiError(404, "Room not found.");
  const isOwner = room.ownerUserId === user.id;
  const hasOperatorAccess = user.role === "operator" && (await userHasRoomAccess(user.id, room.id));

  if (user.role !== "admin" && !isOwner && !hasOperatorAccess) {
    throw new ApiError(403, "You do not have access to this room.");
  }
  return room;
}

export async function createRoomRecord(payload, user) {
  const room = await createRoom(
    {
      userId: user.role === "admin" ? payload.userId || user.id : user.id,
      name: payload.name,
      roomType: payload.roomType,
      description: payload.description || null,
      floorLevel: payload.floorLevel || null,
      occupancyState: payload.occupancyState || "VACANT",
      temperature: payload.temperature || 22,
      lightLevel: payload.lightLevel || 65,
      thresholds: payload.thresholds || { maxTemp: 25, minLight: 45 },
    },
  );

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Created room ${room.name}`,
    moduleName: "Rooms",
    entityType: "room",
    entityId: room.id,
  });

  return room;
}

export async function updateRoomRecord(id, payload, user) {
  const room = await getRoomById(id, user);
  const updated = await updateRoom(id, payload);
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Updated room ${room.name}`,
    moduleName: "Rooms",
    entityType: "room",
    entityId: id,
  });
  return updated;
}

export async function deleteRoomRecord(id, user) {
  const room = await getRoomById(id, user);
  const deleted = await deleteRoom(id);
  if (!deleted) throw new ApiError(404, "Room not found.");
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Deleted room ${room.name}`,
    moduleName: "Rooms",
    entityType: "room",
    entityId: id,
  });
  return { deleted: true };
}
