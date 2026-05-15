import { marketplacePool } from "../db/marketplacePool.js";

function mapDisputeRow(row) {
  return {
    id: row.id,
    project_id: row.project_id,
    raised_by: row.raised_by,
    reason: row.reason,
    status: row.status,
    resolution: row.resolution,
    resolved_by: row.resolved_by,
    resolved_at: row.resolved_at
      ? new Date(row.resolved_at).toISOString()
      : null,
    created_at: row.created_at
      ? new Date(row.created_at).toISOString()
      : null,
  };
}

/*
Arg:
     userId: id user.
Return:
     Danh sách dispute do user này raised_by.
*/

export async function findDisputesRaisedByUser(userId) {
  const r = await marketplacePool.query(
    `SELECT id, project_id, raised_by, reason, status::text AS status, resolution,
            resolved_by, resolved_at, created_at
     FROM disputes WHERE raised_by = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return r.rows.map(mapDisputeRow);
}

/*
Arg:
     status: string trạng thái hoặc null (lấy tất cả).
     limit, offset: phân trang.
Return:
     Mảng dispute.
*/

export async function findDisputes({ status, limit, offset }) {
  const params = [];
  let where = "";
  if (status) {
    params.push(status);
    where = `WHERE status::text = $1`;
  }
  params.push(limit);
  params.push(offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;
  const sql = `
    SELECT id, project_id, raised_by, reason, status::text AS status, resolution,
           resolved_by, resolved_at, created_at
    FROM disputes
    ${where}
    ORDER BY created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;
  const r = await marketplacePool.query(sql, params);
  return r.rows.map(mapDisputeRow);
}

/*
Arg:
     disputeId: id dispute.
Return:
     Row dispute hoặc null.
*/

export async function findDisputeById(disputeId) {
  const r = await marketplacePool.query(
    `SELECT id, project_id, raised_by, reason, status::text AS status, resolution,
            resolved_by, resolved_at, created_at
     FROM disputes WHERE id = $1`,
    [disputeId]
  );
  if (!r.rows.length) {
    return null;
  }
  return mapDisputeRow(r.rows[0]);
}

/*
Arg:
     disputeId, resolution, resolvedByUserId, resolvedStatus: thường là 'resolved'.
Return:
     void sau khi commit.
*/

export async function markDisputeResolved({
  disputeId,
  resolution,
  resolvedByUserId,
}) {
  await marketplacePool.query(
    `UPDATE disputes
     SET status = 'resolved',
         resolution = $1,
         resolved_by = $2,
         resolved_at = NOW()
     WHERE id = $3`,
    [resolution, resolvedByUserId, disputeId]
  );
}
