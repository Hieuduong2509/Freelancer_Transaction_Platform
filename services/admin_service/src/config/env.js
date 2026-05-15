import dotenv from "dotenv";

dotenv.config();

/*
Arg:
     -----
Return:
     Object chứa biến môi trường đã chuẩn hóa cho admin-service.
*/

export const env = {
  port: Number(process.env.PORT || 8000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/marketplace_db",
  authDatabaseUrl:
    process.env.AUTH_DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/auth_db",
  authServiceUrl:
    process.env.AUTH_SERVICE_URL || "http://localhost:8001",
  paymentsServiceUrl:
    process.env.PAYMENTS_SERVICE_URL || "http://localhost:8005",
  projectServiceUrl:
    process.env.PROJECT_SERVICE_URL || "http://localhost:8003",
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:8002",
};
