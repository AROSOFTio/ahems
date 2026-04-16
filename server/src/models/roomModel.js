import { addActivityLog, createId, ensureStore } from "../utils/mockData.js";

export async function listRooms() {
  const store = await ensureStore();
  return store.rooms;
}

export async function findRoomById(id) {
  const store = await ensureStore();
  return store.rooms.find((room) => room.id === id) || null;
}

export async function createRoom(payload, actorId) {
  const store = await ensureStore();
  const room = {
    id: createId("room"),
    ...payload,
  };
  store.rooms.push(room);
  addActivityLog(actorId, `Created room ${payload.name}`, "Rooms");
  return room;
}

export async function updateRoom(id, updates, actorId) {
  const room = await findRoomById(id);
  if (!room) return null;
  Object.assign(room, updates);
  addActivityLog(actorId, `Updated room ${room.name}`, "Rooms");
  return room;
}

export async function deleteRoom(id, actorId) {
  const store = await ensureStore();
  const index = store.rooms.findIndex((room) => room.id === id);
  if (index === -1) return false;
  const [removed] = store.rooms.splice(index, 1);
  addActivityLog(actorId, `Deleted room ${removed.name}`, "Rooms");
  return true;
}

