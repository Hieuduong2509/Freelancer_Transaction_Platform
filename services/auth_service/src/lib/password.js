import crypto from "crypto";
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

/*
Arg:
     password: Chuỗi mật khẩu gốc.
Return:
     Chuỗi SHA-256 hex (pre-hash giống Python).
*/

export function prehashPassword(password) {
  return crypto.createHash("sha256").update(password, "utf8").digest("hex");
}

/*
Arg:
     password: Mật khẩu gốc.
Return:
     bcrypt hash của pre-hash.
*/

export async function hashPassword(password) {
  const h = prehashPassword(password);
  return bcrypt.hash(h, BCRYPT_ROUNDS);
}

/*
Arg:
     password: Mật khẩu gốc.
     passwordHash: Hash đã lưu DB.
Return:
     true nếu khớp.
*/

export async function verifyPassword(password, passwordHash) {
  const h = prehashPassword(password);
  return bcrypt.compare(h, passwordHash);
}
