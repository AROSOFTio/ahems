import { ensureStore } from "../utils/mockData.js";

export async function getDashboardAnalytics() {
  const store = await ensureStore();
  const averageTemperature =
    store.rooms.reduce((sum, room) => sum + room.temperature, 0) / store.rooms.length;
  const averageLightLevel =
    store.rooms.reduce((sum, room) => sum + room.lightLevel, 0) / store.rooms.length;
  const estimatedEnergyUsage = store.energyLogs.reduce((sum, log) => sum + log.usageKwh, 0);
  const estimatedCost = store.energyLogs.reduce((sum, log) => sum + log.costEstimate, 0);

  return {
    totalRooms: store.rooms.length,
    totalDevices: store.appliances.length,
    activeDevices: store.appliances.filter((item) => item.status === "ON" || item.status === "DIMMED").length,
    autoModeDevices: store.appliances.filter((item) => item.mode === "AUTO").length,
    averageTemperature: Number(averageTemperature.toFixed(1)),
    averageLightLevel: Number(averageLightLevel.toFixed(1)),
    occupancySummary: {
      occupied: store.rooms.filter((room) => room.occupancyState === "OCCUPIED").length,
      vacant: store.rooms.filter((room) => room.occupancyState !== "OCCUPIED").length,
    },
    estimatedEnergyUsage,
    estimatedCost,
    recentAlerts: store.notifications.slice(0, 5),
    recentAutomationActions: store.activityLogs.filter((item) => item.module === "Automation").slice(0, 5),
  };
}

export async function getEnergyAnalytics() {
  const store = await ensureStore();
  return {
    usageByAppliance: store.appliances.map((item) => ({
      applianceId: item.id,
      name: item.name,
      usageKwh: item.usageKwh,
      costEstimate: item.costEstimate,
    })),
    usageByRoom: store.rooms.map((room) => ({
      roomId: room.id,
      name: room.name,
      usageKwh: store.energyLogs
        .filter((log) => log.roomId === room.id)
        .reduce((sum, log) => sum + log.usageKwh, 0),
    })),
    tariff: store.tariffSettings.find((item) => item.isActive),
  };
}

export async function getOccupancyAnalytics() {
  const store = await ensureStore();
  return store.rooms.map((room) => ({
    roomId: room.id,
    name: room.name,
    occupancyState: room.occupancyState,
    lightLevel: room.lightLevel,
    temperature: room.temperature,
  }));
}

