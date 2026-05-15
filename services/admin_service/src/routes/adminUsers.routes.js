import * as authUserRepository from "../repositories/authUser.repository.js";
import {
  forwardToAuth,
  forwardToAuthRaw,
} from "../clients/authService.client.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { replyFromUpstream } from "../lib/replyFromUpstream.js";

/*
Arg:
     fastify instance.
Return:
     Đăng ký route quản lý user (proxy auth + đọc chi tiết từ auth DB).
*/

export async function registerAdminUserRoutes(fastify) {
  fastify.get(
    "/users",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const q = {};
      if (request.query.role) {
        q.role = request.query.role;
      }
      return forwardToAuth({
        token,
        method: "GET",
        path: "/api/v1/auth/users",
        query: q,
      });
    }
  );

  fastify.get(
    "/users/:userId",
    { preHandler: requireAdmin },
    async (request, reply) => {
      const userId = Number(request.params.userId);
      const row = await authUserRepository.findAuthUserById(userId);
      if (!row) {
        return reply.code(404).send({ detail: "User not found" });
      }
      return row;
    }
  );

  fastify.get(
    "/pending-users",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      return forwardToAuth({
        token,
        method: "GET",
        path: "/api/v1/auth/pending-users",
        query: {
          role: request.query.role || "freelancer",
          limit: request.query.limit || 50,
        },
      });
    }
  );

  fastify.post(
    "/users/:userId/approve",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const userId = request.params.userId;
      return forwardToAuth({
        token,
        method: "POST",
        path: `/api/v1/auth/users/${userId}/approve`,
      });
    }
  );

  fastify.post(
    "/users/:userId/suspend",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const userId = request.params.userId;
      return forwardToAuth({
        token,
        method: "POST",
        path: `/api/v1/auth/users/${userId}/suspend`,
        body: request.body || {},
      });
    }
  );

  fastify.post(
    "/users/:userId/unsuspend",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const userId = request.params.userId;
      return forwardToAuth({
        token,
        method: "POST",
        path: `/api/v1/auth/users/${userId}/unsuspend`,
      });
    }
  );

  fastify.post(
    "/users/:userId/ban",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const userId = request.params.userId;
      return forwardToAuth({
        token,
        method: "POST",
        path: `/api/v1/auth/users/${userId}/ban`,
      });
    }
  );

  fastify.post(
    "/users/:userId/unban",
    { preHandler: requireAdmin },
    async (request) => {
      const token = request.adminContext.token;
      const userId = request.params.userId;
      return forwardToAuth({
        token,
        method: "POST",
        path: `/api/v1/auth/users/${userId}/unban`,
      });
    }
  );

  fastify.delete(
    "/users/:userId",
    { preHandler: requireAdmin },
    async (request, reply) => {
      const token = request.adminContext.token;
      const userId = request.params.userId;
      const raw = await forwardToAuthRaw({
        token,
        method: "DELETE",
        path: `/api/v1/auth/users/${userId}`,
      });
      return replyFromUpstream(reply, raw);
    }
  );
}
