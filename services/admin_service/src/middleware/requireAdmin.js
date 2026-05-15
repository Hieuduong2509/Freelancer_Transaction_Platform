import { verifyAdminToken } from "../clients/authService.client.js";

/*
Arg:
     request, reply: Fastify.
Return:
     Gán request.adminContext; hoặc gửi lỗi HTTP và dừng.
*/

export async function requireAdmin(request, reply) {
  const header = request.headers.authorization;
  try {
    const ctx = await verifyAdminToken(header);
    request.adminContext = ctx;
  } catch (err) {
    const code = err.statusCode || 500;
    const detail = err.detail ?? err.message;
    return reply.code(code).send(
      typeof detail === "object" ? detail : { detail }
    );
  }
}
