import * as projectClient from "../clients/projectService.client.js";
import { forwardToProjectServiceRaw } from "../clients/projectService.client.js";
import * as userClient from "../clients/userService.client.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { replyFromUpstream } from "../lib/replyFromUpstream.js";

/*
Arg:
     fastify instance.
Return:
     Đăng ký route duyệt project / service (chỉ HTTP tới service tương ứng).
*/

export async function registerAdminCatalogRoutes(fastify) {
  fastify.get(
    "/pending-projects",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const limit = Number(request.query.limit) || 100;
      const data = await projectClient.forwardToProjectService({
        token,
        method: "GET",
        path: "/api/v1/projects",
        query: { status_filter: "pending_approval" },
      });
      if (Array.isArray(data)) {
        return data.slice(0, limit);
      }
      return data;
    }
  );

  fastify.post(
    "/projects/:projectId/approve",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const projectId = request.params.projectId;
      return projectClient.forwardToProjectService({
        token,
        method: "POST",
        path: `/api/v1/projects/${projectId}/approve`,
      });
    }
  );

  fastify.delete(
    "/projects/:projectId",
    { preHandler: requireAdmin },
    async (request, reply) => {
      const token = request.adminContext.token;
      const projectId = request.params.projectId;
      const raw = await forwardToProjectServiceRaw({
        token,
        method: "DELETE",
        path: `/api/v1/projects/${projectId}`,
      });
      return replyFromUpstream(reply, raw);
    }
  );

  fastify.get(
    "/pending-services",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const limit = Number(request.query.limit) || 100;
      const data = await userClient.forwardToUserService({
        token,
        method: "GET",
        path: "/api/v1/services",
        query: { status_filter: "pending", limit },
      });
      if (Array.isArray(data)) {
        return data.slice(0, limit);
      }
      return data;
    }
  );

  fastify.post(
    "/services/:serviceId/approve",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const serviceId = request.params.serviceId;
      return userClient.forwardToUserService({
        token,
        method: "POST",
        path: `/api/v1/services/${serviceId}/approve`,
      });
    }
  );

  fastify.post(
    "/services/:serviceId/reject",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const serviceId = request.params.serviceId;
      return userClient.forwardToUserService({
        token,
        method: "POST",
        path: `/api/v1/services/${serviceId}/reject`,
        body: request.body || {},
      });
    }
  );

  fastify.post(
    "/services/:serviceId/hide",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const serviceId = request.params.serviceId;
      return userClient.forwardToUserService({
        token,
        method: "POST",
        path: `/api/v1/services/${serviceId}/hide`,
      });
    }
  );
}
