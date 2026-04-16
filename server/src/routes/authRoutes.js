import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  validateChangePassword,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from "../validators/authValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", validate(validateRegister), asyncHandler(authController.register));
router.post("/login", validate(validateLogin), asyncHandler(authController.login));
router.post("/forgot-password", validate(validateForgotPassword), asyncHandler(authController.forgotPassword));
router.post("/reset-password", validate(validateResetPassword), asyncHandler(authController.resetPassword));
router.post("/change-password", authenticate, validate(validateChangePassword), asyncHandler(authController.changePassword));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;

