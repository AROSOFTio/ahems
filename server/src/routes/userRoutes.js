import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize("admin"), asyncHandler(userController.list));
router.get("/:id", authorize("admin"), asyncHandler(userController.show));
router.patch("/profile", asyncHandler(userController.updateProfile));

export default router;

