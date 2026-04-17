import { Router } from "express";
import * as applianceController from "../controllers/applianceController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/",    asyncHandler(applianceController.list));
router.get("/:id", asyncHandler(applianceController.show));
router.patch("/:id", asyncHandler(applianceController.update));

export default router;
