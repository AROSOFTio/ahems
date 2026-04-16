import { ApiError } from "../utils/ApiError.js";

export function authorize(...roles) {
  return function authorizationMiddleware(req, _res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource."));
    }

    return next();
  };
}

