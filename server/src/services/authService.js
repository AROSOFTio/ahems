import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { createActivityLog } from "../models/activityLogModel.js";
import {
  clearActivePasswordResetsForUser,
  createPasswordResetRecord,
  createUser,
  findPasswordResetByToken,
  findUserByEmail,
  findUserById,
  markPasswordResetUsed,
  touchLastLogin,
  updateUser,
} from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

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

  await touchLastLogin(user.id);
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: "Signed into the platform",
    moduleName: "Auth",
    entityType: "user",
    entityId: user.id,
  });

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

  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: "Registered new account",
    moduleName: "Auth",
    entityType: "user",
    entityId: user.id,
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

  const token = `reset_${randomUUID().replace(/-/g, "")}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await clearActivePasswordResetsForUser(user.id);
  await createPasswordResetRecord({
    userId: user.id,
    email,
    token,
    expiresAt,
  });
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: "Requested password reset token",
    moduleName: "Auth",
    entityType: "password_reset",
  });

  return {
    message: "Reset token generated successfully for the account.",
    resetToken: token,
  };
}

export async function resetPassword({ token, password }) {
  const resetRecord = await findPasswordResetByToken(token);

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
  await markPasswordResetUsed(resetRecord.id);

  const user = await findUserById(resetRecord.userId);
  await createActivityLog({
    userId: resetRecord.userId,
    actorRole: user?.role || null,
    action: "Completed password reset",
    moduleName: "Auth",
    entityType: "password_reset",
  });

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
  await createActivityLog({
    userId: user.id,
    actorRole: user.role,
    action: "Changed account password",
    moduleName: "Auth",
    entityType: "user",
    entityId: user.id,
  });

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
