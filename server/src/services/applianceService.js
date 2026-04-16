import {
  createAppliance,
  deleteAppliance,
  findApplianceById,
  listAppliances,
  updateAppliance,
} from "../models/applianceModel.js";
import { listRooms } from "../models/roomModel.js";
import { ApiError } from "../utils/ApiError.js";

export async function getAppliances(user) {
  const appliances = await listAppliances();

  if (user.role === "admin") {
    return appliances;
  }

  const rooms = await listRooms();
  const allowedRoomIds = rooms
    .filter((room) => room.userId === user.id)
    .map((room) => room.id);

  return appliances.filter((appliance) => allowedRoomIds.includes(appliance.roomId));
}

export async function getApplianceById(id) {
  const appliance = await findApplianceById(id);
  if (!appliance) throw new ApiError(404, "Appliance not found.");
  return appliance;
}

export async function createApplianceRecord(payload, user) {
  return createAppliance(
    {
      roomId: payload.roomId,
      categoryId: payload.categoryId,
      name: payload.name,
      powerRatingWatts: payload.powerRatingWatts,
      status: payload.status || "OFF",
      mode: payload.mode || "MANUAL",
      brightnessLevel: payload.brightnessLevel || 0,
      runtimeHours: payload.runtimeHours || 0,
      usageKwh: payload.usageKwh || 0,
      costEstimate: payload.costEstimate || 0,
    },
    user.id,
  );
}

export async function updateApplianceRecord(id, payload, user) {
  await getApplianceById(id);
  return updateAppliance(id, payload, user.id);
}

export async function deleteApplianceRecord(id, user) {
  await getApplianceById(id);
  const deleted = await deleteAppliance(id, user.id);
  if (!deleted) throw new ApiError(404, "Appliance not found.");
  return { deleted: true };
}
