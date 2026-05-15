# Auth Service (Node.js)

Đăng ký, đăng nhập, JWT, refresh token, 2FA (TOTP + QR), xác minh email, reset mật khẩu, admin quản user — **PostgreSQL** (`auth_db`).

## Kiến trúc module

| Thư mục | Trách nhiệm |
|---------|-------------|
| `src/repositories/` | Chỉ SQL: `user`, `refreshToken`, `verification`. Không import `clients`. |
| `src/clients/` | Chỉ HTTP: `userService.client.js` (đồng bộ profile sau signup). Không import `repositories`. |
| `src/lib/` | JWT, mật khẩu (SHA-256 + bcrypt như Python), mailer SMTP, token ngẫu nhiên. |
| `src/mappers/` | `user.mapper.js` — chuẩn hóa JSON response. |
| `src/middleware/` | `requireAuth`, `requireAdmin`. |
| `src/routes/` | `authSession`, `authAccount`, `authAdmin` — chỉ điều phối, không trùng logic repository. |

## Chạy

```bash
cd services/auth_service
npm install
npm start
```

`server.js` gọi `ensureAuthSchema` trước khi bind HTTP (ALTER cột tương thích + `CREATE TABLE IF NOT EXISTS` khi DB trống).

## Biến môi trường

- `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM` (mặc định HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`
- `USER_SERVICE_URL`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, …

## Test

```bash
npm test
```

Cần `DATABASE_URL` (PostgreSQL) để chạy test tích hợp signup/login; không có thì test đó được bỏ qua.
