import { authPool } from "../db/authPool.js";

function mapUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    headline: row.headline,
    role: row.role,
    is_verified: row.is_verified,
    is_email_verified: row.is_email_verified,
    is_2fa_enabled: row.is_2fa_enabled,
    is_banned: row.is_banned,
    suspended_until: row.suspended_until
      ? new Date(row.suspended_until).toISOString()
      : null,
    created_at: row.created_at
      ? new Date(row.created_at).toISOString()
      : null,
  };
}

/*
Arg:
     userId: number id user trên auth_db.
Return:
     Object user hoặc null nếu không tồn tại.
*/

export async function findAuthUserById(userId) {
  const r = await authPool.query(
    `SELECT id, email, name, phone, headline, role::text AS role, is_verified,
            is_email_verified, is_2fa_enabled, is_banned, suspended_until, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!r.rows.length) {
    return null;
  }
  return mapUserRow(r.rows[0]);
}
