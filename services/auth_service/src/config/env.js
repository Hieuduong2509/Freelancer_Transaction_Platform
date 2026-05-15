import dotenv from "dotenv";

dotenv.config();

/*
Arg:
     -----
Return:
     Cấu hình env cho auth-service.
*/

export const env = {
  port: Number(process.env.PORT || 8000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/auth_db",
  secretKey:
    process.env.SECRET_KEY || "your-secret-key-change-in-production",
  algorithm: process.env.ALGORITHM || "HS256",
  accessTokenExpireMinutes: Number(
    process.env.ACCESS_TOKEN_EXPIRE_MINUTES || 30
  ),
  refreshTokenExpireDays: Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS || 7),
  userServiceUrl:
    process.env.USER_SERVICE_URL || "http://localhost:8002",
};
