import { request } from "./http";

export const applianceService = {
  list: (token) => request("/appliances", { token }),
  getById: (id, token) => request(`/appliances/${id}`, { token }),
  create: (payload, token) => request("/appliances", { method: "POST", body: payload, token }),
  update: (id, payload, token) => request(`/appliances/${id}`, { method: "PATCH", body: payload, token }),
  remove: (id, token) => request(`/appliances/${id}`, { method: "DELETE", token }),
};
