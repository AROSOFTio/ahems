import { addActivityLog, createId, ensureStore, getState, sanitizeUser } from "../utils/mockData.js";

export async function listUsers() {
  const store = await ensureStore();
  return store.users.map(sanitizeUser);
}

export async function findUserByEmail(email) {
  const store = await ensureStore();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  const store = await ensureStore();
  return store.users.find((user) => user.id === id) || null;
}

export async function createUser({ name, email, role, phone, passwordHash }) {
  const store = await ensureStore();
  const user = {
    id: createId("usr"),
    name,
    email,
    role,
    phone: phone || null,
    status: "active",
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.users.push(user);
  addActivityLog(user.id, "Registered new account", "Auth");
  return sanitizeUser(user);
}

export async function updateUser(id, updates) {
  const user = await findUserById(id);

  if (!user) {
    return null;
  }

  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  addActivityLog(id, "Updated user profile", "Users");
  return sanitizeUser(user);
}

export async function getPublicProfile(id) {
  const user = await findUserById(id);
  return sanitizeUser(user);
}

export function getPasswordResetStore() {
  return getState().passwordResets;
}

