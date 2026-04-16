import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const baseUsers = [
  {
    id: "usr_admin",
    name: "Amina Kato",
    email: "admin@ahems.io",
    role: "admin",
    password: "Admin@12345",
    phone: "+256700000001",
    status: "active",
  },
  {
    id: "usr_resident",
    name: "Jonah Okello",
    email: "resident@ahems.io",
    role: "resident",
    password: "Resident@12345",
    phone: "+256700000002",
    status: "active",
  },
  {
    id: "usr_operator",
    name: "Grace Namutebi",
    email: "operator@ahems.io",
    role: "operator",
    password: "Operator@12345",
    phone: "+256700000003",
    status: "active",
  },
];

const state = {
  initialized: false,
  roles: [
    { id: "role_admin", name: "admin" },
    { id: "role_resident", name: "resident" },
    { id: "role_operator", name: "operator" },
  ],
  users: [],
  roomTypes: [
    { id: "rt_living", name: "Living Room" },
    { id: "rt_kitchen", name: "Kitchen" },
    { id: "rt_bedroom", name: "Bedroom" },
    { id: "rt_office", name: "Office" },
  ],
  rooms: [
    { id: "room_living", userId: "usr_resident", name: "Living Room", roomType: "Living Room", occupancyState: "OCCUPIED", temperature: 24, lightLevel: 82, thresholds: { maxTemp: 26, minLight: 40 } },
    { id: "room_kitchen", userId: "usr_resident", name: "Kitchen", roomType: "Kitchen", occupancyState: "VACANT", temperature: 22, lightLevel: 74, thresholds: { maxTemp: 25, minLight: 50 } },
    { id: "room_office", userId: "usr_operator", name: "Home Office", roomType: "Office", occupancyState: "OCCUPIED", temperature: 21, lightLevel: 68, thresholds: { maxTemp: 24, minLight: 60 } },
  ],
  categories: [
    { id: "cat_light", name: "Lighting", icon: "Lightbulb" },
    { id: "cat_climate", name: "Climate", icon: "Wind" },
    { id: "cat_media", name: "Media", icon: "Tv" },
  ],
  appliances: [
    { id: "app_panel", roomId: "room_living", categoryId: "cat_light", name: "Ceiling Panel", powerRatingWatts: 48, status: "DIMMED", mode: "AUTO", brightnessLevel: 45, runtimeHours: 5.8, usageKwh: 1.84, costEstimate: 8.6 },
    { id: "app_fan", roomId: "room_living", categoryId: "cat_climate", name: "Smart Fan", powerRatingWatts: 72, status: "STANDBY", mode: "AUTO", brightnessLevel: 0, runtimeHours: 4.2, usageKwh: 0.96, costEstimate: 4.1 },
    { id: "app_strip", roomId: "room_office", categoryId: "cat_light", name: "Desk Strip", powerRatingWatts: 32, status: "ON", mode: "MANUAL", brightnessLevel: 100, runtimeHours: 7.1, usageKwh: 2.14, costEstimate: 10.4 },
  ],
  sensorReadings: [
    { id: "sr_1", roomId: "room_living", type: "TEMPERATURE", value: 24, unit: "C", recordedAt: new Date().toISOString() },
    { id: "sr_2", roomId: "room_living", type: "LIGHT", value: 82, unit: "%", recordedAt: new Date().toISOString() },
    { id: "sr_3", roomId: "room_office", type: "OCCUPANCY", value: 1, unit: "BOOLEAN", recordedAt: new Date().toISOString() },
  ],
  simulatedConditions: [
    { id: "sc_1", roomId: "room_living", timeOfDay: "EVENING", randomizationEnabled: false, targetTemperature: 24, targetLightIntensity: 70, targetOccupancy: "OCCUPIED" },
    { id: "sc_2", roomId: "room_office", timeOfDay: "MORNING", randomizationEnabled: true, targetTemperature: 21, targetLightIntensity: 68, targetOccupancy: "OCCUPIED" },
  ],
  automationRules: [
    { id: "rule_evening", userId: "usr_resident", roomId: "room_living", applianceId: "app_panel", name: "Evening ambience", isEnabled: true, priority: 2, scope: "ROOM" },
    { id: "rule_temp", userId: "usr_admin", roomId: "room_living", applianceId: "app_fan", name: "High temperature safeguard", isEnabled: true, priority: 1, scope: "DEVICE" },
  ],
  automationConditions: [
    { id: "cond_1", ruleId: "rule_evening", metric: "TIME_OF_DAY", operator: "EQ", comparisonValue: "EVENING" },
    { id: "cond_2", ruleId: "rule_temp", metric: "TEMPERATURE", operator: "GT", comparisonValue: "25" },
  ],
  automationActions: [
    { id: "act_1", ruleId: "rule_evening", actionType: "DIM", actionValue: "58" },
    { id: "act_2", ruleId: "rule_temp", actionType: "TURN_ON", actionValue: "fan" },
  ],
  notifications: [
    { id: "not_1", userId: "usr_resident", type: "IDLE_ROOM_ACTIVE_DEVICE", title: "Idle room with active lighting", message: "Kitchen occupancy dropped to zero while lighting remained active.", severity: "WARNING", isRead: false, createdAt: new Date().toISOString() },
    { id: "not_2", userId: "usr_admin", type: "MONTHLY_TARGET_EXCEEDED", title: "Projected monthly target crossed", message: "Home office plug cluster is trending 8% above the configured budget baseline.", severity: "DANGER", isRead: false, createdAt: new Date().toISOString() },
  ],
  energyLogs: [
    { id: "eng_1", roomId: "room_living", applianceId: "app_panel", usageDate: "2026-04-16", usageKwh: 1.84, costEstimate: 8.6, runtimeMinutes: 348 },
    { id: "eng_2", roomId: "room_office", applianceId: "app_strip", usageDate: "2026-04-16", usageKwh: 2.14, costEstimate: 10.4, runtimeMinutes: 426 },
  ],
  tariffSettings: [
    { id: "tariff_1", name: "Standard residential", ratePerKwh: 0.42, peakRatePerKwh: 0.48, offPeakRatePerKwh: 0.34, currency: "USD", isActive: true },
  ],
  reports: [
    { id: "rep_1", userId: "usr_admin", reportType: "ENERGY_SUMMARY", title: "Weekly energy summary", status: "READY", generatedAt: new Date().toISOString() },
  ],
  reportExports: [
    { id: "exp_1", reportId: "rep_1", format: "CSV", fileName: "weekly-energy-summary.csv", exportedAt: new Date().toISOString() },
  ],
  activityLogs: [
    { id: "log_1", userId: "usr_admin", action: "Updated high-temp fallback rule", module: "Automation", createdAt: "2026-04-16T09:10:00.000Z" },
    { id: "log_2", userId: "usr_resident", action: "Adjusted office lighting threshold", module: "Rooms", createdAt: "2026-04-16T08:34:00.000Z" },
    { id: "log_3", userId: "usr_operator", action: "Applied occupancy simulation override", module: "Sensors", createdAt: "2026-04-16T08:11:00.000Z" },
  ],
  deviceCommands: [
    { id: "cmd_1", userId: "usr_resident", roomId: "room_office", applianceId: "app_strip", source: "VOICE", commandText: "Set office lights to focus mode", status: "SUCCESS", executedAt: new Date().toISOString() },
  ],
  passwordResets: [],
};

export async function ensureStore() {
  if (state.initialized) {
    return state;
  }

  state.users = await Promise.all(
    baseUsers.map(async (user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      passwordHash: await bcrypt.hash(user.password, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  );

  state.initialized = true;
  return state;
}

export function createId(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function addActivityLog(userId, action, module) {
  state.activityLogs.unshift({
    id: createId("log"),
    userId,
    action,
    module,
    createdAt: new Date().toISOString(),
  });
}

export function getState() {
  return state;
}

