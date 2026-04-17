import { query } from "../config/db.js";
import { createActivityLog } from "../models/activityLogModel.js";
import {
  createReportWithExport,
  listReportExports as listReportExportRecords,
  listReportsForUser,
} from "../models/reportModel.js";
import { listRoomsForUser } from "../models/roomModel.js";
import { buildCsv, buildSimplePdf } from "../utils/export.js";

async function resolveAccessibleRoomIds(user) {
  if (user.role === "admin") {
    return null;
  }

  const rooms = await listRoomsForUser(user);
  return rooms.map((room) => room.id);
}

function buildScopedWhere(roomIds, filters = {}) {
  const clauses = [];
  const params = [];

  if (roomIds !== null) {
    if (!roomIds.length) {
      clauses.push("1 = 0");
    } else {
      clauses.push(`base.room_id IN (${roomIds.map(() => "?").join(", ")})`);
      params.push(...roomIds);
    }
  }

  if (filters.roomId) {
    clauses.push("base.room_id = ?");
    params.push(filters.roomId);
  }

  if (filters.applianceId) {
    clauses.push("base.appliance_id = ?");
    params.push(filters.applianceId);
  }

  if (filters.userId) {
    clauses.push("base.user_id = ?");
    params.push(filters.userId);
  }

  if (filters.startDate) {
    clauses.push("base.usage_date >= ?");
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    clauses.push("base.usage_date <= ?");
    params.push(filters.endDate);
  }

  return {
    clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

async function getRoomUsageReport(filters, user) {
  const roomIds = await resolveAccessibleRoomIds(user);
  const scope = buildScopedWhere(roomIds, filters);

  const rows = await query(
    `
      SELECT
        base.room_id,
        base.room_name,
        ROUND(COALESCE(SUM(base.usage_kwh), 0), 3) AS usage_kwh,
        ROUND(COALESCE(SUM(base.cost_estimate), 0), 2) AS cost_estimate,
        SUM(base.runtime_minutes) AS runtime_minutes,
        COUNT(DISTINCT base.appliance_id) AS appliance_count
      FROM (
        SELECT
          el.room_id,
          r.owner_user_id AS user_id,
          el.appliance_id,
          el.usage_date,
          el.usage_kwh,
          el.cost_estimate,
          el.runtime_minutes,
          r.name AS room_name
        FROM energy_logs el
        INNER JOIN rooms r ON r.id = el.room_id
      ) base
      ${scope.clause}
      GROUP BY base.room_id, base.room_name
      ORDER BY usage_kwh DESC, base.room_name ASC
    `,
    scope.params,
  );

  return {
    columns: [
      { key: "roomName", label: "Room" },
      { key: "usageKwh", label: "Usage (kWh)" },
      { key: "costEstimate", label: "Cost" },
      { key: "runtimeMinutes", label: "Runtime (min)" },
      { key: "applianceCount", label: "Appliances" },
    ],
    rows,
    summary: {
      totalUsageKwh: rows.reduce((sum, row) => sum + Number(row.usageKwh || 0), 0),
      totalCost: rows.reduce((sum, row) => sum + Number(row.costEstimate || 0), 0),
    },
  };
}

async function getApplianceUsageReport(filters, user) {
  const roomIds = await resolveAccessibleRoomIds(user);
  const scope = buildScopedWhere(roomIds, filters);

  const rows = await query(
    `
      SELECT
        base.appliance_id,
        base.appliance_name,
        base.room_name,
        ROUND(COALESCE(SUM(base.usage_kwh), 0), 3) AS usage_kwh,
        ROUND(COALESCE(SUM(base.cost_estimate), 0), 2) AS cost_estimate,
        SUM(base.runtime_minutes) AS runtime_minutes
      FROM (
        SELECT
          el.room_id,
          r.owner_user_id AS user_id,
          el.appliance_id,
          el.usage_date,
          el.usage_kwh,
          el.cost_estimate,
          el.runtime_minutes,
          a.name AS appliance_name,
          r.name AS room_name
        FROM energy_logs el
        INNER JOIN appliances a ON a.id = el.appliance_id
        INNER JOIN rooms r ON r.id = el.room_id
      ) base
      ${scope.clause}
      GROUP BY base.appliance_id, base.appliance_name, base.room_name
      ORDER BY usage_kwh DESC, base.appliance_name ASC
    `,
    scope.params,
  );

  return {
    columns: [
      { key: "applianceName", label: "Appliance" },
      { key: "roomName", label: "Room" },
      { key: "usageKwh", label: "Usage (kWh)" },
      { key: "costEstimate", label: "Cost" },
      { key: "runtimeMinutes", label: "Runtime (min)" },
    ],
    rows,
    summary: {
      totalUsageKwh: rows.reduce((sum, row) => sum + Number(row.usageKwh || 0), 0),
      totalCost: rows.reduce((sum, row) => sum + Number(row.costEstimate || 0), 0),
    },
  };
}

async function getAutomationHistoryReport(filters, user) {
  const roomIds = await resolveAccessibleRoomIds(user);
  const clauses = [];
  const params = [];

  if (roomIds !== null) {
    if (!roomIds.length) {
      clauses.push("1 = 0");
    } else {
      clauses.push(`arr.room_id IN (${roomIds.map(() => "?").join(", ")})`);
      params.push(...roomIds);
    }
  }

  if (filters.roomId) {
    clauses.push("arr.room_id = ?");
    params.push(filters.roomId);
  }

  if (filters.applianceId) {
    clauses.push("arr.appliance_id = ?");
    params.push(filters.applianceId);
  }

  if (filters.startDate) {
    clauses.push("DATE(arr.triggered_at) >= ?");
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    clauses.push("DATE(arr.triggered_at) <= ?");
    params.push(filters.endDate);
  }

  const rows = await query(
    `
      SELECT
        arr.id,
        ar.name AS rule_name,
        r.name AS room_name,
        a.name AS appliance_name,
        arr.trigger_source,
        arr.status,
        arr.triggered_at
      FROM automation_rule_runs arr
      INNER JOIN automation_rules ar ON ar.id = arr.rule_id
      LEFT JOIN rooms r ON r.id = arr.room_id
      LEFT JOIN appliances a ON a.id = arr.appliance_id
      ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      ORDER BY arr.triggered_at DESC
      LIMIT 100
    `,
    params,
  );

  return {
    columns: [
      { key: "ruleName", label: "Rule" },
      { key: "roomName", label: "Room" },
      { key: "applianceName", label: "Appliance" },
      { key: "triggerSource", label: "Source" },
      { key: "status", label: "Status" },
      { key: "triggeredAt", label: "Triggered At" },
    ],
    rows,
    summary: {
      totalRuns: rows.length,
      triggeredRuns: rows.filter((row) => row.status === "TRIGGERED").length,
    },
  };
}

async function getThresholdViolationsReport(filters, user) {
  const roomIds = await resolveAccessibleRoomIds(user);
  const clauses = [
    "n.type IN ('HIGH_TEMP', 'LOW_LIGHT', 'EXCESS_USAGE', 'THRESHOLD_EXCEEDED', 'IDLE_ROOM_ACTIVE_DEVICE', 'RULE_TRIGGERED')",
  ];
  const params = [];

  if (roomIds !== null) {
    if (!roomIds.length) {
      clauses.push("1 = 0");
    } else {
      clauses.push(`(n.room_id IN (${roomIds.map(() => "?").join(", ")}) OR n.room_id IS NULL)`);
      params.push(...roomIds);
    }
  }

  if (filters.roomId) {
    clauses.push("n.room_id = ?");
    params.push(filters.roomId);
  }

  if (filters.applianceId) {
    clauses.push("n.appliance_id = ?");
    params.push(filters.applianceId);
  }

  if (filters.startDate) {
    clauses.push("DATE(n.created_at) >= ?");
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    clauses.push("DATE(n.created_at) <= ?");
    params.push(filters.endDate);
  }

  const rows = await query(
    `
      SELECT
        n.id,
        n.type,
        n.title,
        n.severity,
        n.created_at,
        r.name AS room_name,
        a.name AS appliance_name
      FROM notifications n
      LEFT JOIN rooms r ON r.id = n.room_id
      LEFT JOIN appliances a ON a.id = n.appliance_id
      WHERE ${clauses.join(" AND ")}
      ORDER BY n.created_at DESC
      LIMIT 100
    `,
    params,
  );

  return {
    columns: [
      { key: "title", label: "Title" },
      { key: "type", label: "Type" },
      { key: "severity", label: "Severity" },
      { key: "roomName", label: "Room" },
      { key: "applianceName", label: "Appliance" },
      { key: "createdAt", label: "Created At" },
    ],
    rows,
    summary: {
      totalViolations: rows.length,
      highSeverity: rows.filter((row) => row.severity === "DANGER").length,
    },
  };
}

async function getTrendReport(filters, user) {
  const roomIds = await resolveAccessibleRoomIds(user);
  const scope = buildScopedWhere(roomIds, filters);

  const rows = await query(
    `
      SELECT
        base.usage_date,
        ROUND(COALESCE(SUM(base.usage_kwh), 0), 3) AS usage_kwh,
        ROUND(COALESCE(SUM(base.cost_estimate), 0), 2) AS cost_estimate
      FROM (
        SELECT
          el.room_id,
          r.owner_user_id AS user_id,
          el.appliance_id,
          el.usage_date,
          el.usage_kwh,
          el.cost_estimate
        FROM energy_logs el
        INNER JOIN rooms r ON r.id = el.room_id
      ) base
      ${scope.clause}
      GROUP BY base.usage_date
      ORDER BY base.usage_date ASC
    `,
    scope.params,
  );

  return {
    columns: [
      { key: "usageDate", label: "Date" },
      { key: "usageKwh", label: "Usage (kWh)" },
      { key: "costEstimate", label: "Cost" },
    ],
    rows,
    summary: {
      points: rows.length,
      totalUsageKwh: rows.reduce((sum, row) => sum + Number(row.usageKwh || 0), 0),
    },
  };
}

async function buildReportPreview(reportType, filters, user) {
  switch (reportType) {
    case "ROOM_USAGE":
      return getRoomUsageReport(filters, user);
    case "APPLIANCE_USAGE":
      return getApplianceUsageReport(filters, user);
    case "AUTOMATION_HISTORY":
      return getAutomationHistoryReport(filters, user);
    case "THRESHOLD_VIOLATIONS":
      return getThresholdViolationsReport(filters, user);
    case "TREND":
      return getTrendReport(filters, user);
    case "COST_SUMMARY":
    case "ENERGY_SUMMARY":
      return getRoomUsageReport(filters, user);
    case "ACTIVE_VS_INACTIVE": {
      const roomIds = await resolveAccessibleRoomIds(user);
      const rows = await query(
        `
          SELECT
            CASE WHEN a.status IN ('ON', 'DIMMED') THEN 'ACTIVE' ELSE 'INACTIVE' END AS state_bucket,
            COUNT(*) AS device_count
          FROM appliances a
          INNER JOIN rooms r ON r.id = a.room_id
          ${roomIds === null ? "" : roomIds.length ? `WHERE r.id IN (${roomIds.map(() => "?").join(", ")})` : "WHERE 1 = 0"}
          GROUP BY state_bucket
          ORDER BY state_bucket ASC
        `,
        roomIds === null ? [] : roomIds,
      );

      return {
        columns: [
          { key: "stateBucket", label: "State" },
          { key: "deviceCount", label: "Devices" },
        ],
        rows,
        summary: {
          totalDevices: rows.reduce((sum, row) => sum + Number(row.deviceCount || 0), 0),
        },
      };
    }
    default:
      return getTrendReport(filters, user);
  }
}

function buildReportLines(preview) {
  return preview.rows.slice(0, 20).map((row) => preview.columns.map((column) => `${column.label}: ${row[column.key] ?? ""}`).join(" | "));
}

export async function listReports(user) {
  return listReportsForUser(user);
}

export async function generateReport(payload, user) {
  const preview = await buildReportPreview(payload.reportType, payload.filters || {}, user);
  const generated = await createReportWithExport({
    userId: user.id,
    reportType: payload.reportType,
    title: payload.title || `${payload.reportType} report`,
    filtersJson: payload.filters || null,
    format: payload.format || "CSV",
  });

  const downloadName = `${generated.report.title.toLowerCase().replace(/\s+/g, "-")}.${(payload.format || "CSV").toLowerCase()}`;
  const csvContent = buildCsv({ columns: preview.columns, rows: preview.rows });
  const pdfContent = buildSimplePdf({
    title: generated.report.title,
    lines: buildReportLines(preview),
  });

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Generated report ${generated.report.title}`,
    moduleName: "Reports",
    entityType: "report",
    entityId: generated.report.id,
  });

  return {
    ...generated,
    preview,
    download: {
      fileName: downloadName,
      mimeType: (payload.format || "CSV") === "PDF" ? "application/pdf" : "text/csv",
      content:
        (payload.format || "CSV") === "PDF"
          ? pdfContent
          : Buffer.from(csvContent, "utf8").toString("base64"),
      encoding: "base64",
    },
  };
}

export async function listReportExports(user) {
  return listReportExportRecords(user);
}
