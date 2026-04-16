import * as analyticsService from "../services/analyticsService.js";
import { sendSuccess } from "../utils/response.js";

export async function dashboard(req, res) {
  const data = await analyticsService.getDashboardAnalytics(req.user);
  return sendSuccess(res, data, "Dashboard analytics retrieved successfully.");
}

export async function energy(req, res) {
  const data = await analyticsService.getEnergyAnalytics(req.user);
  return sendSuccess(res, data, "Energy analytics retrieved successfully.");
}

export async function occupancy(req, res) {
  const data = await analyticsService.getOccupancyAnalytics(req.user);
  return sendSuccess(res, data, "Occupancy analytics retrieved successfully.");
}
