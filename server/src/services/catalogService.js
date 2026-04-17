import { createActivityLog } from "../models/activityLogModel.js";
import {
  createApplianceCategory,
  createRoomType,
  deleteApplianceCategory,
  deleteRoomType,
  listApplianceCategories,
  listRoomTypes,
  updateApplianceCategory,
  updateRoomType,
} from "../models/catalogModel.js";
import { ApiError } from "../utils/ApiError.js";

export async function getCatalog() {
  const [roomTypes, applianceCategories] = await Promise.all([
    listRoomTypes(),
    listApplianceCategories(),
  ]);

  return {
    roomTypes,
    applianceCategories,
  };
}

export async function createRoomTypeRecord(payload, user) {
  const roomType = await createRoomType(payload);

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Created room type ${roomType.name}`,
    moduleName: "Catalog",
    entityType: "room_type",
    entityId: roomType.id,
  });

  return roomType;
}

export async function updateRoomTypeRecord(id, payload, user) {
  const roomType = await updateRoomType(id, payload);

  if (!roomType) {
    throw new ApiError(404, "Room type not found.");
  }

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Updated room type ${roomType.name}`,
    moduleName: "Catalog",
    entityType: "room_type",
    entityId: roomType.id,
  });

  return roomType;
}

export async function deleteRoomTypeRecord(id, user) {
  const deleted = await deleteRoomType(id);

  if (!deleted) {
    throw new ApiError(404, "Room type not found.");
  }

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Deleted room type ${id}`,
    moduleName: "Catalog",
    entityType: "room_type",
    entityId: Number(id),
  });

  return { deleted: true };
}

export async function createApplianceCategoryRecord(payload, user) {
  const category = await createApplianceCategory(payload);

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Created appliance category ${category.name}`,
    moduleName: "Catalog",
    entityType: "appliance_category",
    entityId: category.id,
  });

  return category;
}

export async function updateApplianceCategoryRecord(id, payload, user) {
  const category = await updateApplianceCategory(id, payload);

  if (!category) {
    throw new ApiError(404, "Appliance category not found.");
  }

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Updated appliance category ${category.name}`,
    moduleName: "Catalog",
    entityType: "appliance_category",
    entityId: category.id,
  });

  return category;
}

export async function deleteApplianceCategoryRecord(id, user) {
  const deleted = await deleteApplianceCategory(id);

  if (!deleted) {
    throw new ApiError(404, "Appliance category not found.");
  }

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Deleted appliance category ${id}`,
    moduleName: "Catalog",
    entityType: "appliance_category",
    entityId: Number(id),
  });

  return { deleted: true };
}
