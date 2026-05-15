/*
Arg:
     pool: pg.Pool.
Return:
     void — tạo bảng nếu chưa có; ALTER cột tương thích bản Python.
*/

const CREATE_USERS = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  headline TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'client',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_2fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  suspended_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
`;

const CREATE_REFRESH = `
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const CREATE_VERIFICATIONS = `
CREATE TABLE IF NOT EXISTS verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  token VARCHAR(512) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  document_url VARCHAR(2048),
  document_type VARCHAR(100),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export async function ensureAuthSchema(pool) {
  // 1. Ensure tables exist
  const { rows } = await pool.query(`SELECT to_regclass('public.users') AS reg`);
  if (!rows[0]?.reg) {
    await pool.query(CREATE_USERS);
    await pool.query(CREATE_REFRESH);
    await pool.query(CREATE_VERIFICATIONS);
  }

  // 2. Ensure columns exist (for backward compatibility/updates)
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE`
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ`
  );
  await pool.query(
    `ALTER TABLE verifications ADD COLUMN IF NOT EXISTS document_type VARCHAR(100)`
  );
}

