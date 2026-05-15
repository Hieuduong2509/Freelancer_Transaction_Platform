/*
Arg:
     baseUrl: Gốc URL service (không có slash cuối).
     method: GET, POST, …
     path: Đường dẫn bắt đầu bằng /.
     token: Bearer token đầy đủ (header Authorization) hoặc null.
     query: Record query string hoặc undefined.
     body: Object JSON serializable hoặc undefined.
     timeoutMs: Hết thời gian chờ.
Return:
     { status: number, contentType: string|null, body: string }
*/

export async function upstreamRaw({
  baseUrl,
  method,
  path,
  token,
  query,
  body,
  timeoutMs = 10000,
}) {
  const url = new URL(path.replace(/^\//, ""), `${baseUrl.replace(/\/$/, "")}/`);
  if (query && typeof query === "object") {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }
  const headers = { Accept: "application/json" };
  if (token) {
    headers.Authorization = token;
  }
  let initBody;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    initBody = JSON.stringify(body);
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: initBody,
      signal: controller.signal,
    });
    const contentType = res.headers.get("content-type");
    const text = await res.text();
    return { status: res.status, contentType, body: text };
  } catch (err) {
    if (err.name === "AbortError") {
      const e = new Error("Upstream timeout");
      e.statusCode = 504;
      throw e;
    }
    const e = new Error(err.message || "Upstream network error");
    e.statusCode = 502;
    throw e;
  } finally {
    clearTimeout(t);
  }
}

/*
Arg:
     Cùng tham số upstreamRaw.
Return:
     Parsed JSON nếu có; nếu body rỗng trả null. Ném Error với .statusCode nếu status >= 400.
*/

export async function upstreamJson(args) {
  const { status, contentType, body: raw } = await upstreamRaw(args);
  let data = null;
  if (raw) {
    if (contentType && contentType.includes("application/json")) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    } else {
      data = raw;
    }
  }
  if (status >= 400) {
    let msg = "Upstream error";
    if (typeof data === "string") {
      msg = data;
    } else if (data && typeof data === "object" && data.detail !== undefined) {
      msg =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail);
    }
    const err = new Error(msg);
    err.statusCode = status;
    err.detail = data;
    throw err;
  }
  if (data === undefined && (!raw || raw === "")) {
    return null;
  }
  return data;
}
