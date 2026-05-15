import dotenv from "dotenv";

dotenv.config();

/*
Arg:
     -----
Return:
     Biến môi trường chuẩn hóa cho analytics-service / worker.
*/

export const env = {
  port: Number(process.env.PORT || 8000),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/marketplace_db",
  rabbitmqUrl:
    process.env.RABBITMQ_URL || "amqp://admin:admin@localhost:5672/",
  projectServiceUrl:
    process.env.PROJECT_SERVICE_URL || "http://localhost:8003",
};
