import { findUserById, listUsers, updateUser } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { sanitizeUser } from "../utils/mockData.js";

export async function listPlatformUsers() {
  return listUsers();
}

export async function getUserById(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return sanitizeUser(user);
}

export async function updateProfile(userId, payload) {
  const user = await updateUser(userId, {
    name: payload.name,
    phone: payload.phone,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return {
    user,
  };
}

