export function validateAutomationPayload(req) {
  const errors = [];

  if (!req.body.name || req.body.name.trim().length < 2) {
    errors.push("Rule name is required.");
  }

  if (!req.body.scope) {
    errors.push("Rule scope is required.");
  }

  if (req.body.conditions && !Array.isArray(req.body.conditions)) {
    errors.push("Conditions must be an array.");
  }

  if (req.body.actions && !Array.isArray(req.body.actions)) {
    errors.push("Actions must be an array.");
  }

  for (const condition of req.body.conditions || []) {
    if (!condition.metric || !condition.operator || condition.comparisonValue === undefined) {
      errors.push("Each condition must include a metric, operator, and comparison value.");
      break;
    }
  }

  for (const action of req.body.actions || []) {
    if (!action.actionType) {
      errors.push("Each action must include an action type.");
      break;
    }
  }

  return errors;
}

export function validateAutomationPartialPayload(req) {
  const errors = [];

  if (Object.prototype.hasOwnProperty.call(req.body, "priority") && Number(req.body.priority) < 1) {
    errors.push("Priority must be at least 1.");
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "conditions") && !Array.isArray(req.body.conditions)) {
    errors.push("Conditions must be an array.");
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "actions") && !Array.isArray(req.body.actions)) {
    errors.push("Actions must be an array.");
  }

  return errors;
}
