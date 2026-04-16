import { Router } from "express";
import * as applianceController from "../controllers/applianceController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { validateAppliancePayload } from "../validators/applianceValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(applianceController.list));
router.get("/:id", asyncHandler(applianceController.show));
router.post("/", authorize("admin", "resident"), validate(validateAppliancePayload), asyncHandler(applianceController.create));
router.patch("/:id", authorize("admin", "resident", "operator"), asyncHandler(applianceController.update));
router.delete("/:id", authorize("admin", "resident"), asyncHandler(applianceController.destroy));

export default router;

