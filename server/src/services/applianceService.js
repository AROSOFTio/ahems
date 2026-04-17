import {
  createAppliance,
  deleteAppliance,
  findApplianceById,
  listRecentEnergyLogsForAppliance,
  listAppliancesForUser,
  updateAppliance,
} from "../models/applianceModel.js";
import { createActivityLog } from "../models/activityLogModel.js";
import { listRecentDeviceCommandsForAppliance } from "../models/deviceCommandModel.js";
import { findRoomById, userHasRoomAccess } from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";

async function assertRoomManagementAccess(roomId, user) {
  const room = await findRoomById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found.");
  }

  if (user.role === "admin") {
    return room;
  }

  if (room.ownerUserId === user.id) {
    return room;
  }

  if (user.role === "operator" && (await userHasRoomAccess(user.id, room.id))) {
    return room;
  }

  throw new ApiError(403, "You do not have access to manage appliances in this room.");
}

export async function getAppliances(user) {
  return listAppliancesForUser(user);
}

export async function getApplianceById(id, user) {
  const appliance = await findApplianceById(id);
  if (!appliance) throw new ApiError(404, "Appliance not found.");

  if (user?.role === "admin" || !user) {
    return appliance;
  }

  if (user.role === "resident" && appliance.roomOwnerUserId !== user.id) {
    throw new ApiError(403, "You do not have access to this appliance.");
  }

  if (user.role === "operator") {
    const hasAccess = await userHasRoomAccess(user.id, appliance.roomId);
    if (!hasAccess) {
      throw new ApiError(403, "You do not have access to this appliance.");
    }
  }

  const [recentEnergyLogs, recentCommands] = await Promise.all([
    listRecentEnergyLogsForAppliance(appliance.id),
    listRecentDeviceCommandsForAppliance(appliance.id),
  ]);

  return {
    ...appliance,
    recentEnergyLogs,
    recentCommands,
  };
}

export async function createApplianceRecord(payload, user) {
  await assertRoomManagementAccess(payload.roomId, user);

  const appliance = await createAppliance(
    {
      roomId: payload.roomId,
      categoryId: payload.categoryId,
      createdBy: user.id,
      name: payload.name,
      powerRatingWatts: Number(payload.powerRatingWatts),
      status: payload.status || "OFF",
      mode: payload.mode || "MANUAL",
      brightnessLevel: payload.brightnessLevel !== undefined ? Number(payload.brightnessLevel) : 0,
      runtimeMinutesToday: payload.runtimeMinutesToday !== undefined ? Number(payload.runtimeMinutesToday) : 0,
      estimatedEnergyKwh: payload.estimatedEnergyKwh !== undefined ? Number(payload.estimatedEnergyKwh) : 0,
      estimatedCost: payload.estimatedCost !== undefined ? Number(payload.estimatedCost) : 0,
      notes: payload.notes || null,
    },
  );

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Created appliance ${appliance.name}`,
    moduleName: "Appliances",
    entityType: "appliance",
    entityId: appliance.id,
  });

  return appliance;
}

export async function updateApplianceRecord(id, payload, user) {
  const current = await getApplianceById(id, user);

  if (payload.roomId && Number(payload.roomId) !== current.roomId) {
    await assertRoomManagementAccess(payload.roomId, user);
  }

  const appliance = await updateAppliance(id, payload);
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Updated appliance ${appliance.name}`,
    moduleName: "Appliances",
    entityType: "appliance",
    entityId: id,
  });
  return appliance;
}

export async function deleteApplianceRecord(id, user) {
  const appliance = await getApplianceById(id, user);
  const deleted = await deleteAppliance(id);
  if (!deleted) throw new ApiError(404, "Appliance not found.");
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Deleted appliance ${appliance.name}`,
    moduleName: "Appliances",
    entityType: "appliance",
    entityId: id,
  });
  return { deleted: true };
}
