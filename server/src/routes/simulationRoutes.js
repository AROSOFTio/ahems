import { Router } from "express";
import * as simulationController from "../controllers/simulationController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(simulationController.overview));
router.post("/conditions", asyncHandler(simulationController.updateConditions));
router.post("/randomize", asyncHandler(simulationController.randomize));

export default router;

