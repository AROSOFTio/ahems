import { execute, query, queryOne } from "../config/db.js";

export async function listRoomTypes() {
  return query(
    `
      SELECT
        id,
        name,
        description,
        created_at,
        updated_at
      FROM room_types
      ORDER BY name ASC
    `,
  );
}

export async function listApplianceCategories() {
  return query(
    `
      SELECT
        id,
        name,
        description,
        icon,
        color_code,
        created_at,
        updated_at
      FROM appliance_categories
      ORDER BY name ASC
    `,
  );
}

export async function createRoomType({ name, description = null }) {
  const result = await execute(
    `
      INSERT INTO room_types (name, description)
      VALUES (?, ?)
    `,
    [name, description],
  );

  return queryOne(
    `
      SELECT id, name, description, created_at, updated_at
      FROM room_types
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId],
  );
}

export async function updateRoomType(id, { name, description }) {
  const fields = [];
  const values = [];

  if (typeof name === "string") {
    fields.push("name = ?");
    values.push(name);
  }

  if (typeof description === "string" || description === null) {
    fields.push("description = ?");
    values.push(description);
  }

  if (!fields.length) {
    return queryOne("SELECT id, name, description, created_at, updated_at FROM room_types WHERE id = ? LIMIT 1", [id]);
  }

  values.push(id);

  await execute(
    `
      UPDATE room_types
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    values,
  );

  return queryOne(
    `
      SELECT id, name, description, created_at, updated_at
      FROM room_types
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );
}

export async function deleteRoomType(id) {
  const result = await execute("DELETE FROM room_types WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function createApplianceCategory({ name, description = null, icon = null, colorCode = null }) {
  const result = await execute(
    `
      INSERT INTO appliance_categories (name, description, icon, color_code)
      VALUES (?, ?, ?, ?)
    `,
    [name, description, icon, colorCode],
  );

  return queryOne(
    `
      SELECT id, name, description, icon, color_code, created_at, updated_at
      FROM appliance_categories
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId],
  );
}

export async function updateApplianceCategory(id, { name, description, icon, colorCode }) {
  const fields = [];
  const values = [];

  if (typeof name === "string") {
    fields.push("name = ?");
    values.push(name);
  }

  if (typeof description === "string" || description === null) {
    fields.push("description = ?");
    values.push(description);
  }

  if (typeof icon === "string" || icon === null) {
    fields.push("icon = ?");
    values.push(icon);
  }

  if (typeof colorCode === "string" || colorCode === null) {
    fields.push("color_code = ?");
    values.push(colorCode);
  }

  if (!fields.length) {
    return queryOne(
      `
        SELECT id, name, description, icon, color_code, created_at, updated_at
        FROM appliance_categories
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );
  }

  values.push(id);

  await execute(
    `
      UPDATE appliance_categories
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    values,
  );

  return queryOne(
    `
      SELECT id, name, description, icon, color_code, created_at, updated_at
      FROM appliance_categories
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );
}

export async function deleteApplianceCategory(id) {
  const result = await execute("DELETE FROM appliance_categories WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
