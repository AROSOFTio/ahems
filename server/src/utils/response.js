export function sendSuccess(res, data, message = "Request completed successfully", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

