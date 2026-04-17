import { execute, query, queryOne } from "../config/db.js";

const applianceSelect = `
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
    r.name            AS room_name,
    ac.name           AS category_name,
    ac.icon           AS category_icon
  FROM appliances a
  INNER JOIN rooms r             ON r.id  = a.room_id
  INNER JOIN appliance_categories ac ON ac.id = a.category_id
`;

export async function listAppliances() {
  return query(`${applianceSelect} ORDER BY a.id ASC`);
}

export async function findApplianceById(id) {
  return queryOne(`${applianceSelect} WHERE a.id = ? LIMIT 1`, [id]);
}

export async function updateAppliance(id, updates) {
  const fields = [];
  const values = [];

  const fieldMap = {
    status:             "status",
    mode:               "mode",
    brightnessLevel:    "brightness_level",
    runtimeMinutesToday:"runtime_minutes_today",
    estimatedEnergyKwh: "estimated_energy_kwh",
    estimatedCost:      "estimated_cost",
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${column} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) return findApplianceById(id);

  fields.push("last_state_changed_at = NOW()");
  values.push(id);

  await execute(
    `UPDATE appliances SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values,
  );

  return findApplianceById(id);
}

export async function countAppliances() {
  const row = await queryOne("SELECT COUNT(*) AS total_appliances FROM appliances");
  return row?.totalAppliances ?? 0;
}
