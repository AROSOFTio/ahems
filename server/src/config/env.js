import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mysqlHost: process.env.MYSQL_HOST || "db",
  mysqlPort: Number(process.env.MYSQL_PORT || 3306),
  mysqlDatabase: process.env.MYSQL_DATABASE || "ahems",
  mysqlUser: process.env.MYSQL_USER || "ahems_user",
  mysqlPassword: process.env.MYSQL_PASSWORD || "StrongPassword123!",
  jwtSecret: process.env.JWT_SECRET || "replace-this-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
  clientPublicUrl: process.env.CLIENT_PUBLIC_URL || "http://localhost:3002",
};

