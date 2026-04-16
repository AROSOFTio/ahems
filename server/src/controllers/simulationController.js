import * as simulationService from "../services/simulationService.js";
import { sendSuccess } from "../utils/response.js";

export async function overview(req, res) {
  const data = await simulationService.getSimulationOverview(req.user);
  return sendSuccess(res, data, "Simulation overview retrieved successfully.");
}

export async function updateConditions(req, res) {
  const data = await simulationService.updateSimulatedConditions(req.body, req.user);
  return sendSuccess(res, data, "Simulated conditions updated successfully.");
}

export async function randomize(req, res) {
  const data = await simulationService.randomizeSimulation(req.body.roomId, req.user);
  return sendSuccess(res, data, "Simulation values randomized successfully.");
}

