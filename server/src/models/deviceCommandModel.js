import { execute, query } from "../config/db.js";

export async function createDeviceCommand({
  userId = null,
  roomId = null,
  applianceId = null,
  commandSource = "BUTTON",
  commandText,
  commandPayload = null,
  executedAction = null,
  status = "SUCCESS",
}) {
  const result = await execute(
    `
      INSERT INTO device_commands (
        user_id,
        room_id,
        appliance_id,
        command_source,
        command_text,
        command_payload,
        executed_action,
        status,
        executed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      userId,
      roomId,
      applianceId,
      commandSource,
      commandText,
      commandPayload ? JSON.stringify(commandPayload) : null,
      executedAction,
      status,
    ],
  );

  const rows = await query(
    `
      SELECT
        dc.id,
        dc.user_id,
        dc.room_id,
        dc.appliance_id,
        dc.command_source,
        dc.command_text,
        dc.command_payload,
        dc.executed_action,
        dc.status,
        dc.executed_at,
        dc.created_at,
        r.name AS room_name,
        a.name AS appliance_name
      FROM device_commands dc
      LEFT JOIN rooms r ON r.id = dc.room_id
      LEFT JOIN appliances a ON a.id = dc.appliance_id
      WHERE dc.id = ?
      LIMIT 1
    `,
    [result.insertId],
  );

  return rows[0] ?? null;
}

export async function listRecentDeviceCommandsForRooms(roomIds = [], limit = 12) {
  if (!roomIds.length) {
    return [];
  }

  return query(
    `
      SELECT
        dc.id,
        dc.user_id,
        dc.room_id,
        dc.appliance_id,
        dc.command_source,
        dc.command_text,
        dc.command_payload,
        dc.executed_action,
        dc.status,
        dc.executed_at,
        dc.created_at,
        r.name AS room_name,
        a.name AS appliance_name
      FROM device_commands dc
      LEFT JOIN rooms r ON r.id = dc.room_id
      LEFT JOIN appliances a ON a.id = dc.appliance_id
      WHERE dc.room_id IN (${roomIds.map(() => "?").join(", ")})
      ORDER BY dc.executed_at DESC, dc.created_at DESC
      LIMIT ?
    `,
    [...roomIds, limit],
  );
}

export async function listRecentDeviceCommandsForAppliance(applianceId, limit = 8) {
  return query(
    `
      SELECT
        dc.id,
        dc.user_id,
        dc.room_id,
        dc.appliance_id,
        dc.command_source,
        dc.command_text,
        dc.command_payload,
        dc.executed_action,
        dc.status,
        dc.executed_at,
        dc.created_at,
        r.name AS room_name
      FROM device_commands dc
      LEFT JOIN rooms r ON r.id = dc.room_id
      WHERE dc.appliance_id = ?
      ORDER BY dc.executed_at DESC, dc.created_at DESC
      LIMIT ?
    `,
    [applianceId, limit],
  );
}

export async function listRecentDeviceCommands(limit = 12) {
  return query(
    `
      SELECT
        dc.id,
        dc.user_id,
        dc.room_id,
        dc.appliance_id,
        dc.command_source,
        dc.command_text,
        dc.command_payload,
        dc.executed_action,
        dc.status,
        dc.executed_at,
        dc.created_at,
        r.name AS room_name,
        a.name AS appliance_name
      FROM device_commands dc
      LEFT JOIN rooms r ON r.id = dc.room_id
      LEFT JOIN appliances a ON a.id = dc.appliance_id
      ORDER BY dc.executed_at DESC, dc.created_at DESC
      LIMIT ?
    `,
    [limit],
  );
}
