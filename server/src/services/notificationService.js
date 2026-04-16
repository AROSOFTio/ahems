import { addActivityLog, createId, ensureStore } from "../utils/mockData.js";
import { ApiError } from "../utils/ApiError.js";

export async function getNotifications(user) {
  const store = await ensureStore();
  return user.role === "admin"
    ? store.notifications
    : store.notifications.filter((notification) => notification.userId === user.id);
}

export async function markNotificationAsRead(id, user) {
  const store = await ensureStore();
  const notification = store.notifications.find((item) => item.id === id);

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  if (user.role !== "admin" && notification.userId !== user.id) {
    throw new ApiError(403, "You do not have access to this notification.");
  }

  notification.isRead = true;
  addActivityLog(user.id, `Marked notification ${id} as read`, "Notifications");
  return notification;
}

export async function createNotification(payload, user) {
  const store = await ensureStore();
  const notification = {
    id: createId("not"),
    userId: payload.userId || user.id,
    type: payload.type || "SYSTEM",
    title: payload.title,
    message: payload.message,
    severity: payload.severity || "INFO",
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  store.notifications.unshift(notification);
  addActivityLog(user.id, `Created notification ${payload.title}`, "Notifications");
  return notification;
}

