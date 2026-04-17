import { ApiError } from "../utils/ApiError.js";
import { createActivityLog } from "../models/activityLogModel.js";
import { listRoomsForUser, userHasRoomAccess } from "../models/roomModel.js";
import {
  createNotification as createNotificationRecord,
  findNotificationById,
  listNotificationsForUser,
  markNotificationAsRead as markNotificationAsReadRecord,
} from "../models/notificationModel.js";

export async function getNotifications(user) {
  return listNotificationsForUser(user);
}

export async function getNotificationsByFilter(user, filters) {
  const roomIds = user.role === "admin" ? [] : (await listRoomsForUser(user)).map((room) => room.id);
  return listNotificationsForUser(user, {
    ...filters,
    roomIds,
  });
}

export async function markNotificationAsRead(id, user) {
  const notification = await findNotificationById(id);

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  if (user.role !== "admin" && notification.userId !== user.id) {
    if (!notification.roomId || !(await userHasRoomAccess(user.id, notification.roomId))) {
      throw new ApiError(403, "You do not have access to this notification.");
    }
  }

  const updated = await markNotificationAsReadRecord(id);
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Marked notification ${id} as read`,
    moduleName: "Notifications",
    entityType: "notification",
    entityId: id,
  });
  return updated;
}

export async function createNotification(payload, user) {
  const notification = await createNotificationRecord({
    userId: payload.userId || user.id,
    roomId: payload.roomId || null,
    applianceId: payload.applianceId || null,
    type: payload.type || "SYSTEM",
    title: payload.title,
    message: payload.message,
    severity: payload.severity || "INFO",
  });
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Created notification ${payload.title}`,
    moduleName: "Notifications",
    entityType: "notification",
    entityId: notification.id,
  });
  return notification;
}
