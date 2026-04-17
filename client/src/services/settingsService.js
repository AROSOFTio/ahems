import { request } from "./http";

export const settingsService = {
  get: (token) => request("/settings", { token }),
  update: (payload, token) => request("/settings", { method: "PUT", body: payload, token }),
};
