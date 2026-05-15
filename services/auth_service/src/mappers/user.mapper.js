/*
Arg:
     row: Row từ DB (role dạng text).
Return:
     Object response API (snake_case).
*/

export function toUserResponse(row) {
  if (!row) {
    return null;
  }
  const role =
    typeof row.role === "object" && row.role?.value
      ? row.role.value
      : String(row.role || "client").toLowerCase();
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    headline: row.headline,
    role,
    is_verified: row.is_verified,
    is_email_verified: row.is_email_verified,
    is_2fa_enabled: row.is_2fa_enabled,
    is_banned: row.is_banned,
    suspended_until: row.suspended_until
      ? new Date(row.suspended_until).toISOString()
      : null,
    created_at: row.created_at
      ? new Date(row.created_at).toISOString()
      : null,
    updated_at: row.updated_at
      ? new Date(row.updated_at).toISOString()
      : null,
  };
}
