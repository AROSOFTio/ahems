import { request } from "./http";

export const catalogService = {
  getCatalog: (token) => request("/catalog", { token }),
  createRoomType: (payload, token) => request("/catalog/room-types", { method: "POST", body: payload, token }),
  updateRoomType: (id, payload, token) =>
    request(`/catalog/room-types/${id}`, { method: "PATCH", body: payload, token }),
  deleteRoomType: (id, token) => request(`/catalog/room-types/${id}`, { method: "DELETE", token }),
  createApplianceCategory: (payload, token) =>
    request("/catalog/appliance-categories", { method: "POST", body: payload, token }),
  updateApplianceCategory: (id, payload, token) =>
    request(`/catalog/appliance-categories/${id}`, { method: "PATCH", body: payload, token }),
  deleteApplianceCategory: (id, token) =>
    request(`/catalog/appliance-categories/${id}`, { method: "DELETE", token }),
};
