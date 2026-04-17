import { request } from "./http";

export const automationService = {
  list: (token) => request("/automation-rules", { token }),
  history: (token) => request("/automation-rules/history", { token }),
  create: (payload, token) => request("/automation-rules", { method: "POST", body: payload, token }),
  update: (id, payload, token) => request(`/automation-rules/${id}`, { method: "PATCH", body: payload, token }),
  remove: (id, token) => request(`/automation-rules/${id}`, { method: "DELETE", token }),
  enable: (id, token) => request(`/automation-rules/${id}/enable`, { method: "POST", token }),
  disable: (id, token) => request(`/automation-rules/${id}/disable`, { method: "POST", token }),
};
