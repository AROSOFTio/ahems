export function validateSimulationConditions(req) {
  const errors = [];

  if (!req.body.roomId) errors.push("Room ID is required.");
  if (req.body.targetTemperature !== undefined && Number.isNaN(Number(req.body.targetTemperature))) {
    errors.push("Target temperature must be numeric.");
  }
  if (req.body.targetLightIntensity !== undefined && Number.isNaN(Number(req.body.targetLightIntensity))) {
    errors.push("Target light intensity must be numeric.");
  }

  return errors;
}

export function validateSimulationRandomize(req) {
  return !req.body.roomId ? ["Room ID is required."] : [];
}

export function validateSimulationCommand(req) {
  const errors = [];

  if (!req.body.commandText && !req.body.action) {
    errors.push("Command text or action is required.");
  }

  if (req.body.roomId !== undefined && Number.isNaN(Number(req.body.roomId))) {
    errors.push("Room ID must be numeric.");
  }

  if (req.body.applianceId !== undefined && Number.isNaN(Number(req.body.applianceId))) {
    errors.push("Appliance ID must be numeric.");
  }

  if (req.body.brightnessLevel !== undefined && Number.isNaN(Number(req.body.brightnessLevel))) {
    errors.push("Brightness level must be numeric.");
  }

  return errors;
}
