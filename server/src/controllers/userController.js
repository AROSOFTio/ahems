import * as userService from "../services/userService.js";
import { sendSuccess } from "../utils/response.js";

export async function list(req, res) {
  const data = await userService.listPlatformUsers();
  return sendSuccess(res, data, "Users retrieved successfully.");
}

export async function show(req, res) {
  const data = await userService.getUserById(req.params.id);
  return sendSuccess(res, data, "User retrieved successfully.");
}

export async function updateProfile(req, res) {
  const data = await userService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, data, "Profile updated successfully.");
}

