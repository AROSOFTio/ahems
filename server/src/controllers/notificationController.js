import * as notificationService from "../services/notificationService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await notificationService.getNotifications(req.user);
  return sendSuccess(res, data, "Notifications retrieved successfully.");
}

export async function markRead(req, res) {
  const data = await notificationService.markNotificationAsRead(req.params.id, req.user);
  return sendSuccess(res, data, "Notification marked as read.");
}

export async function create(req, res) {
  const data = await notificationService.createNotification(req.body, req.user);
  return sendSuccess(res, data, "Notification created successfully.", 201);
}

