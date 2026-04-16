import * as reportService from "../services/reportService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await reportService.listReports(req.user);
  return sendSuccess(res, data, "Reports retrieved successfully.");
}

export async function generate(req, res) {
  const data = await reportService.generateReport(req.body, req.user);
  return sendSuccess(res, data, "Report generated successfully.", 201);
}

export async function exportsList(req, res) {
  const data = await reportService.listReportExports(req.user);
  return sendSuccess(res, data, "Report exports retrieved successfully.");
}
