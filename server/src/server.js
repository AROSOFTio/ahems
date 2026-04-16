import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { ensureStore } from "./utils/mockData.js";
import { startSimulationScheduler } from "./jobs/simulationScheduler.js";

async function bootstrap() {
  await ensureStore();
  startSimulationScheduler();

  app.listen(env.port, () => {
    logger.info(`AHEMS API listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to start the AHEMS API.", { message: error.message });
  process.exit(1);
});

