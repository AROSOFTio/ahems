import { execute, query, queryOne } from "../config/db.js";

const notificationSelect = `
  SELECT
    n.id,
    n.user_id,
    n.room_id,
    n.appliance_id,
    n.type,
    n.title,
    n.message,
    n.severity,
    n.is_read,
    n.created_at,
    n.read_at,
    r.name AS room_name,
    a.name AS appliance_name
  FROM notifications n
  LEFT JOIN rooms r ON r.id = n.room_id
  LEFT JOIN appliances a ON a.id = n.appliance_id
`;

export async function listNotificationsForUser(user) {
  if (user.role === "admin") {
    return query(`${notificationSelect} ORDER BY n.created_at DESC`);
  }

  return query(`${notificationSelect} WHERE n.user_id = ? ORDER BY n.created_at DESC`, [user.id]);
}

export async function findNotificationById(id) {
  return queryOne(`${notificationSelect} WHERE n.id = ? LIMIT 1`, [id]);
}

export async function createNotification(payload) {
  const result = await execute(
    `
      INSERT INTO notifications (
        user_id,
        room_id,
        appliance_id,
        type,
        title,
        message,
        severity,
        is_read
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `,
    [
      payload.userId,
      payload.roomId || null,
      payload.applianceId || null,
      payload.type || "SYSTEM",
      payload.title,
      payload.message,
      payload.severity || "INFO",
    ],
  );

  return findNotificationById(result.insertId);
}

export async function markNotificationAsRead(id) {
  await execute("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?", [id]);
  return findNotificationById(id);
}

export async function countUnreadNotifications() {
  const row = await queryOne("SELECT COUNT(*) AS total_unread FROM notifications WHERE is_read = 0");
  return row?.totalUnread ?? 0;
}
