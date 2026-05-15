import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerAnalyticsSummaryRoutes } from "./routes/analyticsSummary.routes.js";
import { registerAnalyticsEventsRoutes } from "./routes/analyticsEvents.routes.js";

/*
Arg:
     -----
Return:
     Fastify app đã cấu hình CORS và routes analytics.
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
    service: "analytics-service",
  }));

  await fastify.register(registerAnalyticsSummaryRoutes, {
    prefix: "/api/v1/analytics",
  });
  await fastify.register(registerAnalyticsEventsRoutes, {
    prefix: "/api/v1/analytics",
  });

  return fastify;
}
