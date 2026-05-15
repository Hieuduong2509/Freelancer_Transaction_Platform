import { env } from "../config/env.js";
import { upstreamJson } from "../lib/httpUpstream.js";

/*
Arg:
     token, method, path, query, body.
Return:
     JSON từ user-service.
*/

export async function forwardToUserService({
  token,
  method,
  path,
  query,
  body,
}) {
  return upstreamJson({
    baseUrl: env.userServiceUrl,
    method,
    path,
    token,
    query,
    body,
    timeoutMs: 10000,
  });
}
