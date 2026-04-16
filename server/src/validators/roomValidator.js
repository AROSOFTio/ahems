export function validateRoomPayload(req) {
  const errors = [];
  if (!req.body.name || req.body.name.trim().length < 2) errors.push("Room name is required.");
  if (!req.body.roomType || req.body.roomType.trim().length < 2) errors.push("Room type is required.");
  return errors;
}

