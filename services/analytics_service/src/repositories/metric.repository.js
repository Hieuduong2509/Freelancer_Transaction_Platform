import { marketplacePool } from "../db/marketplacePool.js";

/*
Arg:
     db: Pool hoặc Client.
     metricName: Tên metric (vd revenue).
     value: Số thực.
     date: Date hoặc ISO string.
     metaData: Object hoặc null.
Return:
     void
*/

export async function insertMetric(db, { metricName, value, date, metaData }) {
  const d = date instanceof Date ? date : new Date(date);
  await db.query(
    `INSERT INTO metrics (metric_name, value, date, meta_data)
     VALUES ($1, $2, $3, $4::json)`,
    [
      metricName,
      Number(value) || 0,
      d.toISOString(),
      JSON.stringify(metaData ?? {}),
    ]
  );
}

/*
Arg:
     -----
Return:
     { total: number, rows: Array<{ meta_data, value }> } cho metric_name = revenue.
*/

export async function getRevenueRowsForSummary() {
  const r = await marketplacePool.query(
    `SELECT meta_data, value FROM metrics WHERE metric_name = $1`,
    ["revenue"]
  );
  let total = 0;
  const rows = r.rows.map((row) => {
    const v = Number(row.value) || 0;
    total += v;
    return { meta_data: row.meta_data, value: v };
  });
  return { total, rows };
}
