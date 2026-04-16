import { logger } from "../config/logger.js";
import { runAutomatedSimulationTick } from "../services/simulationService.js";

export function startSimulationScheduler() {
  const interval = setInterval(async () => {
    try {
      await runAutomatedSimulationTick();
      logger.info("Simulation scheduler tick completed.");
    } catch (error) {
      logger.warn("Simulation scheduler tick failed.", { message: error.message });
    }
  }, 10 * 60 * 1000);

  logger.info("Simulation scheduler started.");

  return {
    stop() {
      clearInterval(interval);
      logger.info("Simulation scheduler stopped.");
    },
  };
}

