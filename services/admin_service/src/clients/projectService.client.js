import { env } from "../config/env.js";
import { upstreamJson, upstreamRaw } from "../lib/httpUpstream.js";

/*
Arg:
     token, method, path, query, body.
Return:
     JSON từ project-service.
*/

export async function forwardToProjectService({
  token,
  method,
  path,
  query,
  body,
}) {
  return upstreamJson({
    baseUrl: env.projectServiceUrl,
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
     Giống forwardToProjectService nhưng trả raw (status + body).
Return:
     Kết quả upstreamRaw.
*/

export async function forwardToProjectServiceRaw({
  token,
  method,
  path,
  query,
  body,
}) {
  return upstreamRaw({
    baseUrl: env.projectServiceUrl,
    method,
    path,
    token,
    query,
    body,
    timeoutMs: 10000,
  });
}
