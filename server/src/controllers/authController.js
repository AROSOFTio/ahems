import * as authService from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

export async function register(req, res) {
  const result = await authService.register(req.body);
  return sendSuccess(res, result, "Account created successfully.", 201);
}

export async function login(req, res) {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, "Signed in successfully.");
}

export async function forgotPassword(req, res) {
  const result = await authService.forgotPassword(req.body.email);
  return sendSuccess(res, result, "Reset token generated.");
}

export async function resetPassword(req, res) {
  const result = await authService.resetPassword(req.body);
  return sendSuccess(res, result, "Password reset completed.");
}

export async function changePassword(req, res) {
  const result = await authService.changePassword(req.user.id, req.body);
  return sendSuccess(res, result, "Password changed successfully.");
}

export async function me(req, res) {
  const result = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, result, "Profile retrieved successfully.");
}

