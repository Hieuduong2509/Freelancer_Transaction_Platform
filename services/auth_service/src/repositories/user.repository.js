import { authPool } from "../db/authPool.js";

/*
Arg:
     email: Chuỗi email.
Return:
     Row user hoặc null.
*/

export async function findUserByEmail(email) {
  const r = await authPool.query(
    `SELECT id, email, password_hash, name, phone, headline,
            role::text AS role, is_verified, is_email_verified, is_2fa_enabled,
            two_fa_secret, is_banned, suspended_until, created_at, updated_at
     FROM users WHERE email = $1`,
    [email]
  );
  return r.rows[0] ?? null;
}

/*
Arg:
     userId: id user.
Return:
     Row user hoặc null.
*/

export async function findUserById(userId) {
  const r = await authPool.query(
    `SELECT id, email, password_hash, name, phone, headline,
            role::text AS role, is_verified, is_email_verified, is_2fa_enabled,
            two_fa_secret, is_banned, suspended_until, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return r.rows[0] ?? null;
}

/*
Arg:
     fields: email, passwordHash, name, role, phone, headline.
Return:
     Row user mới.
*/

export async function insertUser(fields) {
  const r = await authPool.query(
    `INSERT INTO users (email, password_hash, name, role, phone, headline)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, password_hash, name, phone, headline,
               role::text AS role, is_verified, is_email_verified, is_2fa_enabled,
               two_fa_secret, is_banned, suspended_until, created_at, updated_at`,
    [
      fields.email,
      fields.passwordHash,
      fields.name,
      fields.role,
      fields.phone ?? null,
      fields.headline ?? null,
    ]
  );
  return r.rows[0];
}

/*
Arg:
     userId, until: Date hoặc null để gỡ suspend.
Return:
     void
*/

export async function updateUserSuspendedUntil(userId, until) {
  await authPool.query(
    `UPDATE users SET suspended_until = $2, updated_at = NOW() WHERE id = $1`,
    [userId, until]
  );
}

/*
Arg:
     userId, banned: boolean.
Return:
     void
*/

export async function updateUserBanned(userId, banned) {
  await authPool.query(
    `UPDATE users SET is_banned = $2, updated_at = NOW() WHERE id = $1`,
    [userId, banned]
  );
}

/*
Arg:
     userId.
Return:
     void — xóa token, verification rồi user.
*/

export async function deleteUserCascade(userId) {
  const c = await authPool.connect();
  try {
    await c.query("BEGIN");
    await c.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
    await c.query(`DELETE FROM verifications WHERE user_id = $1`, [userId]);
    await c.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}

/*
Arg:
     userId.
Return:
     void
*/

export async function setUserEmailVerified(userId) {
  await authPool.query(
    `UPDATE users SET is_email_verified = TRUE, updated_at = NOW() WHERE id = $1`,
    [userId]
  );
}

/*
Arg:
     userId, passwordHash.
Return:
     void
*/

export async function updateUserPasswordHash(userId, passwordHash) {
  await authPool.query(
    `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
    [userId, passwordHash]
  );
}

/*
Arg:
     userId, secret: base32 secret, enabled: boolean.
Return:
     void
*/

export async function updateUserTwoFa(userId, secret, enabled) {
  await authPool.query(
    `UPDATE users SET two_fa_secret = $2, is_2fa_enabled = $3, updated_at = NOW() WHERE id = $1`,
    [userId, secret, enabled]
  );
}

/*
Arg:
     userId.
Return:
     void — đặt is_verified = true.
*/

export async function setUserVerified(userId) {
  await authPool.query(
    `UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1`,
    [userId]
  );
}

/*
Arg:
     role: optional filter role.
Return:
     Mảng user rows.
*/

export async function listUsersOrdered({ role }) {
  if (role) {
    const r = await authPool.query(
      `SELECT id, email, password_hash, name, phone, headline,
              role::text AS role, is_verified, is_email_verified, is_2fa_enabled,
              two_fa_secret, is_banned, suspended_until, created_at, updated_at
       FROM users WHERE role::text = $1 ORDER BY created_at DESC`,
      [role]
    );
    return r.rows;
  }
  const r = await authPool.query(
    `SELECT id, email, password_hash, name, phone, headline,
            role::text AS role, is_verified, is_email_verified, is_2fa_enabled,
            two_fa_secret, is_banned, suspended_until, created_at, updated_at
     FROM users ORDER BY created_at DESC`
  );
  return r.rows;
}

/*
Arg:
     role: optional.
     limit: số bản ghi.
Return:
     User chưa verified (is_verified = false).
*/

export async function listPendingUsers({ role, limit }) {
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
  if (role) {
    const r = await authPool.query(
      `SELECT id, email, name, phone, headline, role::text AS role,
              is_verified, is_email_verified, created_at
       FROM users WHERE is_verified = FALSE AND role::text = $1
       ORDER BY created_at DESC LIMIT $2`,
      [role, lim]
    );
    return r.rows;
  }
  const r = await authPool.query(
    `SELECT id, email, name, phone, headline, role::text AS role,
            is_verified, is_email_verified, created_at
     FROM users WHERE is_verified = FALSE
     ORDER BY created_at DESC LIMIT $1`,
    [lim]
  );
  return r.rows;
}
