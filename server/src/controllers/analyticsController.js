import * as analyticsService from "../services/analyticsService.js";
import { sendSuccess } from "../utils/response.js";

export async function dashboard(_req, res) {
  const data = await analyticsService.getDashboardAnalytics();
  return sendSuccess(res, data, "Dashboard analytics retrieved successfully.");
}

export async function energy(_req, res) {
  const data = await analyticsService.getEnergyAnalytics();
  return sendSuccess(res, data, "Energy analytics retrieved successfully.");
}

export async function occupancy(_req, res) {
  const data = await analyticsService.getOccupancyAnalytics();
  return sendSuccess(res, data, "Occupancy analytics retrieved successfully.");
}

