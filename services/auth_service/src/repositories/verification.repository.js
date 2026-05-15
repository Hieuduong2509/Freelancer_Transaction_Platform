import { authPool } from "../db/authPool.js";

/*
Arg:
     userId, verificationType, token, expiresAt.
Return:
     Row verification (có id).
*/

export async function insertVerification({
  userId,
  verificationType,
  token,
  expiresAt,
}) {
  const r = await authPool.query(
    `INSERT INTO verifications (user_id, verification_type, token, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, verification_type, token, status, expires_at, created_at`,
    [userId, verificationType, token, expiresAt]
  );
  return r.rows[0];
}

/*
Arg:
     verificationId, documentUrl, documentType.
Return:
     void
*/

export async function updateVerificationDocuments(
  verificationId,
  documentUrl,
  documentType
) {
  await authPool.query(
    `UPDATE verifications SET document_url = $2, document_type = $3 WHERE id = $1`,
    [verificationId, documentUrl, documentType]
  );
}

/*
Arg:
     token: Chuỗi token.
Return:
     Row hợp lệ hoặc null.
*/

export async function findValidVerificationByToken(token) {
  const r = await authPool.query(
    `SELECT id, user_id, verification_type, token, status, document_url,
            document_type, expires_at, created_at
     FROM verifications
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );
  return r.rows[0] ?? null;
}
