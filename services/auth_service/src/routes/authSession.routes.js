import * as userRepository from "../repositories/user.repository.js";
import * as refreshTokenRepository from "../repositories/refreshToken.repository.js";
import * as verificationRepository from "../repositories/verification.repository.js";
import * as passwordLib from "../lib/password.js";
import { createAccessToken } from "../lib/jwtTokens.js";
import {
  sendTransactionalEmail,
  isSmtpConfigured,
  MailerError,
} from "../lib/mailer.js";
import { generateUrlSafeToken } from "../lib/urlToken.js";
import { toUserResponse } from "../mappers/user.mapper.js";
import { syncUserProfilePut } from "../clients/userService.client.js";
import { env } from "../config/env.js";
import validator from "validator";
import speakeasy from "speakeasy";

const ALLOWED_ROLES = new Set(["client", "freelancer", "admin"]);

/*
Arg:
     fastify.
Return:
     Routes đăng ký / đăng nhập / token / email reset.
*/

export async function registerAuthSessionRoutes(fastify) {
  fastify.post("/signup", async (request, reply) => {
    const b = request.body || {};
    const email = (b.email || "").trim().toLowerCase();
    if (!validator.isEmail(email)) {
      return reply.code(422).send({ detail: "Invalid email" });
    }
    let role = (b.role || "client").toString().toLowerCase();
    if (!ALLOWED_ROLES.has(role)) {
      role = "client";
    }
    const password = (b.password || "").trim();
    if (password.length < 6) {
      return reply.code(400).send({ detail: "Password too short" });
    }
    const existing = await userRepository.findUserByEmail(email);
    if (existing) {
      return reply.code(400).send({ detail: "Email already registered" });
    }
    const passwordHash = await passwordLib.hashPassword(password);
    const dbUser = await userRepository.insertUser({
      email,
      passwordHash,
      name: b.name || "",
      role,
      phone: b.phone ?? null,
      headline: b.headline ?? null,
    });

    const token = generateUrlSafeToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const verification = await verificationRepository.insertVerification({
      userId: dbUser.id,
      verificationType: "email",
      token,
      expiresAt,
    });

    if (isSmtpConfigured()) {
      try {
        await sendTransactionalEmail(
          dbUser.email,
          "Xác minh email — CodeDesign Marketplace",
          "Mã xác minh email của bạn (dán vào form xác minh trong ứng dụng):\n\n" +
            `${verification.token}\n`
        );
      } catch (err) {
        const msg = err instanceof MailerError ? err.message : String(err);
        console.error(`SMTP failed for ${dbUser.email}:`, msg);
        console.error(`Email verification token for ${dbUser.email}:`, verification.token);
      }
    } else {
      console.error(`Email verification token for ${dbUser.email}:`, verification.token);
    }

    const profilePayload = {
      display_name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      headline: dbUser.headline,
      categories: [],
      badges: [],
    };
    await syncUserProfilePut(dbUser.id, profilePayload);

    return reply.code(201).send(toUserResponse(dbUser));
  });

  fastify.post("/login", async (request, reply) => {
    const b = request.body || {};
    const email = (b.email || "").trim().toLowerCase();
    const user = await userRepository.findUserByEmail(email);
    if (!user || !(await passwordLib.verifyPassword(b.password || "", user.password_hash))) {
      return reply.code(401).send({ detail: "Incorrect email or password" });
    }
    if (user.is_banned) {
      return reply.code(403).send({
        detail: "Tài khoản của bạn đã bị khóa bởi quản trị viên.",
      });
    }
    if (user.suspended_until) {
      const until = new Date(user.suspended_until);
      if (until > new Date()) {
        return reply.code(403).send({
          detail: `Tài khoản tạm khóa đến ${until.toISOString()}.`,
        });
      }
      await userRepository.updateUserSuspendedUntil(user.id, null);
    }
    if (user.is_2fa_enabled) {
      const code = b.two_fa_code;
      if (!code) {
        return reply.code(400).send({ detail: "2FA code required" });
      }
      const ok = speakeasy.totp.verify({
        secret: user.two_fa_secret,
        encoding: "base32",
        token: String(code),
        window: 1,
      });
      if (!ok) {
        return reply.code(401).send({ detail: "Invalid 2FA code" });
      }
    }

    const accessToken = createAccessToken(
      { sub: user.id, role: String(user.role).toLowerCase() },
      env.accessTokenExpireMinutes
    );
    const refreshPlain = generateUrlSafeToken();
    const refreshExpires = new Date(
      Date.now() + env.refreshTokenExpireDays * 24 * 60 * 60 * 1000
    );
    const refreshRow = await refreshTokenRepository.insertRefreshToken(
      user.id,
      refreshPlain,
      refreshExpires
    );

    const fresh = await userRepository.findUserById(user.id);
    return {
      access_token: accessToken,
      refresh_token: refreshRow.token,
      token_type: "bearer",
      user: toUserResponse(fresh),
    };
  });

  fastify.post("/refresh", async (request, reply) => {
    const token = request.body?.refresh_token;
    if (!token) {
      return reply.code(401).send({ detail: "Invalid or expired refresh token" });
    }
    const dbToken = await refreshTokenRepository.findValidRefreshToken(token);
    if (!dbToken) {
      return reply.code(401).send({ detail: "Invalid or expired refresh token" });
    }
    const user = await userRepository.findUserById(dbToken.user_id);
    if (!user) {
      return reply.code(401).send({ detail: "User not found" });
    }
    const accessToken = createAccessToken(
      { sub: user.id, role: String(user.role).toLowerCase() },
      env.accessTokenExpireMinutes
    );
    return {
      access_token: accessToken,
      refresh_token: token,
      token_type: "bearer",
    };
  });

  fastify.post("/logout", async (request) => {
    const token = request.body?.refresh_token;
    if (token) {
      await refreshTokenRepository.deleteRefreshToken(token);
    }
    return { message: "Logged out successfully" };
  });

  fastify.post("/verify-email", async (request, reply) => {
    const tok = request.body?.token;
    const verification = await verificationRepository.findValidVerificationByToken(
      tok
    );
    if (!verification || verification.verification_type !== "email") {
      return reply.code(400).send({
        detail: "Invalid or expired verification token",
      });
    }
    await userRepository.setUserEmailVerified(verification.user_id);
    const user = await userRepository.findUserById(verification.user_id);
    return { message: "Email verified successfully", user: toUserResponse(user) };
  });

  fastify.post("/request-password-reset", async (request) => {
    const email = (request.body?.email || "").trim().toLowerCase();
    const user = await userRepository.findUserByEmail(email);
    if (user) {
      const token = generateUrlSafeToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const verification = await verificationRepository.insertVerification({
        userId: user.id,
        verificationType: "password_reset",
        token,
        expiresAt,
      });
      if (isSmtpConfigured()) {
        try {
          await sendTransactionalEmail(
            user.email,
            "Đặt lại mật khẩu — CodeDesign Marketplace",
            "Mã đặt lại mật khẩu (dán vào form trong ứng dụng, có thời hạn):\n\n" +
              `${verification.token}\n`
          );
        } catch (err) {
          const msg = err instanceof MailerError ? err.message : String(err);
          console.error(`SMTP password reset failed for ${user.email}:`, msg);
          console.error(`Password reset token for ${user.email}:`, verification.token);
        }
      } else {
        console.error(`Password reset token for ${user.email}:`, verification.token);
      }
    }
    return { message: "If email exists, reset link has been sent" };
  });

  fastify.post("/confirm-reset", async (request, reply) => {
    const tok = request.body?.token;
    const newPassword = request.body?.new_password;
    if (!tok) {
      return reply.code(400).send({ detail: "Invalid or expired reset token" });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return reply.code(400).send({ detail: "Password must be at least 6 characters" });
    }
    const verification = await verificationRepository.findValidVerificationByToken(
      tok
    );
    if (!verification || verification.verification_type !== "password_reset") {
      return reply.code(400).send({ detail: "Invalid or expired reset token" });
    }
    const user = await userRepository.findUserById(verification.user_id);
    if (!user) {
      return reply.code(404).send({ detail: "User not found" });
    }
    const passwordHash = await passwordLib.hashPassword(newPassword);
    await userRepository.updateUserPasswordHash(user.id, passwordHash);
    return { message: "Password reset successfully" };
  });

  // GET /api/v1/auth/users/:userId - Public/Internal info for microservice sync
  fastify.get("/users/:userId", async (request, reply) => {
    const userId = Number(request.params.userId);
    if (isNaN(userId)) {
      return reply.code(400).send({ detail: "Invalid user ID" });
    }
    const user = await userRepository.findUserById(userId);
    if (!user) {
      return reply.code(404).send({ detail: "User not found" });
    }
    return toUserResponse(user);
  });
}

