export function validateProfileUpdate(req) {
  const errors = [];

  if (req.body.name !== undefined && String(req.body.name).trim().length < 3) {
    errors.push("Name must be at least 3 characters when provided.");
  }

  if (req.body.phone !== undefined && String(req.body.phone).trim().length < 7) {
    errors.push("Phone number must be at least 7 characters when provided.");
  }

  if (req.body.avatarUrl !== undefined && req.body.avatarUrl && !String(req.body.avatarUrl).startsWith("http")) {
    errors.push("Avatar URL must be a valid http/https URL when provided.");
  }

  return errors;
}

