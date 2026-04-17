import { request } from "./http";

export const analyticsService = {
  getDashboard: (token) => request("/analytics/dashboard", { token }),
  getEnergy: (token) => request("/analytics/energy", { token }),
  getOccupancy: (token) => request("/analytics/occupancy", { token }),
  getAdminDashboard: (token) => request("/admin/dashboard", { token }),
  getAdminUsers: (token) => request("/admin/users", { token }),
  getAdminLogs: (token, filters = {}) => {
    const search = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    );
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request(`/admin/logs${suffix}`, { token });
  },
  getAdminAnalytics: (token) => request("/admin/analytics", { token }),
};
