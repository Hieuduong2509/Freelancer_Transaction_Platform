import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

/*
Arg:
     -----
Return:
     Pool PostgreSQL chỉ dùng cho auth_db (bảng users xác thực).
*/

export const authPool = new Pool({
  connectionString: env.authDatabaseUrl,
});
