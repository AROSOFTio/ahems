import { execute, query, queryOne } from "../config/db.js";

export async function listTariffSettings() {
  return query(
    `
      SELECT
        id,
        name,
        rate_per_kwh,
        peak_rate_per_kwh,
        off_peak_rate_per_kwh,
        currency,
        effective_from,
        effective_to,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM tariff_settings
      ORDER BY effective_from DESC, created_at DESC
    `,
  );
}

export async function getActiveTariffSetting() {
  return queryOne(
    `
      SELECT
        id,
        name,
        rate_per_kwh,
        peak_rate_per_kwh,
        off_peak_rate_per_kwh,
        currency,
        effective_from,
        effective_to,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM tariff_settings
      WHERE is_active = 1
      ORDER BY effective_from DESC, created_at DESC
      LIMIT 1
    `,
  );
}

export async function updateTariffSetting(id, updates) {
  const fields = [];
  const values = [];

  const fieldMap = {
    name: "name",
    ratePerKwh: "rate_per_kwh",
    peakRatePerKwh: "peak_rate_per_kwh",
    offPeakRatePerKwh: "off_peak_rate_per_kwh",
    currency: "currency",
    effectiveFrom: "effective_from",
    effectiveTo: "effective_to",
    isActive: "is_active",
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${column} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return getActiveTariffSetting();
  }

  values.push(id);

  await execute(
    `
      UPDATE tariff_settings
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    values,
  );

  return queryOne(
    `
      SELECT
        id,
        name,
        rate_per_kwh,
        peak_rate_per_kwh,
        off_peak_rate_per_kwh,
        currency,
        effective_from,
        effective_to,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM tariff_settings
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );
}

export async function upsertSystemSetting({ key, value, description = null, updatedBy = null }) {
  await execute(
    `
      INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        description = VALUES(description),
        updated_by = VALUES(updated_by),
        updated_at = CURRENT_TIMESTAMP
    `,
    [key, JSON.stringify(value), description, updatedBy],
  );
}

export async function listSystemSettings() {
  return query(
    `
      SELECT
        id,
        setting_key,
        setting_value,
        description,
        updated_by,
        created_at,
        updated_at
      FROM system_settings
      ORDER BY setting_key ASC
    `,
  );
}
