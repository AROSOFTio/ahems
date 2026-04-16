import { execute, query, queryOne, withTransaction } from "../config/db.js";
import { splitFullName } from "../utils/name.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

const userSelect = `
  SELECT
    u.id,
    u.first_name,
    u.last_name,
    CONCAT(u.first_name, ' ', u.last_name) AS name,
    u.email,
    u.password_hash,
    u.phone,
    u.status,
    u.avatar_url,
    u.last_login_at,
    u.created_at,
    u.updated_at,
    r.name AS role
  FROM users u
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
`;

async function findRoleIdByName(roleName, executor = { queryOne }) {
  const role = await executor.queryOne("SELECT id, name FROM roles WHERE name = ? LIMIT 1", [roleName]);
  return role?.id ?? null;
}

export async function listUsers() {
  const rows = await query(`${userSelect} ORDER BY u.created_at DESC`);
  return rows.map(sanitizeUser);
}

export async function countUsers() {
  const row = await queryOne("SELECT COUNT(*) AS total_users FROM users");
  return row?.totalUsers ?? 0;
}

export async function findUserByEmail(email) {
  return queryOne(`${userSelect} WHERE u.email = ? LIMIT 1`, [email]);
}

export async function findUserById(id) {
  return queryOne(`${userSelect} WHERE u.id = ? LIMIT 1`, [id]);
}

export async function createUser({ name, email, role, phone = null, passwordHash, status = "ACTIVE" }) {
  return withTransaction(async (executor) => {
    const roleId = await findRoleIdByName(role, executor);
    const { firstName, lastName } = splitFullName(name);

    if (!roleId) {
      throw new Error(`Role '${role}' was not found in the database seed.`);
    }

    const insertResult = await executor.execute(
      `
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password_hash,
          phone,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [firstName, lastName, email, passwordHash, phone, status],
    );

    if (roleId) {
      await executor.execute(
        `
          INSERT INTO user_roles (user_id, role_id)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
        `,
        [insertResult.insertId, roleId],
      );
    }

    const created = await executor.queryOne(`${userSelect} WHERE u.id = ? LIMIT 1`, [insertResult.insertId]);
    return sanitizeUser(created);
  });
}

export async function updateUser(id, updates) {
  const fields = [];
  const values = [];

  if (typeof updates.name === "string") {
    const { firstName, lastName } = splitFullName(updates.name);
    fields.push("first_name = ?", "last_name = ?");
    values.push(firstName, lastName);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "phone")) {
    fields.push("phone = ?");
    values.push(updates.phone || null);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "avatarUrl")) {
    fields.push("avatar_url = ?");
    values.push(updates.avatarUrl || null);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "passwordHash")) {
    fields.push("password_hash = ?");
    values.push(updates.passwordHash);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "status")) {
    fields.push("status = ?");
    values.push(updates.status);
  }

  if (fields.length === 0) {
    const unchangedUser = await findUserById(id);
    return sanitizeUser(unchangedUser);
  }

  values.push(id);

  await execute(
    `
      UPDATE users
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    values,
  );

  const user = await findUserById(id);
  return sanitizeUser(user);
}

export async function touchLastLogin(id) {
  await execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [id]);
}

export async function getPublicProfile(id) {
  const user = await findUserById(id);
  return sanitizeUser(user);
}

export async function createPasswordResetRecord({ userId, email, token, expiresAt }) {
  await execute(
    `
      INSERT INTO password_resets (user_id, email, token, expires_at)
      VALUES (?, ?, ?, ?)
    `,
    [userId, email, token, expiresAt],
  );
}

export async function clearActivePasswordResetsForUser(userId) {
  await execute("DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL", [userId]);
}

export async function findPasswordResetByToken(token) {
  return queryOne(
    `
      SELECT
        id,
        user_id,
        email,
        token,
        expires_at,
        used_at,
        created_at
      FROM password_resets
      WHERE token = ?
      LIMIT 1
    `,
    [token],
  );
}

export async function markPasswordResetUsed(id) {
  await execute("UPDATE password_resets SET used_at = NOW() WHERE id = ?", [id]);
}

export async function countUsersByRole() {
  return query(
    `
      SELECT
        r.name AS role_name,
        COUNT(u.id) AS total_users
      FROM roles r
      LEFT JOIN user_roles ur ON ur.role_id = r.id
      LEFT JOIN users u ON u.id = ur.user_id
      GROUP BY r.id, r.name
      ORDER BY r.id ASC
    `,
  );
}
