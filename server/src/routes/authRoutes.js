import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { validateLogin } from "../validators/authValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", validate(validateLogin), asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
