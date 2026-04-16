import { logger } from "../config/logger.js";

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  logger.error(error.message, {
    statusCode,
    details: error.details || null,
  });

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    details: error.details || null,
  });
}

