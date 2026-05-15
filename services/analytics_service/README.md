# Analytics Service (Node.js)

API đọc tổng hợp từ PostgreSQL (`events`, `metrics`) và **worker** tiêu thụ queue RabbitMQ `events` (giống bản Python).

## Cấu trúc

| Thư mục | Trách nhiệm |
|----------|----------------|
| `src/repositories/` | Chỉ SQL: `event.repository.js`, `metric.repository.js`. Không import `clients`. |
| `src/clients/` | Chỉ HTTP: `projectService.client.js` (worker gọi khi cần `project_type`). Không import `repositories`. |
| `src/routes/` | `analyticsSummary.routes.js`, `analyticsEvents.routes.js` — chỉ gọi repository. |
| `src/worker.js` | Consumer AMQP; gọi repository + client project (không import `routes`). |

## Chạy API

```bash
cd services/analytics_service
npm install
npm start
```

## Chạy worker

```bash
npm run worker
```

Cần `DATABASE_URL`, `RABBITMQ_URL`, `PROJECT_SERVICE_URL` (worker gọi project-service khi thiếu `project_type` trong payload `escrow.released`).

## HTTP

- `GET /health`
- `GET /api/v1/analytics/summary`
- `GET /api/v1/analytics/events?event_type=&limit=`
