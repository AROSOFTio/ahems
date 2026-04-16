import { Router } from "express";
import * as analyticsController from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/dashboard", asyncHandler(analyticsController.dashboard));
router.get("/energy", asyncHandler(analyticsController.energy));
router.get("/occupancy", asyncHandler(analyticsController.occupancy));

export default router;

