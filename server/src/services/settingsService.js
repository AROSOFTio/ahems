import { addActivityLog, ensureStore } from "../utils/mockData.js";

export async function getSettings() {
  const store = await ensureStore();
  return {
    tariffs: store.tariffSettings,
    defaults: {
      maxTemperature: 25,
      minLightLevel: 45,
      notifications: ["in-app", "email"],
      reportFormat: "CSV",
    },
  };
}

export async function updateSettings(payload, user) {
  const store = await ensureStore();
  const activeTariff = store.tariffSettings.find((item) => item.isActive);
  if (payload.ratePerKwh && activeTariff) {
    activeTariff.ratePerKwh = payload.ratePerKwh;
  }
  addActivityLog(user.id, "Updated system settings", "Settings");
  return getSettings();
}

