/*
Arg:
     reply: Fastify reply.
     raw: Kết quả upstreamRaw { status, contentType, body }.
Return:
     Gửi response và trả về undefined.
*/

export function replyFromUpstream(reply, raw) {
  const { status, contentType, body } = raw;
  reply.code(status);
  if (!body) {
    return reply.send();
  }
  if (contentType && contentType.includes("application/json")) {
    try {
      return reply.send(JSON.parse(body));
    } catch {
      return reply.type("text/plain").send(body);
    }
  }
  return reply.type(contentType || "text/plain").send(body);
}
