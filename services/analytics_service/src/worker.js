import amqp from "amqplib";
import { env } from "./config/env.js";
import { marketplacePool } from "./db/marketplacePool.js";
import * as eventRepository from "./repositories/event.repository.js";
import * as metricRepository from "./repositories/metric.repository.js";
import { resolveProjectTypeById } from "./clients/projectService.client.js";

/*
Arg:
     eventData: Object có field type và data (giống message RabbitMQ cũ).
Return:
     void; ném lỗi nếu DB/parse thất bại.
*/

async function processEventPayload(eventData) {
  const eventType = eventData?.type;
  const data = eventData?.data ?? {};
  if (!eventType) {
    throw new Error("Missing event type");
  }

  let resolvedProjectType = data.project_type;
  if (eventType === "escrow.released" && !resolvedProjectType) {
    resolvedProjectType = await resolveProjectTypeById(data.project_id);
  }

  const client = await marketplacePool.connect();
  try {
    await client.query("BEGIN");
    await eventRepository.insertEvent(client, {
      eventType,
      userId: data.user_id,
      data,
    });

    if (eventType === "escrow.released") {
      const meta = { project_type: resolvedProjectType || "unknown" };
      await metricRepository.insertMetric(client, {
        metricName: "revenue",
        value: data.commission_amount ?? 0,
        date: new Date(),
        metaData: meta,
      });
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/*
Arg:
     -----
Return:
     Consumer RabbitMQ queue `events` (durable).
*/

async function main() {
  const conn = await amqp.connect(env.rabbitmqUrl);
  const ch = await conn.createChannel();
  await ch.assertQueue("events", { durable: true });
  await ch.consume(
    "events",
    async (msg) => {
      if (!msg) {
        return;
      }
      try {
        const body = JSON.parse(msg.content.toString());
        await processEventPayload(body);
        ch.ack(msg);
      } catch (err) {
        console.error("Error processing event:", err);
        ch.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
  console.error("Analytics worker started. Waiting for events...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
