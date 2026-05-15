import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

/*
Arg:
     -----
Return:
     Pool PostgreSQL auth_db.
*/

export const authPool = new Pool({
  connectionString: env.databaseUrl,
});
