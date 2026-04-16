import { ApiError } from "../utils/ApiError.js";

export function validate(validator) {
  return function validationMiddleware(req, _res, next) {
    const errors = validator(req);

    if (errors.length > 0) {
      return next(new ApiError(400, "Validation failed", errors));
    }

    return next();
  };
}

