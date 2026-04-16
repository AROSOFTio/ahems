export function validateAppliancePayload(req) {
  const errors = [];
  if (!req.body.name || req.body.name.trim().length < 2) errors.push("Appliance name is required.");
  if (!req.body.roomId) errors.push("Room ID is required.");
  if (!req.body.categoryId) errors.push("Category ID is required.");
  if (!req.body.powerRatingWatts) errors.push("Power rating is required.");
  return errors;
}

