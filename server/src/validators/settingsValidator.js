export function validateSettingsUpdate(req) {
  return typeof req.body !== "object" || Array.isArray(req.body) ? ["Settings payload must be an object."] : [];
}

