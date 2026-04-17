import { query } from "../config/db.js";
import { createNotification as createNotificationRecord } from "../models/notificationModel.js";

async function findRecentAlert(type, roomId, applianceId, title) {
  const rows = await query(
    `
      SELECT id
      FROM notifications
      WHERE type = ?
        AND room_id <=> ?
        AND appliance_id <=> ?
        AND title = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [type, roomId || null, applianceId || null, title],
  );

  return rows[0] || null;
}

async function createScopedAlert(payload) {
  const duplicate = await findRecentAlert(payload.type, payload.roomId, payload.applianceId, payload.title);

  if (duplicate) {
    return null;
  }

  const recipients = payload.userId ? [payload.userId, null] : [null];
  const created = [];

  for (const userId of recipients) {
    const notification = await createNotificationRecord({
      userId,
      roomId: payload.roomId || null,
      applianceId: payload.applianceId || null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      severity: payload.severity,
    });

    created.push(notification);
  }

  return created;
}

export async function evaluateRoomAlerts(room, appliances = []) {
  const alerts = [];

  if (Number(room.currentTemperature) > Number(room.maxTemperatureThreshold)) {
    alerts.push(
      await createScopedAlert({
        userId: room.ownerUserId,
        roomId: room.id,
        type: "HIGH_TEMP",
        title: `${room.name} temperature is above threshold`,
        message: `${room.name} reached ${room.currentTemperature} C, exceeding the ${room.maxTemperatureThreshold} C threshold.`,
        severity: "DANGER",
      }),
    );
  }

  if (Number(room.currentLightLevel) < Number(room.minLightThreshold)) {
    alerts.push(
      await createScopedAlert({
        userId: room.ownerUserId,
        roomId: room.id,
        type: "LOW_LIGHT",
        title: `${room.name} light level is below threshold`,
        message: `${room.name} dropped to ${room.currentLightLevel}% light, below the configured ${room.minLightThreshold}% minimum.`,
        severity: "WARNING",
      }),
    );
  }

  const activeAppliances = appliances.filter((appliance) => ["ON", "DIMMED"].includes(appliance.status));

  if (room.occupancyState !== "OCCUPIED" && activeAppliances.length) {
    alerts.push(
      await createScopedAlert({
        userId: room.ownerUserId,
        roomId: room.id,
        type: "IDLE_ROOM_ACTIVE_DEVICE",
        title: `${room.name} is idle while appliances remain active`,
        message: `${activeAppliances.length} appliance(s) are still active while the room is ${room.occupancyState.toLowerCase()}.`,
        severity: "WARNING",
      }),
    );
  }

  const excessiveUsageAppliances = appliances.filter((appliance) => Number(appliance.estimatedCost || 0) >= 15);

  for (const appliance of excessiveUsageAppliances) {
    alerts.push(
      await createScopedAlert({
        userId: room.ownerUserId,
        roomId: room.id,
        applianceId: appliance.id,
        type: "EXCESS_USAGE",
        title: `${appliance.name} is trending above the cost baseline`,
        message: `${appliance.name} has accumulated ${appliance.estimatedCost} in simulated cost and needs review.`,
        severity: "DANGER",
      }),
    );
  }

  return alerts.flat().filter(Boolean);
}
