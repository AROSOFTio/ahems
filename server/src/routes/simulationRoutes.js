import { Router } from "express";
import * as simulationController from "../controllers/simulationController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  validateSimulationCommand,
  validateSimulationConditions,
  validateSimulationRandomize,
} from "../validators/simulationValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(simulationController.overview));
router.post("/conditions", validate(validateSimulationConditions), asyncHandler(simulationController.updateConditions));
router.post("/randomize", validate(validateSimulationRandomize), asyncHandler(simulationController.randomize));
router.post("/commands", validate(validateSimulationCommand), asyncHandler(simulationController.command));

export default router;
