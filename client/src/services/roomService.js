import { request } from "./http";

export const roomService = {
  list: (token) => request("/rooms", { token }),
  getById: (id, token) => request(`/rooms/${id}`, { token }),
  create: (payload, token) => request("/rooms", { method: "POST", body: payload, token }),
  update: (id, payload, token) => request(`/rooms/${id}`, { method: "PATCH", body: payload, token }),
  remove: (id, token) => request(`/rooms/${id}`, { method: "DELETE", token }),
};
