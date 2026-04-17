import * as adminService from "../services/adminService.js";
import { sendSuccess } from "../utils/response.js";

export async function dashboard(_req, res) {
  const data = await adminService.getAdminDashboardSummary();
  return sendSuccess(res, data, "Admin dashboard summary retrieved successfully.");
}

export async function users(_req, res) {
  const data = await adminService.getAdminUsersOverview();
  return sendSuccess(res, data, "Admin users overview retrieved successfully.");
}

export async function logs(req, res) {
  const data = await adminService.getAdminLogs(req.query);
  return sendSuccess(res, data, "Admin logs retrieved successfully.");
}

export async function analytics(_req, res) {
  const data = await adminService.getSystemAnalytics();
  return sendSuccess(res, data, "System analytics retrieved successfully.");
}
