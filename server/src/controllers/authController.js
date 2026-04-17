import * as authService from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

export async function login(req, res) {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, "Signed in successfully.");
}

export async function me(req, res) {
  const result = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, result, "Profile retrieved successfully.");
}
