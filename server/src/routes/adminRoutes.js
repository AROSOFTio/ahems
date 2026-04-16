import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/dashboard", asyncHandler(adminController.dashboard));
router.get("/users", asyncHandler(adminController.users));
router.get("/logs", asyncHandler(adminController.logs));
router.get("/analytics", asyncHandler(adminController.analytics));

export default router;

