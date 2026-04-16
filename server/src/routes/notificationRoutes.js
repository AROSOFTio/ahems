import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(notificationController.list));
router.patch("/:id/read", asyncHandler(notificationController.markRead));
router.post("/", authorize("admin"), asyncHandler(notificationController.create));

export default router;

