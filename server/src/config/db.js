import mysql from "mysql2/promise";
import { env } from "./env.js";
import { logger } from "./logger.js";

let pool;

function snakeToCamel(value) {
  return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function transformRow(row) {
  if (Array.isArray(row)) {
    return row.map(transformRow);
  }

  if (row && typeof row === "object" && !(row instanceof Date)) {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [snakeToCamel(key), transformRow(value)]),
    );
  }

  return row;
}

function createExecutor(connection) {
  return {
    async query(sql, params = []) {
      const [rows] = await connection.execute(sql, params);
      return rows.map((row) => transformRow(row));
    },
    async queryOne(sql, params = []) {
      const [rows] = await connection.execute(sql, params);
      const [row] = rows;
      return row ? transformRow(row) : null;
    },
    async execute(sql, params = []) {
      const [result] = await connection.execute(sql, params);
      return result;
    },
  };
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.mysqlHost,
      port: env.mysqlPort,
      database: env.mysqlDatabase,
      user: env.mysqlUser,
      password: env.mysqlPassword,
      charset: "utf8mb4",
      decimalNumbers: true,
      connectTimeout: 5000,
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
    logger.warn("Database ping failed. MySQL-backed features will be unavailable until the connection is restored.", {
      message: error.message,
    });
    return { connected: false, message: error.message };
  }
}

export async function query(sql, params = []) {
  const executor = createExecutor(getPool());
  return executor.query(sql, params);
}

export async function queryOne(sql, params = []) {
  const executor = createExecutor(getPool());
  return executor.queryOne(sql, params);
}

export async function execute(sql, params = []) {
  const executor = createExecutor(getPool());
  return executor.execute(sql, params);
}

export async function withTransaction(callback) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const executor = createExecutor(connection);
    const result = await callback(executor, connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
