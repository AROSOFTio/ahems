import { queryOne } from "../config/db.js";
import { countUsers, listUsers } from "../models/userModel.js";
import { countReports } from "../models/reportModel.js";
import { countActivityLogs, listActivityLogs } from "../models/activityLogModel.js";
import { countUnreadNotifications } from "../models/notificationModel.js";
import { countRooms } from "../models/roomModel.js";
import { countAppliances } from "../models/applianceModel.js";
import { countAutomationRules } from "../models/automationRuleModel.js";
import { getDashboardAnalytics, getEnergyAnalytics } from "./analyticsService.js";
import { getActiveTariffSetting, listTariffSettings } from "../models/settingsModel.js";

export async function getAdminDashboardSummary() {
  const [dashboard, energy, totalUsers, totalReports, totalLogs] = await Promise.all([
    getDashboardAnalytics(),
    getEnergyAnalytics(),
    countUsers(),
    countReports(),
    countActivityLogs(),
  ]);

  return {
    ...dashboard,
    energy,
    totalUsers,
    totalReports,
    totalLogs,
  };
}

export async function getAdminUsersOverview() {
  return listUsers();
}

export async function getAdminLogs() {
  return listActivityLogs(200);
}

export async function getSystemAnalytics() {
  const [
    totalRooms,
    totalAppliances,
    totalAutomationRules,
    unreadNotifications,
    pendingExportsRow,
    activeTariff,
    tariffs,
  ] = await Promise.all([
    countRooms(),
    countAppliances(),
    countAutomationRules(),
    countUnreadNotifications(),
    queryOne("SELECT COUNT(*) AS total_exports FROM report_exports"),
    getActiveTariffSetting(),
    listTariffSettings(),
  ]);

  return {
    totalRooms,
    totalAppliances,
    totalAutomationRules,
    unreadNotifications,
    pendingExports: pendingExportsRow?.totalExports ?? 0,
    activeTariff,
    tariffs,
  };
}
