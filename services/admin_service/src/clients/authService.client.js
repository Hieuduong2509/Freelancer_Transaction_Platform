import { env } from "../config/env.js";
import { upstreamJson, upstreamRaw } from "../lib/httpUpstream.js";

/*
Arg:
     authorizationHeader: Giá trị header Authorization đầy đủ (vd: Bearer …).
Return:
     { token, adminUser } nếu role là admin; ném Error statusCode 401/403/502.
*/

export async function verifyAdminToken(authorizationHeader) {
  if (!authorizationHeader) {
    const e = new Error("Authorization header required");
    e.statusCode = 401;
    throw e;
  }
  let data;
  try {
    data = await upstreamJson({
      baseUrl: env.authServiceUrl,
      method: "GET",
      path: "/api/v1/auth/me",
      token: authorizationHeader,
      timeoutMs: 5000,
    });
  } catch (err) {
    if (err.statusCode === 401 || err.statusCode === 403) {
      throw err;
    }
    const e = new Error(`Failed to contact auth service: ${err.message}`);
    e.statusCode = 502;
    throw e;
  }

  let role = data?.role;
  if (role && typeof role === "object") {
    role = role.value ?? role.name;
  }
  if (String(role).toLowerCase() !== "admin") {
    const e = new Error("Admin privileges required");
    e.statusCode = 403;
    throw e;
  }
  return { token: authorizationHeader, adminUser: data };
}

/*
Arg:
     token: Authorization header.
     method, path, query, body: chuyển tiếp tới auth-service.
Return:
     JSON response từ upstream.
*/

export async function forwardToAuth({ token, method, path, query, body }) {
  return upstreamJson({
    baseUrl: env.authServiceUrl,
    method,
    path,
    token,
    query,
    body,
    timeoutMs: 10000,
  });
}

/*
Arg:
     token, method, path, query, body — tương tự forwardToAuth.
Return:
     Giữ nguyên status HTTP và body (để proxy DELETE trả đúng mã).
*/

export async function forwardToAuthRaw({ token, method, path, query, body }) {
  return upstreamRaw({
    baseUrl: env.authServiceUrl,
    method,
    path,
    token,
    query,
    body,
    timeoutMs: 10000,
  });
}
