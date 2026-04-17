import { request } from "./http";

export const simulationService = {
  getOverview: (token) => request("/simulations", { token }),
  updateConditions: (payload, token) =>
    request("/simulations/conditions", { method: "POST", body: payload, token }),
  randomize: (payload, token) => request("/simulations/randomize", { method: "POST", body: payload, token }),
  executeCommand: (payload, token) =>
    request("/simulations/commands", { method: "POST", body: payload, token }),
};
