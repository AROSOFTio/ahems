import { getDashboardAnalytics, getEnergyAnalytics } from "./analyticsService.js";
import { ensureStore } from "../utils/mockData.js";

export async function getAdminDashboardSummary() {
  const dashboard = await getDashboardAnalytics();
  const energy = await getEnergyAnalytics();
  const store = await ensureStore();

  return {
    ...dashboard,
    energy,
    totalUsers: store.users.length,
    totalReports: store.reports.length,
    totalLogs: store.activityLogs.length,
  };
}

export async function getAdminUsersOverview() {
  const store = await ensureStore();
  return store.users.map(({ passwordHash, ...user }) => user);
}

export async function getAdminLogs() {
  const store = await ensureStore();
  return store.activityLogs;
}

export async function getSystemAnalytics() {
  const store = await ensureStore();
  return {
    categories: store.categories,
    tariffs: store.tariffSettings,
    unreadNotifications: store.notifications.filter((item) => !item.isRead).length,
    pendingExports: store.reportExports.length,
  };
}

