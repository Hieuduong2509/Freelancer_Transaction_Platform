import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/*
Arg:
     payload: Object JWT (sub, role, …).
     expiresInMinutes: Thời hạn access token (phút).
Return:
     Chuỗi JWT đã ký.
*/

export function createAccessToken(payload, expiresInMinutes) {
  const body = { ...payload };
  if (body.sub !== undefined) {
    body.sub = String(body.sub);
  }
  const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  return jwt.sign({ ...body, exp }, env.secretKey, { algorithm: env.algorithm });
}

/*
Arg:
     token: Bearer token (không có prefix) hoặc full Bearer …
Return:
     Payload đã decode; ném Error nếu không hợp lệ.
*/

export function verifyAccessToken(token) {
  const raw = token?.startsWith("Bearer ") ? token.slice(7) : token;
  return jwt.verify(raw, env.secretKey, { algorithms: [env.algorithm] });
}
