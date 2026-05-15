import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

/*
Arg:
     -----
Return:
     Pool PostgreSQL chỉ dùng cho marketplace_db (bảng disputes, …).
*/

export const marketplacePool = new Pool({
  connectionString: env.databaseUrl,
});
