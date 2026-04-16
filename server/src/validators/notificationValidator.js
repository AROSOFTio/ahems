export function validateNotificationPayload(req) {
  const errors = [];

  if (!req.body.title || String(req.body.title).trim().length < 3) {
    errors.push("Notification title is required.");
  }

  if (!req.body.message || String(req.body.message).trim().length < 5) {
    errors.push("Notification message is required.");
  }

  return errors;
}

