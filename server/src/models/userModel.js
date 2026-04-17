import { execute, queryOne } from "../config/db.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

const userSelect = `
  SELECT
    u.id,
    u.first_name,
    u.last_name,
    CONCAT(u.first_name, ' ', u.last_name) AS name,
    u.email,
    u.password_hash,
    u.status,
    u.last_login_at,
    u.created_at,
    u.updated_at
  FROM users u
`;

export async function findUserByEmail(email) {
  return queryOne(`${userSelect} WHERE u.email = ? LIMIT 1`, [email]);
}

export async function findUserById(id) {
  return queryOne(`${userSelect} WHERE u.id = ? LIMIT 1`, [id]);
}

export async function touchLastLogin(id) {
  await execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [id]);
}

export async function getPublicProfile(id) {
  const user = await findUserById(id);
  return sanitizeUser(user);
}
