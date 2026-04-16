import { addActivityLog, createId, ensureStore } from "../utils/mockData.js";
import { ApiError } from "../utils/ApiError.js";

function nudgeValue(value, min, max) {
  const next = value + (Math.random() * 2 - 1) * 2;
  return Math.max(min, Math.min(max, Number(next.toFixed(1))));
}

export async function getSimulationOverview(user) {
  const store = await ensureStore();
  const rooms =
    user.role === "admin"
      ? store.rooms
      : store.rooms.filter((room) => room.userId === user.id || room.id === "room_office");

  return {
    rooms,
    conditions: store.simulatedConditions,
    recentReadings: store.sensorReadings.slice(0, 12),
  };
}

export async function updateSimulatedConditions(payload, user) {
  const store = await ensureStore();
  const existing = store.simulatedConditions.find((item) => item.roomId === payload.roomId);

  if (existing) {
    Object.assign(existing, payload);
  } else {
    store.simulatedConditions.push({
      id: createId("sc"),
      ...payload,
    });
  }

  addActivityLog(user.id, `Updated simulated conditions for ${payload.roomId}`, "Sensors");
  return {
    conditions: store.simulatedConditions,
  };
}

export async function randomizeSimulation(roomId, user) {
  const store = await ensureStore();
  const room = store.rooms.find((item) => item.id === roomId);

  if (!room) {
    throw new ApiError(404, "Room not found.");
  }

  room.temperature = nudgeValue(room.temperature, 18, 30);
  room.lightLevel = nudgeValue(room.lightLevel, 20, 100);
  room.occupancyState = room.occupancyState === "OCCUPIED" ? "VACANT" : "OCCUPIED";

  store.sensorReadings.unshift(
    { id: createId("sr"), roomId, type: "TEMPERATURE", value: room.temperature, unit: "C", recordedAt: new Date().toISOString() },
    { id: createId("sr"), roomId, type: "LIGHT", value: room.lightLevel, unit: "%", recordedAt: new Date().toISOString() },
    { id: createId("sr"), roomId, type: "OCCUPANCY", value: room.occupancyState === "OCCUPIED" ? 1 : 0, unit: "BOOLEAN", recordedAt: new Date().toISOString() },
  );

  addActivityLog(user.id, `Randomized simulation values for ${room.name}`, "Sensors");

  return {
    room,
    sensorReadings: store.sensorReadings.slice(0, 12),
  };
}

export async function runAutomatedSimulationTick() {
  const store = await ensureStore();

  store.rooms.forEach((room) => {
    room.temperature = nudgeValue(room.temperature, 18, 29);
    room.lightLevel = nudgeValue(room.lightLevel, 15, 100);
  });

  store.sensorReadings.unshift(
    ...store.rooms.map((room) => ({
      id: createId("sr"),
      roomId: room.id,
      type: "TEMPERATURE",
      value: room.temperature,
      unit: "C",
      recordedAt: new Date().toISOString(),
    })),
  );

  return store.sensorReadings.slice(0, 12);
}
