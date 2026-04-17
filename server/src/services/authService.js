import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUserByEmail, findUserById, touchLastLogin } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

function signToken(user) {
  return jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user) throw new ApiError(401, "Invalid email or password.");

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) throw new ApiError(401, "Invalid email or password.");

  await touchLastLogin(user.id);

  return {
    user: sanitizeUser(user),
    token: signToken(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(404, "User was not found.");
  return { user: sanitizeUser(user) };
}
