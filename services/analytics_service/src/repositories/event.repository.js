import { marketplacePool } from "../db/marketplacePool.js";

/*
Arg:
     db: pg.Pool hoặc pg.PoolClient (transaction).
     eventType: Chuỗi loại sự kiện.
     userId: id user hoặc null.
     data: Object JSON (payload).
Return:
     void
*/

export async function insertEvent(db, { eventType, userId, data }) {
  await db.query(
    `INSERT INTO events (event_type, user_id, data)
     VALUES ($1, $2, $3::json)`,
    [eventType, userId ?? null, JSON.stringify(data ?? {})]
  );
}

/*
Arg:
     db: Pool (đọc tổng hợp không cần transaction).
Return:
     Số user_id khác nhau (bỏ null).
*/

export async function countDistinctUserIds(db = marketplacePool) {
  const r = await db.query(
    `SELECT COUNT(DISTINCT user_id)::int AS c
     FROM events
     WHERE user_id IS NOT NULL`
  );
  return r.rows[0]?.c ?? 0;
}

/*
Arg:
     eventType: Chuỗi event_type cần đếm.
     db: Pool (mặc định marketplacePool).
Return:
     Số dòng events.
*/

export async function countByEventType(eventType, db = marketplacePool) {
  const r = await db.query(
    `SELECT COUNT(*)::int AS c FROM events WHERE event_type = $1`,
    [eventType]
  );
  return r.rows[0]?.c ?? 0;
}

/*
Arg:
     eventType: optional filter.
     limit: tối đa số bản ghi.
Return:
     Mảng event (snake_case fields).
*/

export async function findEvents({ eventType, limit }) {
  const lim = Math.min(Math.max(Number(limit) || 100, 1), 500);
  if (eventType) {
    const r = await marketplacePool.query(
      `SELECT id, event_type, user_id, data, created_at
       FROM events
       WHERE event_type = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [eventType, lim]
    );
    return r.rows.map(mapEventRow);
  }
  const r = await marketplacePool.query(
    `SELECT id, event_type, user_id, data, created_at
     FROM events
     ORDER BY created_at DESC
     LIMIT $1`,
    [lim]
  );
  return r.rows.map(mapEventRow);
}

function mapEventRow(row) {
  return {
    id: row.id,
    event_type: row.event_type,
    user_id: row.user_id,
    data: row.data,
    created_at: row.created_at
      ? new Date(row.created_at).toISOString()
      : null,
  };
}
