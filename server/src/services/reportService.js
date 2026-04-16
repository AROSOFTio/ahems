import { createActivityLog } from "../models/activityLogModel.js";
import {
  createReportWithExport,
  listReportExports as listReportExportRecords,
  listReportsForUser,
} from "../models/reportModel.js";

export async function listReports(user) {
  return listReportsForUser(user);
}

export async function generateReport(payload, user) {
  const generated = await createReportWithExport({
    userId: user.id,
    reportType: payload.reportType,
    title: payload.title || `${payload.reportType} report`,
    filtersJson: payload.filters || null,
    format: payload.format || "CSV",
  });

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: `Generated report ${generated.report.title}`,
    moduleName: "Reports",
    entityType: "report",
    entityId: generated.report.id,
  });

  return generated;
}

export async function listReportExports(user) {
  return listReportExportRecords(user);
}
