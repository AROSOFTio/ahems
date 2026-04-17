import { execute, query, queryOne } from "../config/db.js";

const applianceSelect = `
  SELECT DISTINCT
    a.id,
    a.room_id,
    a.category_id,
    a.created_by,
    a.name,
    a.power_rating_watts,
    a.status,
    a.mode,
    a.brightness_level,
    a.runtime_minutes_today,
    a.estimated_energy_kwh,
    a.estimated_cost,
    a.notes,
    a.last_state_changed_at,
    a.created_at,
    a.updated_at,
    r.name AS room_name,
    r.owner_user_id AS room_owner_user_id,
    ac.name AS category_name,
    ac.icon AS category_icon
  FROM appliances a
  INNER JOIN rooms r ON r.id = a.room_id
  INNER JOIN appliance_categories ac ON ac.id = a.category_id
`;

export async function listAppliancesForUser(user) {
  if (user.role === "admin") {
    return query(`${applianceSelect} ORDER BY a.created_at DESC`);
  }

  if (user.role === "operator") {
    return query(
      `
        ${applianceSelect}
        INNER JOIN user_room_assignments ura ON ura.room_id = r.id
        WHERE ura.user_id = ? AND ura.assignment_type IN ('OWNER', 'OPERATOR', 'VIEWER')
        ORDER BY a.created_at DESC
      `,
      [user.id],
    );
  }

  return query(
    `
      ${applianceSelect}
      WHERE r.owner_user_id = ?
      ORDER BY a.created_at DESC
    `,
    [user.id],
  );
}

export async function findApplianceById(id) {
  return queryOne(`${applianceSelect} WHERE a.id = ? LIMIT 1`, [id]);
}

export async function findApplianceCategoryByName(name) {
  return queryOne("SELECT id, name FROM appliance_categories WHERE name = ? LIMIT 1", [name]);
}

export async function createAppliance(payload) {
  const result = await execute(
    `
      INSERT INTO appliances (
        room_id,
        category_id,
        created_by,
        name,
        power_rating_watts,
        status,
        mode,
        brightness_level,
        runtime_minutes_today,
        estimated_energy_kwh,
        estimated_cost,
        notes,
        last_state_changed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      payload.roomId,
      payload.categoryId,
      payload.createdBy,
      payload.name,
      payload.powerRatingWatts,
      payload.status || "OFF",
      payload.mode || "MANUAL",
      payload.brightnessLevel ?? 0,
      payload.runtimeMinutesToday ?? 0,
      payload.estimatedEnergyKwh ?? 0,
      payload.estimatedCost ?? 0,
      payload.notes || null,
    ],
  );

  return findApplianceById(result.insertId);
}

export async function updateAppliance(id, updates) {
  const fields = [];
  const values = [];

  const fieldMap = {
    name: "name",
    roomId: "room_id",
    categoryId: "category_id",
    powerRatingWatts: "power_rating_watts",
    status: "status",
    mode: "mode",
    brightnessLevel: "brightness_level",
    runtimeMinutesToday: "runtime_minutes_today",
    estimatedEnergyKwh: "estimated_energy_kwh",
    estimatedCost: "estimated_cost",
    notes: "notes",
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${column} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return findApplianceById(id);
  }

  fields.push("last_state_changed_at = NOW()");
  values.push(id);

  await execute(
    `
      UPDATE appliances
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    values,
  );

  return findApplianceById(id);
}

export async function deleteAppliance(id) {
  const result = await execute("DELETE FROM appliances WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function countAppliances() {
  const row = await queryOne("SELECT COUNT(*) AS total_appliances FROM appliances");
  return row?.totalAppliances ?? 0;
}

export async function listRecentEnergyLogsForAppliance(applianceId, limit = 8) {
  return query(
    `
      SELECT
        id,
        room_id,
        appliance_id,
        usage_date,
        usage_kwh,
        cost_estimate,
        currency,
        runtime_minutes,
        source,
        created_at
      FROM energy_logs
      WHERE appliance_id = ?
      ORDER BY usage_date DESC, created_at DESC
      LIMIT ?
    `,
    [applianceId, limit],
  );
}
