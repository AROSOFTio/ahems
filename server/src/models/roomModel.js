import { execute, query, queryOne } from "../config/db.js";

const roomSelect = `
  SELECT
    r.id,
    r.owner_user_id,
    r.room_type_id,
    r.name,
    r.floor_level,
    r.occupancy_state,
    r.current_temperature,
    r.current_light_level,
    r.max_temperature_threshold,
    r.min_light_threshold,
    r.is_active,
    r.created_at,
    r.updated_at,
    rt.name AS room_type_name,
    (
      SELECT COUNT(*) FROM appliances ra WHERE ra.room_id = r.id
    ) AS appliance_count,
    (
      SELECT COUNT(*) FROM appliances ra WHERE ra.room_id = r.id AND ra.status IN ('ON', 'DIMMED')
    ) AS active_appliance_count
  FROM rooms r
  INNER JOIN room_types rt ON rt.id = r.room_type_id
`;

export async function listRooms() {
  return query(`${roomSelect} ORDER BY r.created_at DESC`);
}

export async function findRoomById(id) {
  return queryOne(`${roomSelect} WHERE r.id = ? LIMIT 1`, [id]);
}

export async function listRoomsForUser(user) {
  if (!user) {
    return [];
  }

  if (user.role === "admin") {
    return listRooms();
  }

  return query(`${roomSelect} WHERE r.owner_user_id = ? ORDER BY r.created_at DESC`, [user.id]);
}

export async function listRoomAppliances(roomId) {
  return query(
    `
      SELECT
        a.id,
        a.room_id,
        a.category_id,
        a.name,
        a.power_rating_watts,
        a.status,
        a.mode,
        a.brightness_level,
        a.runtime_minutes_today,
        a.estimated_energy_kwh,
        a.estimated_cost,
        a.last_state_changed_at,
        a.created_at,
        a.updated_at,
        r.owner_user_id AS room_owner_user_id,
        r.name AS room_name,
        ac.name AS category_name,
        ac.icon AS category_icon
      FROM appliances a
      INNER JOIN rooms r ON r.id = a.room_id
      INNER JOIN appliance_categories ac ON ac.id = a.category_id
      WHERE a.room_id = ?
      ORDER BY a.id ASC
    `,
    [roomId],
  );
}

export async function userHasRoomAccess(userId, roomId) {
  const row = await queryOne(
    `
      SELECT id
      FROM rooms
      WHERE id = ? AND owner_user_id = ?
      LIMIT 1
    `,
    [roomId, userId],
  );

  return Boolean(row);
}

export async function updateRoomSensorState(id, updates) {
  const fields = [];
  const values = [];

  if (typeof updates.occupancyState === "string") {
    fields.push("occupancy_state = ?");
    values.push(updates.occupancyState);
  }
  if (typeof updates.temperature === "number") {
    fields.push("current_temperature = ?");
    values.push(updates.temperature);
  }
  if (typeof updates.lightLevel === "number") {
    fields.push("current_light_level = ?");
    values.push(updates.lightLevel);
  }

  if (fields.length === 0) return findRoomById(id);

  values.push(id);
  await execute(
    `UPDATE rooms SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values,
  );

  return findRoomById(id);
}

export async function countRooms() {
  const row = await queryOne("SELECT COUNT(*) AS total_rooms FROM rooms");
  return row?.totalRooms ?? 0;
}
