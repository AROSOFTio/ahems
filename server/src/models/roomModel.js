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
