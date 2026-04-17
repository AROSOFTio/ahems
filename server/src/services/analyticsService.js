import { query, queryOne } from "../config/db.js";
import { listActivityLogs } from "../models/activityLogModel.js";
import { listRoomsForUser } from "../models/roomModel.js";
import { getActiveTariffSetting } from "../models/settingsModel.js";
import { getEnergyInsights, getProjectedMonthlyBill } from "./energyService.js";

async function resolveAccessibleRoomIds(user) {
  if (!user || user.role === "admin") {
    return null;
  }

  const rooms = await listRoomsForUser(user);
  return rooms.map((room) => room.id);
}

function buildInClause(values, columnName, { emptyFallsBackToFalse = true } = {}) {
  if (values === null) {
    return {
      clause: "",
      params: [],
    };
  }

  if (!values.length) {
    return {
      clause: emptyFallsBackToFalse ? "WHERE 1 = 0" : "",
      params: [],
    };
  }

  return {
    clause: `WHERE ${columnName} IN (${values.map(() => "?").join(", ")})`,
    params: values,
  };
}

function buildNotificationsScope(user, roomIds) {
  if (!user || user.role === "admin") {
    return {
      clause: "",
      params: [],
    };
  }

  if (!roomIds.length) {
    return {
      clause: "WHERE n.user_id = ? OR n.user_id IS NULL",
      params: [user.id],
    };
  }

  return {
    clause: `WHERE n.user_id = ? OR n.user_id IS NULL OR n.room_id IN (${roomIds.map(() => "?").join(", ")})`,
    params: [user.id, ...roomIds],
  };
}

export async function getDashboardAnalytics(user = null) {
  const roomIds = await resolveAccessibleRoomIds(user);
  const roomScope = buildInClause(roomIds, "id");
  const occupancyScope = buildInClause(roomIds, "id");
  const deviceScope = buildInClause(roomIds, "r.id");
  const energyScope = buildInClause(roomIds, "room_id");
  const notificationScope = buildNotificationsScope(user, roomIds ?? []);
  const [roomSummary, deviceSummary, occupancySummary, energySummary, recentAlerts, recentActivity, energyInsights] =
    await Promise.all([
      queryOne(
        `
          SELECT
            COUNT(*) AS total_rooms,
            ROUND(AVG(current_temperature), 1) AS average_temperature,
            ROUND(AVG(current_light_level), 1) AS average_light_level
          FROM rooms
          ${roomScope.clause}
        `,
        roomScope.params,
      ),
      queryOne(
        `
          SELECT
            COUNT(*) AS total_devices,
            SUM(CASE WHEN status IN ('ON', 'DIMMED') THEN 1 ELSE 0 END) AS active_devices,
            SUM(CASE WHEN mode = 'AUTO' THEN 1 ELSE 0 END) AS auto_mode_devices
          FROM appliances a
          INNER JOIN rooms r ON r.id = a.room_id
          ${deviceScope.clause}
        `,
        deviceScope.params,
      ),
      queryOne(
        `
          SELECT
            SUM(CASE WHEN occupancy_state = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied_rooms,
            SUM(CASE WHEN occupancy_state <> 'OCCUPIED' THEN 1 ELSE 0 END) AS vacant_rooms
          FROM rooms
          ${occupancyScope.clause}
        `,
        occupancyScope.params,
      ),
      queryOne(
        `
          SELECT
            ROUND(COALESCE(SUM(usage_kwh), 0), 3) AS estimated_energy_usage,
            ROUND(COALESCE(SUM(cost_estimate), 0), 2) AS estimated_cost
          FROM energy_logs
          ${energyScope.clause}
        `,
        energyScope.params,
      ),
      query(
        `
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
            n.read_at
          FROM notifications n
          ${notificationScope.clause}
          ORDER BY n.created_at DESC
          LIMIT 5
        `,
        notificationScope.params,
      ),
      listActivityLogs(user?.role === "admin" ? 8 : { userId: user?.id, limit: 20 }),
      getEnergyInsights(roomIds),
    ]);

  return {
    totalRooms: roomSummary?.totalRooms ?? 0,
    totalDevices: deviceSummary?.totalDevices ?? 0,
    activeDevices: deviceSummary?.activeDevices ?? 0,
    autoModeDevices: deviceSummary?.autoModeDevices ?? 0,
    averageTemperature: roomSummary?.averageTemperature ?? 0,
    averageLightLevel: roomSummary?.averageLightLevel ?? 0,
    occupancySummary: {
      occupied: occupancySummary?.occupiedRooms ?? 0,
      vacant: occupancySummary?.vacantRooms ?? 0,
    },
    estimatedEnergyUsage: energySummary?.estimatedEnergyUsage ?? 0,
    estimatedCost: energySummary?.estimatedCost ?? 0,
    energyHighlights: energyInsights,
    recentAlerts,
    recentAutomationActions:
      user?.role === "admin"
        ? recentActivity.filter((item) => ["Automation", "Commands", "Sensors"].includes(item.moduleName))
        : recentActivity.filter((item) => ["Automation", "Commands", "Sensors"].includes(item.moduleName)).slice(0, 5),
  };
}

