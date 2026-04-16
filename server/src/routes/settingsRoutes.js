import { Router } from "express";
import * as settingsController from "../controllers/settingsController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { validateSettingsUpdate } from "../validators/settingsValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(settingsController.show));
router.put("/", authorize("admin", "resident"), validate(validateSettingsUpdate), asyncHandler(settingsController.update));

export default router;

