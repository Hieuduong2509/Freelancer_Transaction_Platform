import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

/*
Arg:
     -----
Return:
     Pool PostgreSQL marketplace (events, metrics).
*/

export const marketplacePool = new Pool({
  connectionString: env.databaseUrl,
});
