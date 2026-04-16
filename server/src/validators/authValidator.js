const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(req) {
  const errors = [];
  if (!req.body.email || !emailPattern.test(req.body.email)) errors.push("A valid email is required.");
  if (!req.body.password || req.body.password.length < 8) errors.push("Password must be at least 8 characters.");
  return errors;
}

export function validateRegister(req) {
  const errors = validateLogin(req);
  if (!req.body.name || req.body.name.trim().length < 3) errors.push("Name must be at least 3 characters.");
  if (!["resident", "operator"].includes(req.body.role)) errors.push("Role must be resident or operator.");
  return errors;
}

export function validateForgotPassword(req) {
  return !req.body.email || !emailPattern.test(req.body.email) ? ["A valid email is required."] : [];
}

export function validateResetPassword(req) {
  const errors = [];
  if (!req.body.token) errors.push("Reset token is required.");
  if (!req.body.password || req.body.password.length < 8) errors.push("New password must be at least 8 characters.");
  return errors;
}

export function validateChangePassword(req) {
  const errors = [];
  if (!req.body.currentPassword) errors.push("Current password is required.");
  if (!req.body.newPassword || req.body.newPassword.length < 8) errors.push("New password must be at least 8 characters.");
  return errors;
}
