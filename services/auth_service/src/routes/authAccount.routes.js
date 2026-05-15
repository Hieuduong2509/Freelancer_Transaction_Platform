import * as userRepository from "../repositories/user.repository.js";
import * as verificationRepository from "../repositories/verification.repository.js";
import * as passwordLib from "../lib/password.js";
import { generateUrlSafeToken } from "../lib/urlToken.js";
import { toUserResponse } from "../mappers/user.mapper.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

/*
Arg:
     fastify, requireAuth middleware.
Return:
     /me, /enable-2fa, /verify (identity).
*/

export async function registerAuthAccountRoutes(fastify, { requireAuth }) {
  const authPre = { preHandler: [requireAuth] };

  fastify.get("/me", authPre, async (request) => {
    return toUserResponse(request.authUser);
  });

  fastify.post("/enable-2fa", authPre, async (request, reply) => {
    const password = request.body?.password;
    if (!(await passwordLib.verifyPassword(password || "", request.authUser.password_hash))) {
      return reply.code(401).send({ detail: "Invalid password" });
    }
    const secret = speakeasy.generateSecret({ length: 20 }).base32;
    await userRepository.updateUserTwoFa(request.authUser.id, secret, true);

    const label = encodeURIComponent(request.authUser.email);
    const issuer = encodeURIComponent("CodeDesign Marketplace");
    const otpauthUrl = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}`;

    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    return { secret, qr_code_url: qrCodeUrl };
  });

  fastify.post("/verify", authPre, async (request) => {
    const documentUrl = request.body?.document_url;
    const documentType = request.body?.document_type;
    const token = generateUrlSafeToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const row = await verificationRepository.insertVerification({
      userId: request.authUser.id,
      verificationType: "identity",
      token,
      expiresAt,
    });
    await verificationRepository.updateVerificationDocuments(
      row.id,
      documentUrl,
      documentType
    );
    return {
      message: "Verification request submitted",
      verification_id: row.id,
    };
  });
}
