import { buildApp } from "./app.js";
import { env } from "./config/env.js";

/*
Arg:
     -----
Return:
     Khởi chạy HTTP server.
*/

async function main() {
  const app = await buildApp();
  await app.listen({ host: "0.0.0.0", port: env.port });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
