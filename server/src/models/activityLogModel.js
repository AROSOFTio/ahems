import { execute, query, queryOne } from "../config/db.js";

export async function createActivityLog({
  userId = null,
  actorRole = null,
  action,
  moduleName,
  entityType = null,
  entityId = null,
  description = null,
  ipAddress = null,
  userAgent = null,
  metadata = null,
}) {
  await execute(
    `
      INSERT INTO activity_logs (
        user_id,
        actor_role,
        action,
        module_name,
        entity_type,
        entity_id,
        description,
        ip_address,
        user_agent,
        metadata_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      actorRole,
      action,
      moduleName,
      entityType,
      entityId,
      description,
      ipAddress,
      userAgent,
      metadata ? JSON.stringify(metadata) : null,
    ],
  );
}

export async function listActivityLogs(limitOrFilters = 100) {
  const filters =
    typeof limitOrFilters === "object" && limitOrFilters !== null
      ? limitOrFilters
      : { limit: limitOrFilters };

  const clauses = [];
  const params = [];

  if (filters.moduleName) {
    clauses.push("al.module_name = ?");
    params.push(filters.moduleName);
  }

  if (filters.actorRole) {
    clauses.push("al.actor_role = ?");
    params.push(filters.actorRole);
  }

  if (filters.entityType) {
    clauses.push("al.entity_type = ?");
    params.push(filters.entityType);
  }

  if (filters.userId) {
    clauses.push("al.user_id = ?");
    params.push(filters.userId);
  }

  if (filters.query) {
    clauses.push("(al.action LIKE ? OR al.description LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?)");
    params.push(`%${filters.query}%`, `%${filters.query}%`, `%${filters.query}%`);
  }

  const limit = Number(filters.limit || 100);

  return query(
    `
      SELECT
        al.id,
        al.user_id,
        al.actor_role,
        al.action,
        al.module_name,
        al.entity_type,
        al.entity_id,
        al.description,
        al.ip_address,
        al.user_agent,
        al.metadata_json,
        al.created_at,
        CONCAT(u.first_name, ' ', u.last_name) AS actor_name,
        u.email AS actor_email
      FROM activity_logs al
      LEFT JOIN users u ON u.id = al.user_id
      ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
      ORDER BY al.created_at DESC
      LIMIT ?
    `,
    [...params, limit],
  );
}

export async function countActivityLogs() {
  const row = await queryOne("SELECT COUNT(*) AS total_logs FROM activity_logs");
  return row?.totalLogs ?? 0;
}
