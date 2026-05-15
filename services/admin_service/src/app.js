import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerAdminDisputeRoutes } from "./routes/adminDisputes.routes.js";
import { registerAdminUserRoutes } from "./routes/adminUsers.routes.js";
import { registerAdminCatalogRoutes } from "./routes/adminCatalog.routes.js";

/*
Arg:
     -----
Return:
     Instance Fastify đã đăng ký route và CORS.
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
    service: "admin-service",
  }));

  await fastify.register(registerAdminDisputeRoutes, {
    prefix: "/api/v1/admin",
  });
  await fastify.register(registerAdminUserRoutes, {
    prefix: "/api/v1/admin",
  });
  await fastify.register(registerAdminCatalogRoutes, {
    prefix: "/api/v1/admin",
  });

  return fastify;
}
