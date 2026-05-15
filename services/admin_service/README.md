# Admin Service (Node.js)

Microservice quản trị: proxy tới auth / user / project / payments, và đọc/ghi dispute trên PostgreSQL (`marketplace_db`) + đọc user chi tiết trên `auth_db`.

## Cấu trúc module

| Thư mục | Trách nhiệm |
|----------|----------------|
| `src/clients/` | Chỉ HTTP tới service ngoài (mỗi file một service). Không import `repositories`. |
| `src/repositories/` | Chỉ truy vấn PostgreSQL (mỗi file một “aggregate” DB). Không import `clients`. |
| `src/routes/` | Đăng ký HTTP; gọi `clients` hoặc `repositories` tùy endpoint, không trùng logic giữa các file route. |
| `src/middleware/` | Xác thực admin qua auth-service (`/me`). |
| `src/lib/` | Tiện ích HTTP thuần (không nghiệp vụ). |

## Chạy

```bash
cd services/admin_service
npm install
npm start
```

Biến môi trường: `PORT`, `DATABASE_URL`, `AUTH_DATABASE_URL`, `AUTH_SERVICE_URL`, `USER_SERVICE_URL`, `PROJECT_SERVICE_URL`, `PAYMENTS_SERVICE_URL`.

## Docker

Image cài dependency vào layer build; volume ẩn `admin-service-node-modules` giữ `node_modules` khi bind-mount mã nguồn.

## API

Tiền tố: `/api/v1/admin` (giữ tương thích với bản Python cũ). Header: `Authorization: Bearer <token>` (admin).
