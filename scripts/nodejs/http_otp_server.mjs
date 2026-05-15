import http from "node:http";
import nodemailer from "nodemailer";
import process from "node:process";

/*
Arg:
     HTTP POST JSON { email, otp } — thay thế sendMail.php khi chạy: node http_otp_server.mjs
     Biến môi trường: PORT (mặc định 8787), SMTP_* giống send_otp_mail.mjs.
Return:
     JSON { success } hoặc { error }, mã HTTP tương ứng.
*/

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const portSmtp = Number(process.env.SMTP_PORT || 587);
const user = requireEnv("SMTP_USERNAME");
const pass = requireEnv("SMTP_PASSWORD");
const fromEmail = process.env.SMTP_FROM_EMAIL || user;
const fromName = process.env.SMTP_FROM_NAME || "CodeDesign Marketplace";
const useTls = (process.env.SMTP_USE_TLS || "true").toLowerCase() !== "false";
const secure = portSmtp === 465 || process.env.SMTP_SECURE === "1";

const transporter = nodemailer.createTransport({
  host,
  port: portSmtp,
  secure,
  auth: { user, pass },
  ...(useTls && !secure ? { requireTLS: true } : {}),
});

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST" || req.url !== "/") {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "Invalid JSON body" }));
    return;
  }
  const email = body.email || body.toEmail;
  const otp = body.otp || body.otpCode;
  if (!email || !otp) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "Thiếu email hoặc mã OTP" }));
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "Email không hợp lệ" }));
    return;
  }
  if (!/^[0-9]{4,8}$/.test(String(otp))) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "Mã OTP không hợp lệ" }));
    return;
  }
  const html = `
        <div style='font-family:sans-serif'>
            <h2>Xin chào,</h2>
            <p>Mã OTP xác thực của bạn:</p>
            <p><b>Mã OTP:</b> <span style='font-size:24px;color:#007bff'>${otp}</span></p>
            <p>Mã có hiệu lực giới hạn. Không chia sẻ mã này.</p>
            <hr>
            <small>Trân trọng,<br>${fromName}</small>
        </div>
    `;
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Mã OTP xác thực",
      text: `Mã OTP của bạn là: ${otp}`,
      html,
    });
    res.writeHead(200);
    res.end(
      JSON.stringify({
        success: true,
        message: `Đã gửi OTP đến email ${email}`,
      })
    );
  } catch (err) {
    res.writeHead(500);
    res.end(
      JSON.stringify({
        error: `Không gửi được email: ${err?.message || String(err)}`,
      })
    );
  }
});

const listenPort = Number(process.env.PORT || 8787);
server.listen(listenPort, () => {
  console.error(`http_otp_server listening on ${listenPort}`);
});
