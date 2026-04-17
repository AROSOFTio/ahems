import { updateAppliance } from "../models/applianceModel.js";

export function resolveCommandAction(payload = {}) {
  const text = String(payload.commandText || "").toLowerCase();
  const explicitAction = payload.action || payload.executedAction || payload.actionType;

  if (explicitAction) {
    return explicitAction;
  }

  if (text.includes("restore")) return "RESTORE_BRIGHTNESS";
  if (text.includes("turn off") || text.includes("switch off")) return "TURN_OFF";
  if (text.includes("standby")) return "SET_STANDBY";
  if (text.includes("auto")) return "SET_MODE_AUTO";
  if (text.includes("manual")) return "SET_MODE_MANUAL";
  if (text.includes("dim") || payload.brightnessLevel !== undefined) return "DIM";
  if (text.includes("turn on") || text.includes("switch on")) return "TURN_ON";

  return "TURN_ON";
}

export function extractBrightnessLevel(payload = {}) {
  if (payload.brightnessLevel !== undefined) {
    return Math.max(0, Math.min(100, Number(payload.brightnessLevel)));
  }

  if (payload.actionValue !== undefined) {
    return Math.max(0, Math.min(100, Number(payload.actionValue)));
  }

  const match = String(payload.commandText || "").match(/(\d{1,3})/);
  if (!match) {
    return null;
  }

  return Math.max(0, Math.min(100, Number(match[1])));
}

export async function applyActionToAppliance(appliance, payload = {}) {
  const action = resolveCommandAction(payload);
  const brightnessLevel = extractBrightnessLevel(payload);

  switch (action) {
    case "TURN_OFF":
      return updateAppliance(appliance.id, {
        status: "OFF",
        brightnessLevel: 0,
      });
    case "SET_STANDBY":
      return updateAppliance(appliance.id, {
        status: "STANDBY",
        brightnessLevel: 0,
      });
    case "SET_MODE_AUTO":
      return updateAppliance(appliance.id, {
        mode: "AUTO",
        status: appliance.status === "OFF" ? "ON" : appliance.status,
      });
    case "SET_MODE_MANUAL":
      return updateAppliance(appliance.id, {
        mode: "MANUAL",
      });
    case "RESTORE_BRIGHTNESS":
      return updateAppliance(appliance.id, {
        status: "ON",
        brightnessLevel: 100,
      });
    case "DIM":
      return updateAppliance(appliance.id, {
        status: "DIMMED",
        brightnessLevel: brightnessLevel ?? 45,
      });
    case "TURN_ON":
    default:
      return updateAppliance(appliance.id, {
        status: "ON",
        brightnessLevel: brightnessLevel ?? Math.max(appliance.brightnessLevel || 0, 65),
      });
  }
}
