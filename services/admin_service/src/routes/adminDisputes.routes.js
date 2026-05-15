import * as disputeRepository from "../repositories/dispute.repository.js";
import * as paymentsClient from "../clients/paymentsService.client.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

/*
Arg:
     fastify instance.
Return:
     Đăng ký các route dispute / complaints / resolve.
*/

export async function registerAdminDisputeRoutes(fastify) {
  fastify.get(
    "/disputes",
    { preHandler: requireAdmin },
    async (request) => {
      const { status, limit = 50, offset = 0 } = request.query;
      return disputeRepository.findDisputes({
        status: status || null,
        limit: Math.min(Number(limit) || 50, 500),
        offset: Number(offset) || 0,
      });
    }
  );

  fastify.get(
    "/users/:userId/complaints",
    { preHandler: requireAdmin },
    async (request) => {
      const userId = Number(request.params.userId);
      return disputeRepository.findDisputesRaisedByUser(userId);
    }
  );

  fastify.post(
    "/resolve_dispute",
    { preHandler: requireAdmin },
    async (request, reply) => {
      const { dispute_id: disputeId, resolution, escrow_action: escrowAction } =
        request.body || {};
      if (!disputeId || !resolution || !escrowAction) {
        return reply.code(400).send({
          detail: "dispute_id, resolution và escrow_action là bắt buộc",
        });
      }

      const dispute = await disputeRepository.findDisputeById(Number(disputeId));
      if (!dispute) {
        return reply.code(404).send({ detail: "Dispute not found" });
      }

      const token = request.adminContext.token;
      const adminId = request.adminContext.adminUser?.id ?? 1;

      if (escrowAction === "release_to_freelancer") {
        try {
          await paymentsClient.postEscrowRelease({
            token,
            milestoneId: dispute.project_id,
          });
        } catch {
          /* giữ hành vi cũ: bỏ qua lỗi escrow */
        }
      } else if (escrowAction === "refund_to_client") {
        /* endpoint refund chưa có — giữ chỗ */
      }

      await disputeRepository.markDisputeResolved({
        disputeId: Number(disputeId),
        resolution: String(resolution),
        resolvedByUserId: adminId,
      });

      return { message: "Dispute resolved", dispute_id: Number(disputeId) };
    }
  );
}
