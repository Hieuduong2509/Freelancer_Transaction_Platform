import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { authPool } from "./db/authPool.js";
import { ensureAuthSchema } from "./db/ensureAuthSchema.js";

/*
Arg:
     -----
Return:
     Khởi chạy server.
*/

async function main() {
  await ensureAuthSchema(authPool);
  const app = await buildApp();
  await app.listen({ host: "0.0.0.0", port: env.port });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
