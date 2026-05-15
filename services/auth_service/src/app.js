import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerAuthAdminRoutes } from "./routes/authAdmin.routes.js";
import { registerAuthSessionRoutes } from "./routes/authSession.routes.js";
import { registerAuthAccountRoutes } from "./routes/authAccount.routes.js";
import { requireAuth, requireAdmin } from "./middleware/requireAuth.js";

/*
Arg:
     -----
Return:
     Fastify app auth-service.
*/

export async function buildApp() {
  const fastify = Fastify({ logger: true, trustProxy: true });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  fastify.get("/health", async () => ({
    status: "healthy",
    service: "auth-service",
  }));

  const deps = { requireAuth, requireAdmin };

  await fastify.register(
    async function authApiRoutes(f) {
      await registerAuthSessionRoutes(f);
      await registerAuthAccountRoutes(f, deps);
      await registerAuthAdminRoutes(f, deps);
    },
    { prefix: "/api/v1/auth" }
  );

  return fastify;
}
