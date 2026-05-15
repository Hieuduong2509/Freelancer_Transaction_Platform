import { env } from "../config/env.js";
import { upstreamJson } from "../lib/httpUpstream.js";

/*
Arg:
     token: Authorization header.
     milestoneId: id milestone để release escrow.
Return:
     JSON từ payments-service.
*/

export async function postEscrowRelease({ token, milestoneId }) {
  return upstreamJson({
    baseUrl: env.paymentsServiceUrl,
    method: "POST",
    path: "/api/v1/payments/escrow/release",
    token,
    body: { milestone_id: milestoneId },
    timeoutMs: 5000,
  });
}
