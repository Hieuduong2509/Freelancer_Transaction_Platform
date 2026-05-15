import { authPool } from "../db/authPool.js";

/*
Arg:
     userId, token, expiresAt: Date.
Return:
     Row refresh token mới.
*/

export async function insertRefreshToken(userId, token, expiresAt) {
  const r = await authPool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token, expires_at, created_at`,
    [userId, token, expiresAt]
  );
  return r.rows[0];
}

/*
Arg:
     token: Chuỗi refresh.
Return:
     Row hợp lệ (chưa hết hạn) hoặc null.
*/

export async function findValidRefreshToken(token) {
  const r = await authPool.query(
    `SELECT id, user_id, token, expires_at FROM refresh_tokens
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );
  return r.rows[0] ?? null;
}

/*
Arg:
     token: Chuỗi refresh.
Return:
     void — xóa nếu tồn tại.
*/

export async function deleteRefreshToken(token) {
  await authPool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
}
