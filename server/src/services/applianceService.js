import {
  listAppliances,
  findApplianceById,
  updateAppliance,
} from "../models/applianceModel.js";
import { ApiError } from "../utils/ApiError.js";

export async function getAppliances() {
  return listAppliances();
}

export async function getApplianceById(id) {
  const appliance = await findApplianceById(id);
  if (!appliance) throw new ApiError(404, "Appliance not found.");
  return appliance;
}

export async function updateApplianceRecord(id, payload) {
  const appliance = await findApplianceById(id);
  if (!appliance) throw new ApiError(404, "Appliance not found.");
  return updateAppliance(id, payload);
}
