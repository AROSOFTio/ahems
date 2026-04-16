import bcrypt from "bcryptjs";
import { execute, query, queryOne, withTransaction } from "../config/db.js";
import { logger } from "../config/logger.js";

const roleSeed = [
  { id: 1, name: "admin", description: "System administrator with full platform control" },
  { id: 2, name: "resident", description: "Standard resident or office manager" },
  { id: 3, name: "operator", description: "Operational staff with limited assigned-room access" },
];

const userSeed = [
  {
    id: 1,
    firstName: "Amina",
    lastName: "Kato",
    email: "admin@ahems.io",
    password: "Admin@12345",
    phone: "+256700000001",
    roleId: 1,
  },
  {
    id: 2,
    firstName: "Jonah",
    lastName: "Okello",
    email: "resident@ahems.io",
    password: "Resident@12345",
    phone: "+256700000002",
    roleId: 2,
  },
  {
    id: 3,
    firstName: "Grace",
    lastName: "Namutebi",
    email: "operator@ahems.io",
    password: "Operator@12345",
    phone: "+256700000003",
    roleId: 3,
  },
];

const roomTypeSeed = [
  { id: 1, name: "Living Room", description: "Shared family or lounge area" },
  { id: 2, name: "Kitchen", description: "Cooking and utility area" },
  { id: 3, name: "Bedroom", description: "Private sleeping area" },
  { id: 4, name: "Office", description: "Study or work zone" },
];

const categorySeed = [
  { id: 1, name: "Lighting", description: "Lighting fixtures and dimmable lights", icon: "Lightbulb", colorCode: "#3543bb" },
  { id: 2, name: "Climate", description: "Fans, cooling, and climate comfort devices", icon: "Wind", colorCode: "#06b6d4" },
  { id: 3, name: "Entertainment", description: "Media and leisure devices", icon: "Tv", colorCode: "#0f172a" },
];

const defaultSettings = [
  {
    key: "default_thresholds",
    value: { maxTemperature: 25, minLightLevel: 45 },
    description: "Default room thresholds for new spaces",
  },
  {
    key: "notification_preferences",
    value: { channels: ["in-app", "email"], digestFrequency: "daily" },
    description: "Default notification routing preferences",
  },
  {
    key: "report_defaults",
    value: { exportFormat: "CSV", dateRange: "monthly" },
    description: "Default reporting preferences",
  },
];

async function ensureSeedTableAvailability() {
  await queryOne("SELECT 1 FROM roles LIMIT 1");
}

export async function ensureDatabaseBootstrapData() {
  try {
    await ensureSeedTableAvailability();
  } catch (error) {
    logger.warn("Skipping database bootstrap because schema tables are not available yet.", {
      message: error.message,
    });
    return;
  }

  await withTransaction(async (db) => {
    for (const role of roleSeed) {
      await db.execute(
        `
          INSERT INTO roles (id, name, description)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            updated_at = CURRENT_TIMESTAMP
        `,
        [role.id, role.name, role.description],
      );
    }

    for (const user of userSeed) {
      const passwordHash = await bcrypt.hash(user.password, 10);

      await db.execute(
        `
          INSERT INTO users (
            id,
            first_name,
            last_name,
            email,
            password_hash,
            phone,
            status,
            last_login_at
          )
          VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', NOW())
          ON DUPLICATE KEY UPDATE
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            password_hash = VALUES(password_hash),
            phone = VALUES(phone),
            status = 'ACTIVE',
            updated_at = CURRENT_TIMESTAMP
        `,
        [user.id, user.firstName, user.lastName, user.email, passwordHash, user.phone],
      );

      await db.execute(
        `
          INSERT INTO user_roles (user_id, role_id)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
        `,
        [user.id, user.roleId],
      );
    }

    for (const roomType of roomTypeSeed) {
      await db.execute(
        `
          INSERT INTO room_types (id, name, description)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            updated_at = CURRENT_TIMESTAMP
        `,
        [roomType.id, roomType.name, roomType.description],
      );
    }

    for (const category of categorySeed) {
      await db.execute(
        `
          INSERT INTO appliance_categories (id, name, description, icon, color_code)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            icon = VALUES(icon),
            color_code = VALUES(color_code),
            updated_at = CURRENT_TIMESTAMP
        `,
        [category.id, category.name, category.description, category.icon, category.colorCode],
      );
    }

    for (const setting of defaultSettings) {
      await db.execute(
        `
          INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
          VALUES (?, ?, ?, 1)
          ON DUPLICATE KEY UPDATE
            setting_value = VALUES(setting_value),
            description = VALUES(description),
            updated_by = VALUES(updated_by),
            updated_at = CURRENT_TIMESTAMP
        `,
        [setting.key, JSON.stringify(setting.value), setting.description],
      );
    }
  });

  const seededRooms = await query(
    `
      SELECT id, owner_user_id, name
      FROM rooms
      WHERE id IN (1, 2, 3)
    `,
  );

  for (const room of seededRooms) {
    await execute(
      `
        INSERT INTO user_room_assignments (user_id, room_id, assignment_type)
        VALUES (?, ?, 'OWNER')
        ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
      `,
      [room.ownerUserId, room.id],
    );
  }

  const officeRoom = seededRooms.find((room) => room.name === "Home Office");
  if (officeRoom) {
    await execute(
      `
        INSERT INTO user_room_assignments (user_id, room_id, assignment_type)
        VALUES (3, ?, 'OPERATOR')
        ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
      `,
      [officeRoom.id],
    );
  }

  logger.info("Database bootstrap seed verification completed.");
}
