export function validateAutomationPayload(req) {
  const errors = [];
  if (!req.body.name || req.body.name.trim().length < 2) errors.push("Rule name is required.");
  if (!req.body.scope) errors.push("Rule scope is required.");
  if (req.body.conditions && !Array.isArray(req.body.conditions)) errors.push("Conditions must be an array.");
  if (req.body.actions && !Array.isArray(req.body.actions)) errors.push("Actions must be an array.");
  return errors;
}
