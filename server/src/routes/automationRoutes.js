import { Router } from "express";
import * as automationController from "../controllers/automationController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(automationController.list));
router.post("/:id/enable",  asyncHandler(automationController.enable));
router.post("/:id/disable", asyncHandler(automationController.disable));

export default router;
