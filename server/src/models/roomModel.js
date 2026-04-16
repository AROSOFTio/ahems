import { execute, query, queryOne, withTransaction } from "../config/db.js";

const roomSelect = `
  SELECT DISTINCT
    r.id,
    r.owner_user_id,
    r.room_type_id,
    r.name,
    r.description,
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
    CONCAT(u.first_name, ' ', u.last_name) AS owner_name,
    u.email AS owner_email
  FROM rooms r
  INNER JOIN room_types rt ON rt.id = r.room_type_id
  INNER JOIN users u ON u.id = r.owner_user_id
`;

export async function listRoomsForUser(user) {
  if (user.role === "admin") {
    return query(`${roomSelect} ORDER BY r.created_at DESC`);
  }

  if (user.role === "operator") {
    return query(
      `
        ${roomSelect}
        INNER JOIN user_room_assignments ura ON ura.room_id = r.id
        WHERE ura.user_id = ? AND ura.assignment_type IN ('OWNER', 'OPERATOR', 'VIEWER')
        ORDER BY r.created_at DESC
      `,
      [user.id],
    );
  }

  return query(`${roomSelect} WHERE r.owner_user_id = ? ORDER BY r.created_at DESC`, [user.id]);
}

export async function findRoomById(id) {
  return queryOne(`${roomSelect} WHERE r.id = ? LIMIT 1`, [id]);
}

export async function userHasRoomAccess(userId, roomId) {
  const assignment = await queryOne(
    `
      SELECT id, assignment_type
      FROM user_room_assignments
      WHERE user_id = ? AND room_id = ?
      LIMIT 1
    `,
    [userId, roomId],
  );

  return Boolean(assignment);
}

export async function findRoomTypeByName(name, executor = { queryOne }) {
  return executor.queryOne("SELECT id, name FROM room_types WHERE name = ? LIMIT 1", [name]);
}

export async function createRoom(payload) {
  return withTransaction(async (executor) => {
    const roomType = await findRoomTypeByName(payload.roomType, executor);
    const roomTypeId = roomType?.id ?? 1;

    const result = await executor.execute(
      `
        INSERT INTO rooms (
          owner_user_id,
          room_type_id,
          name,
          description,
          floor_level,
          occupancy_state,
          current_temperature,
          current_light_level,
          max_temperature_threshold,
          min_light_threshold,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.userId,
        roomTypeId,
        payload.name,
        payload.description || null,
        payload.floorLevel || null,
        payload.occupancyState || "VACANT",
        payload.temperature ?? 22,
        payload.lightLevel ?? 65,
        payload.thresholds?.maxTemp ?? 25,
        payload.thresholds?.minLight ?? 45,
        payload.isActive ?? 1,
      ],
    );

    await executor.execute(
      `
        INSERT INTO user_room_assignments (user_id, room_id, assignment_type)
        VALUES (?, ?, 'OWNER')
        ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
      `,
      [payload.userId, result.insertId],
    );

    return executor.queryOne(`${roomSelect} WHERE r.id = ? LIMIT 1`, [result.insertId]);
  });
}

export async function updateRoom(id, updates) {
  const fields = [];
  const values = [];

  if (typeof updates.name === "string") {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (typeof updates.description === "string" || updates.description === null) {
    fields.push("description = ?");
    values.push(updates.description);
  }

  if (typeof updates.floorLevel === "string" || updates.floorLevel === null) {
    fields.push("floor_level = ?");
    values.push(updates.floorLevel);
  }

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

  if (updates.thresholds?.maxTemp !== undefined) {
    fields.push("max_temperature_threshold = ?");
    values.push(updates.thresholds.maxTemp);
  }

  if (updates.thresholds?.minLight !== undefined) {
    fields.push("min_light_threshold = ?");
    values.push(updates.thresholds.minLight);
  }

  if (typeof updates.isActive === "number" || typeof updates.isActive === "boolean") {
    fields.push("is_active = ?");
    values.push(updates.isActive ? 1 : 0);
  }

  if (typeof updates.roomType === "string") {
    const roomType = await findRoomTypeByName(updates.roomType);
    if (roomType?.id) {
      fields.push("room_type_id = ?");
      values.push(roomType.id);
    }
  }

  if (fields.length === 0) {
    return findRoomById(id);
  }

  values.push(id);

  await execute(
    `
      UPDATE rooms
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    values,
  );

  return findRoomById(id);
}

export async function deleteRoom(id) {
  const result = await execute("DELETE FROM rooms WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function countRooms() {
  const row = await queryOne("SELECT COUNT(*) AS total_rooms FROM rooms");
  return row?.totalRooms ?? 0;
}
