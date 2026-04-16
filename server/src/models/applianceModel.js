import { addActivityLog, createId, ensureStore } from "../utils/mockData.js";

export async function listAppliances() {
  const store = await ensureStore();
  return store.appliances;
}

export async function findApplianceById(id) {
  const store = await ensureStore();
  return store.appliances.find((appliance) => appliance.id === id) || null;
}

export async function createAppliance(payload, actorId) {
  const store = await ensureStore();
  const appliance = {
    id: createId("app"),
    ...payload,
  };
  store.appliances.push(appliance);
  addActivityLog(actorId, `Created appliance ${payload.name}`, "Appliances");
  return appliance;
}

export async function updateAppliance(id, updates, actorId) {
  const appliance = await findApplianceById(id);
  if (!appliance) return null;
  Object.assign(appliance, updates);
  addActivityLog(actorId, `Updated appliance ${appliance.name}`, "Appliances");
  return appliance;
}

export async function deleteAppliance(id, actorId) {
  const store = await ensureStore();
  const index = store.appliances.findIndex((appliance) => appliance.id === id);
  if (index === -1) return false;
  const [removed] = store.appliances.splice(index, 1);
  addActivityLog(actorId, `Deleted appliance ${removed.name}`, "Appliances");
  return true;
}

