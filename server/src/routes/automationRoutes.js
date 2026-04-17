import { Router } from "express";
import * as automationController from "../controllers/automationController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { validateAutomationPartialPayload, validateAutomationPayload } from "../validators/automationValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(automationController.list));
router.get("/history", asyncHandler(automationController.history));
router.get("/:id", asyncHandler(automationController.show));
router.post("/", authorize("admin", "resident"), validate(validateAutomationPayload), asyncHandler(automationController.create));
router.patch("/:id", authorize("admin", "resident"), validate(validateAutomationPartialPayload), asyncHandler(automationController.update));
router.post("/:id/enable", authorize("admin", "resident"), asyncHandler(automationController.enable));
router.post("/:id/disable", authorize("admin", "resident"), asyncHandler(automationController.disable));
router.delete("/:id", authorize("admin", "resident"), asyncHandler(automationController.destroy));

export default router;
