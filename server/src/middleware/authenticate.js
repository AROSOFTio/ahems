import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUserById } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { sanitizeUser } from "../utils/mockData.js";

export async function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication token is required."));
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await findUserById(payload.sub);

    if (!user) {
      return next(new ApiError(401, "User no longer exists."));
    }

    req.user = sanitizeUser(user);
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired authentication token."));
  }
}

