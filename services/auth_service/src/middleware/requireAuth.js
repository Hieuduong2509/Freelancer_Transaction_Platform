import * as userRepository from "../repositories/user.repository.js";
import { verifyAccessToken } from "../lib/jwtTokens.js";

/*
Arg:
     request, reply: Fastify.
Return:
     Gán request.authUser hoặc trả 401.
*/

export async function requireAuth(request, reply) {
  const header = request.headers.authorization;
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return reply.code(401).send({
      detail: "Not authenticated",
    });
  }
  let payload;
  try {
    payload = verifyAccessToken(header);
  } catch {
    return reply.code(401).send({
      detail: "Could not validate credentials",
    });
  }
  const uid = payload.sub;
  if (uid === undefined || uid === null) {
    return reply.code(401).send({
      detail: "Invalid authentication payload",
    });
  }
  const user = await userRepository.findUserById(Number(uid));
  if (!user) {
    return reply.code(401).send({ detail: "User not found" });
  }
  request.authUser = user;
}

/*
Arg:
     request, reply: Fastify (sau requireAuth).
Return:
     403 nếu không phải admin.
*/

export async function requireAdmin(request, reply) {
  const role = String(request.authUser?.role || "").toLowerCase();
  if (role !== "admin") {
    return reply.code(403).send({ detail: "Admin privileges required" });
  }
}
