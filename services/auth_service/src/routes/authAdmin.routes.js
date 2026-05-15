import * as userRepository from "../repositories/user.repository.js";
import { toUserResponse } from "../mappers/user.mapper.js";
function adminActionPayload(userRow, message) {
  return { message, user: toUserResponse(userRow) };
}

/*
Arg:
     fastify.
Return:
     Routes admin /users…
*/

export async function registerAuthAdminRoutes(fastify, { requireAuth, requireAdmin }) {
  const adminPre = { preHandler: [requireAuth, requireAdmin] };

  fastify.get("/users", adminPre, async (request) => {
    const role = request.query.role || null;
    const rows = await userRepository.listUsersOrdered({ role });
    return rows.map(toUserResponse);
  });

  fastify.post(
    "/users/:userId/suspend",
    adminPre,
    async (request, reply) => {
      const userId = Number(request.params.userId);
      let days = request.body?.days;
      if (days === undefined || days === null) {
        days = 30;
      } else {
        days = Math.max(0, Number(days) || 0);
      }
      const user = await userRepository.findUserById(userId);
      if (!user) {
        return reply.code(404).send({ detail: "User not found" });
      }
      let message;
      if (days <= 0) {
        await userRepository.updateUserSuspendedUntil(userId, null);
        message = "Đã gỡ tạm khóa tài khoản.";
      } else {
        const until = new Date(
          Date.now() + days * 24 * 60 * 60 * 1000
        );
        await userRepository.updateUserSuspendedUntil(userId, until);
        message = `Đã tạm khóa tài khoản ${days} ngày.`;
      }
      const updated = await userRepository.findUserById(userId);
      return adminActionPayload(updated, message);
    }
  );

  fastify.post(
    "/users/:userId/unsuspend",
    adminPre,
    async (request, reply) => {
      const userId = Number(request.params.userId);
      const user = await userRepository.findUserById(userId);
      if (!user) {
        return reply.code(404).send({ detail: "User not found" });
      }
      await userRepository.updateUserSuspendedUntil(userId, null);
      const updated = await userRepository.findUserById(userId);
      return adminActionPayload(updated, "Đã gỡ tạm khóa tài khoản.");
    }
  );

  fastify.post("/users/:userId/ban", adminPre, async (request, reply) => {
    const userId = Number(request.params.userId);
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return reply.code(404).send({ detail: "User not found" });
    }
    await userRepository.updateUserBanned(userId, true);
    const updated = await userRepository.findUserById(userId);
    return adminActionPayload(updated, "Đã khóa vĩnh viễn tài khoản.");
  });

  fastify.post("/users/:userId/unban", adminPre, async (request, reply) => {
    const userId = Number(request.params.userId);
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return reply.code(404).send({ detail: "User not found" });
    }
    await userRepository.updateUserBanned(userId, false);
    const updated = await userRepository.findUserById(userId);
    return adminActionPayload(updated, "Đã gỡ khóa tài khoản.");
  });

  fastify.delete("/users/:userId", adminPre, async (request, reply) => {
    const userId = Number(request.params.userId);
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return reply.code(404).send({ detail: "User not found" });
    }
    await userRepository.deleteUserCascade(userId);
    return { message: "Xóa tài khoản thành công.", user_id: userId };
  });

  fastify.get("/pending-users", adminPre, async (request) => {
    const role = request.query.role || null;
    const limit = request.query.limit;
    const rows = await userRepository.listPendingUsers({ role, limit });
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      headline: u.headline,
      role: String(u.role || "").toLowerCase(),
      is_verified: u.is_verified,
      is_email_verified: u.is_email_verified,
      created_at: u.created_at
        ? new Date(u.created_at).toISOString()
        : null,
    }));
  });

  fastify.post("/users/:userId/approve", adminPre, async (request, reply) => {
    const userId = Number(request.params.userId);
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return reply.code(404).send({ detail: "User not found" });
    }
    if (!user.is_verified) {
      await userRepository.setUserVerified(userId);
    }
    const updated = await userRepository.findUserById(userId);
    return {
      message: "User verified successfully",
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: String(updated.role || "").toLowerCase(),
      },
    };
  });
}
