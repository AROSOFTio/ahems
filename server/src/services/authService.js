import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { createUser, findUserByEmail, findUserById, getPasswordResetStore, updateUser } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { addActivityLog, sanitizeUser } from "../utils/mockData.js";

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password.");
  }

  addActivityLog(user.id, "Signed into the platform", "Auth");

  return {
    user: sanitizeUser(user),
    token: signToken(user),
  };
}

export async function register({ name, email, password, role }) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    email,
    role,
    passwordHash,
  });

  return {
    user,
    token: signToken(user),
  };
}

export async function forgotPassword(email) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, "No account was found for this email address.");
  }

  const resetStore = getPasswordResetStore();
  const token = `reset_${randomUUID().replace(/-/g, "")}`;
  resetStore.push({
    id: randomUUID(),
    userId: user.id,
    email,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    usedAt: null,
    createdAt: new Date().toISOString(),
  });

  addActivityLog(user.id, "Requested password reset token", "Auth");

  return {
    message: "Reset token generated successfully for the simulation environment.",
    resetToken: token,
  };
}

export async function resetPassword({ token, password }) {
  const resetStore = getPasswordResetStore();
  const resetRecord = resetStore.find((item) => item.token === token);

  if (!resetRecord) {
    throw new ApiError(404, "Reset token was not found.");
  }

  if (resetRecord.usedAt) {
    throw new ApiError(400, "Reset token has already been used.");
  }

  if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
    throw new ApiError(400, "Reset token has expired.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await updateUser(resetRecord.userId, { passwordHash });
  resetRecord.usedAt = new Date().toISOString();

  addActivityLog(resetRecord.userId, "Completed password reset", "Auth");

  return {
    message: "Password reset completed successfully.",
  };
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User was not found.");
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValidPassword) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUser(user.id, { passwordHash });
  addActivityLog(user.id, "Changed account password", "Auth");

  return {
    message: "Password changed successfully.",
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User was not found.");
  }

  return {
    user: sanitizeUser(user),
  };
}

