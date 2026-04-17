function isValidHexColor(value) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

export function validateRoomTypePayload(req) {
  const errors = [];

  if (req.body.name !== undefined && String(req.body.name).trim().length < 2) {
    errors.push("Room type name must be at least 2 characters.");
  }

  if (!req.body.name && req.method === "POST") {
    errors.push("Room type name is required.");
  }

  return errors;
}

export function validateApplianceCategoryPayload(req) {
  const errors = [];

  if (req.body.name !== undefined && String(req.body.name).trim().length < 2) {
    errors.push("Category name must be at least 2 characters.");
  }

  if (!req.body.name && req.method === "POST") {
    errors.push("Category name is required.");
  }

  if (req.body.colorCode && !isValidHexColor(String(req.body.colorCode))) {
    errors.push("Color code must be a valid hex value.");
  }

  return errors;
}