export async function getEnergyAnalytics(user = null) {
  const roomIds = await resolveAccessibleRoomIds(user);
  const applianceScope = buildInClause(roomIds, "r.id");
  const roomScope = buildInClause(roomIds, "r.id");
  const logScope = buildInClause(roomIds, "el.room_id");
  const [usageByAppliance, usageByRoom, dailyTrends, weeklyTrends, monthlyTrends, tariff, energyInsights, projectedBill] =
    await Promise.all([
      query(
        `
          SELECT
            a.id AS appliance_id,
            a.name,
            ROUND(COALESCE(SUM(el.usage_kwh), 0), 3) AS usage_kwh,
            ROUND(COALESCE(SUM(el.cost_estimate), 0), 2) AS cost_estimate
          FROM appliances a
          INNER JOIN rooms r ON r.id = a.room_id
          LEFT JOIN energy_logs el ON el.appliance_id = a.id
          ${applianceScope.clause}
          GROUP BY a.id, a.name
          ORDER BY usage_kwh DESC, a.name ASC
        `,
        applianceScope.params,
      ),
      query(
        `
          SELECT
            r.id AS room_id,
            r.name,
            ROUND(COALESCE(SUM(el.usage_kwh), 0), 3) AS usage_kwh,
            ROUND(COALESCE(SUM(el.cost_estimate), 0), 2) AS cost_estimate
          FROM rooms r
          LEFT JOIN energy_logs el ON el.room_id = r.id
          ${roomScope.clause}
          GROUP BY r.id, r.name
          ORDER BY usage_kwh DESC, r.name ASC
        `,
        roomScope.params,
      ),
      query(
        `
          SELECT
            DATE_FORMAT(el.usage_date, '%Y-%m-%d') AS period,
            ROUND(COALESCE(SUM(el.usage_kwh), 0), 3) AS usage_kwh,
            ROUND(COALESCE(SUM(el.cost_estimate), 0), 2) AS cost_estimate
          FROM energy_logs el
          ${logScope.clause}${logScope.clause ? " AND" : " WHERE"} el.usage_date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
          GROUP BY el.usage_date
          ORDER BY el.usage_date ASC
        `,
        logScope.params,
      ),
      query(
        `
          SELECT
            CONCAT(YEAR(el.usage_date), '-W', LPAD(WEEK(el.usage_date, 1), 2, '0')) AS period,
            ROUND(COALESCE(SUM(el.usage_kwh), 0), 3) AS usage_kwh,
            ROUND(COALESCE(SUM(el.cost_estimate), 0), 2) AS cost_estimate
          FROM energy_logs el
          ${logScope.clause}${logScope.clause ? " AND" : " WHERE"} el.usage_date >= DATE_SUB(CURRENT_DATE, INTERVAL 8 WEEK)
          GROUP BY YEAR(el.usage_date), WEEK(el.usage_date, 1)
          ORDER BY YEAR(el.usage_date) ASC, WEEK(el.usage_date, 1) ASC
        `,
        logScope.params,
      ),
      query(
        `
          SELECT
            DATE_FORMAT(el.usage_date, '%Y-%m') AS period,
            ROUND(COALESCE(SUM(el.usage_kwh), 0), 3) AS usage_kwh,
            ROUND(COALESCE(SUM(el.cost_estimate), 0), 2) AS cost_estimate
          FROM energy_logs el
          ${logScope.clause}${logScope.clause ? " AND" : " WHERE"} el.usage_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
          GROUP BY DATE_FORMAT(el.usage_date, '%Y-%m')
          ORDER BY DATE_FORMAT(el.usage_date, '%Y-%m') ASC
        `,
        logScope.params,
      ),
      getActiveTariffSetting(),
      getEnergyInsights(roomIds),
      getProjectedMonthlyBill(roomIds),
    ]);

  const totalUsageKwh = usageByAppliance.reduce((sum, item) => sum + Number(item.usageKwh || 0), 0);
  const totalCost = usageByAppliance.reduce((sum, item) => sum + Number(item.costEstimate || 0), 0);

  return {
    usageByAppliance,
    usageByRoom,
    dailyTrends,
    weeklyTrends,
    monthlyTrends,
    tariff,
    projectedBill,
    summary: {
      totalUsageKwh: Number(totalUsageKwh.toFixed(3)),
      totalCost: Number(totalCost.toFixed(2)),
      topRoom: energyInsights.topRoom,
      topAppliance: energyInsights.topAppliance,
      averageEntryUsage: energyInsights.averageEntryUsage,
    },
    insights: [
      energyInsights.topRoom
        ? `${energyInsights.topRoom.name} is currently the top-consuming room at ${energyInsights.topRoom.usageKwh} kWh.`
        : "No room energy data is available yet.",
      energyInsights.topAppliance
        ? `${energyInsights.topAppliance.name} is the highest-consuming appliance at ${energyInsights.topAppliance.usageKwh} kWh.`
        : "No appliance energy data is available yet.",
      `Projected monthly bill is ${projectedBill.toFixed(2)} ${tariff?.currency || "USD"} based on the current simulation pace.`,
    ],
  };
}

export async function getOccupancyAnalytics(user = null) {
  const roomIds = await resolveAccessibleRoomIds(user);
  const roomScope = buildInClause(roomIds, "r.id");

  return query(
    `
      SELECT
        r.id AS room_id,
        r.name,
        r.occupancy_state,
        r.current_light_level,
        r.current_temperature,
        rt.name AS room_type_name
      FROM rooms r
      INNER JOIN room_types rt ON rt.id = r.room_type_id
      ${roomScope.clause}
      ORDER BY r.name ASC
    `,
    roomScope.params,
  );
}
