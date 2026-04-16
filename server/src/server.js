import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { startSimulationScheduler } from "./jobs/simulationScheduler.js";
import { ensureDatabaseBootstrapData } from "./services/bootstrapService.js";

let schedulerHandle = null;

async function initializePlatform() {
  try {
    await ensureDatabaseBootstrapData();
  } catch (error) {
    logger.warn("Platform bootstrap completed with warnings.", {
      message: error.message,
    });
  } finally {
    if (!schedulerHandle) {
      schedulerHandle = startSimulationScheduler();
    }
  }
}

app.listen(env.port, () => {
  logger.info(`AHEMS API listening on port ${env.port}`);
  void initializePlatform();
});
