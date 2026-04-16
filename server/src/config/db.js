import mysql from "mysql2/promise";
import { env } from "./env.js";
import { logger } from "./logger.js";

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.mysqlHost,
      port: env.mysqlPort,
      database: env.mysqlDatabase,
      user: env.mysqlUser,
      password: env.mysqlPassword,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return pool;
}

export async function pingDatabase() {
  try {
    const activePool = getPool();
    await activePool.query("SELECT 1");
    return { connected: true };
  } catch (error) {
    logger.warn("Database ping failed. Continuing with simulation-first services.", {
      message: error.message,
    });
    return { connected: false, message: error.message };
  }
}

