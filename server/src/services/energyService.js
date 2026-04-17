import { execute, query, queryOne } from "../config/db.js";
import { getActiveTariffSetting } from "../models/settingsModel.js";

function getStateFactor(appliance) {
  if (appliance.status === "OFF") {
    return 0;
  }

  if (appliance.status === "STANDBY") {
    return 0.08;
  }

  if (appliance.status === "DIMMED") {
    return Math.max(0.15, Math.min(1, Number(appliance.brightnessLevel || 45) / 100));
  }

  return 1;
}

function resolveTariffRate(tariff, timeOfDay) {
  if (!tariff) {
    return 0.42;
  }

  if (timeOfDay === "EVENING" && tariff.peakRatePerKwh) {
    return Number(tariff.peakRatePerKwh);
  }

  if ((timeOfDay === "NIGHT" || timeOfDay === "MORNING") && tariff.offPeakRatePerKwh) {
    return Number(tariff.offPeakRatePerKwh);
  }

  return Number(tariff.ratePerKwh || 0.42);
}

export function estimateUsageKwh(appliance, runtimeMinutes) {
  const stateFactor = getStateFactor(appliance);
  const wattHours = Number(appliance.powerRatingWatts || 0) * (Number(runtimeMinutes || 0) / 60) * stateFactor;
  return Number((wattHours / 1000).toFixed(3));
}

export async function accumulateApplianceEnergy(appliance, { runtimeMinutes, source = "SIMULATION", timeOfDay = "AFTERNOON" }) {
  const safeRuntime = Math.max(0, Number(runtimeMinutes || 0));

  if (!safeRuntime) {
    return {
      usageKwh: 0,
      costEstimate: 0,
    };
  }

  const tariff = await getActiveTariffSetting();
  const usageKwh = estimateUsageKwh(appliance, safeRuntime);
  const rate = resolveTariffRate(tariff, timeOfDay);
  const costEstimate = Number((usageKwh * rate).toFixed(2));
  const currency = tariff?.currency || "USD";

  await execute(
    `
      INSERT INTO energy_logs (
        room_id,
        appliance_id,
        usage_date,
        usage_kwh,
        cost_estimate,
        currency,
        runtime_minutes,
        source
      )
      VALUES (?, ?, CURRENT_DATE, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        usage_kwh = usage_kwh + VALUES(usage_kwh),
        cost_estimate = cost_estimate + VALUES(cost_estimate),
        runtime_minutes = runtime_minutes + VALUES(runtime_minutes),
        created_at = CURRENT_TIMESTAMP
    `,
    [appliance.roomId, appliance.id, usageKwh, costEstimate, currency, safeRuntime, source],
  );

  await execute(
    `
      UPDATE appliances
      SET
        runtime_minutes_today = runtime_minutes_today + ?,
        estimated_energy_kwh = estimated_energy_kwh + ?,
        estimated_cost = estimated_cost + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [safeRuntime, usageKwh, costEstimate, appliance.id],
  );

  return {
    usageKwh,
    costEstimate,
    currency,
  };
}

export async function getEnergyInsights(roomIds = null) {
  const roomFilter =
    roomIds === null
      ? { clause: "", params: [] }
      : roomIds.length
        ? { clause: `WHERE el.room_id IN (${roomIds.map(() => "?").join(", ")})`, params: roomIds }
        : { clause: "WHERE 1 = 0", params: [] };

  const [summary, topRoom, topAppliance] = await Promise.all([
    queryOne(
      `
        SELECT
          ROUND(COALESCE(SUM(el.usage_kwh), 0), 3) AS total_usage_kwh,
          ROUND(COALESCE(SUM(el.cost_estimate), 0), 2) AS total_cost,
          ROUND(COALESCE(AVG(el.usage_kwh), 0), 3) AS average_entry_usage
        FROM energy_logs el
        ${roomFilter.clause}
      `,
      roomFilter.params,
    ),
    queryOne(
      `
        SELECT
          r.id AS room_id,
          r.name,
          ROUND(COALESCE(SUM(el.usage_kwh), 0), 3) AS usage_kwh,
          ROUND(COALESCE(SUM(el.cost_estimate), 0), 2) AS cost_estimate
        FROM energy_logs el
        INNER JOIN rooms r ON r.id = el.room_id
        ${roomFilter.clause}
        GROUP BY r.id, r.name
        ORDER BY usage_kwh DESC
        LIMIT 1
      `,
      roomFilter.params,
    ),
    queryOne(
      `
        SELECT
          a.id AS appliance_id,
          a.name,
          ROUND(COALESCE(SUM(el.usage_kwh), 0), 3) AS usage_kwh,
          ROUND(COALESCE(SUM(el.cost_estimate), 0), 2) AS cost_estimate
        FROM energy_logs el
        INNER JOIN appliances a ON a.id = el.appliance_id
        ${roomFilter.clause}
        GROUP BY a.id, a.name
        ORDER BY usage_kwh DESC
        LIMIT 1
      `,
      roomFilter.params,
    ),
  ]);

  return {
    totalUsageKwh: summary?.totalUsageKwh ?? 0,
    totalCost: summary?.totalCost ?? 0,
    averageEntryUsage: summary?.averageEntryUsage ?? 0,
    topRoom,
    topAppliance,
  };
}

export async function getProjectedMonthlyBill(roomIds = null) {
  const filter =
    roomIds === null
      ? { clause: "", params: [] }
      : roomIds.length
        ? { clause: `WHERE room_id IN (${roomIds.map(() => "?").join(", ")})`, params: roomIds }
        : { clause: "WHERE 1 = 0", params: [] };

  const row = await queryOne(
    `
      SELECT
        ROUND(COALESCE(SUM(cost_estimate), 0), 2) AS month_cost,
        COUNT(DISTINCT usage_date) AS active_days
      FROM energy_logs
      ${filter.clause}${filter.clause ? " AND" : " WHERE"} usage_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    `,
    filter.params,
  );

  const activeDays = Number(row?.activeDays || 0);
  const monthCost = Number(row?.monthCost || 0);

  if (!activeDays) {
    return 0;
  }

  return Number(((monthCost / activeDays) * 30).toFixed(2));
}
