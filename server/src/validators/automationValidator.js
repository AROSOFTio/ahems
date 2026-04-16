export function validateAutomationPayload(req) {
  const errors = [];
  if (!req.body.name || req.body.name.trim().length < 2) errors.push("Rule name is required.");
  if (!req.body.scope) errors.push("Rule scope is required.");
  return errors;
}

