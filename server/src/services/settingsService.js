import { createActivityLog } from "../models/activityLogModel.js";
import {
  getActiveTariffSetting,
  listSystemSettings,
  listTariffSettings,
  updateTariffSetting,
  upsertSystemSetting,
} from "../models/settingsModel.js";

function parseSettingValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function getSettings() {
  const [tariffs, activeTariff, rawSystemSettings] = await Promise.all([
    listTariffSettings(),
    getActiveTariffSetting(),
    listSystemSettings(),
  ]);

  const defaults = Object.fromEntries(
    rawSystemSettings.map((item) => [item.settingKey, parseSettingValue(item.settingValue)]),
  );

  return {
    tariffs,
    activeTariff,
    defaults,
  };
}

export async function updateSettings(payload, user) {
  if (payload.tariff && typeof payload.tariff === "object") {
    const activeTariff = await getActiveTariffSetting();
    if (activeTariff) {
      await updateTariffSetting(activeTariff.id, payload.tariff);
    }
  }

  if (payload.defaults && typeof payload.defaults === "object") {
    const updates = Object.entries(payload.defaults);

    await Promise.all(
      updates.map(([key, value]) =>
        upsertSystemSetting({
          key,
          value,
          description: `System default for ${key}`,
          updatedBy: user.id,
        }),
      ),
    );
  }

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: "Updated system settings",
    moduleName: "Settings",
    entityType: "system_setting",
  });

  return getSettings();
}
