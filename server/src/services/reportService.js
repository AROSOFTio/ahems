import { addActivityLog, createId, ensureStore } from "../utils/mockData.js";

export async function listReports(user) {
  const store = await ensureStore();
  return user.role === "admin"
    ? store.reports
    : store.reports.filter((report) => report.userId === user.id);
}

export async function generateReport(payload, user) {
  const store = await ensureStore();
  const report = {
    id: createId("rep"),
    userId: user.id,
    reportType: payload.reportType,
    title: payload.title || `${payload.reportType} report`,
    status: "READY",
    generatedAt: new Date().toISOString(),
  };

  store.reports.unshift(report);
  store.reportExports.unshift({
    id: createId("exp"),
    reportId: report.id,
    format: payload.format || "CSV",
    fileName: `${report.title.toLowerCase().replace(/\s+/g, "-")}.${(payload.format || "CSV").toLowerCase()}`,
    exportedAt: new Date().toISOString(),
  });

  addActivityLog(user.id, `Generated report ${report.title}`, "Reports");

  return {
    report,
    export: store.reportExports[0],
  };
}

export async function listReportExports() {
  const store = await ensureStore();
  return store.reportExports;
}

