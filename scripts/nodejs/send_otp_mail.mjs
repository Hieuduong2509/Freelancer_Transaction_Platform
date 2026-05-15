import nodemailer from "nodemailer";
import process from "node:process";

/*
Arg:
     argv: recipient, base64_subject, base64_body (giống script PHP cũ).
     env: SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL, tùy chọn SMTP_PORT,
          SMTP_FROM_NAME, SMTP_USE_TLS, SMTP_SECURE (465).
Return:
     Thoát 0 khi gửi thành công, 1 khi lỗi (ghi stderr).
*/

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`${name} is required.`);
    process.exit(1);
  }
  return v;
}

const [, , recipient, b64Subject, b64Body] = process.argv;
if (!recipient || !b64Subject || !b64Body) {
  console.error(
    "Usage: node send_otp_mail.mjs <recipient> <base64_subject> <base64_body>"
  );
  process.exit(1);
}

const subject = Buffer.from(b64Subject, "base64").toString("utf8");
const body = Buffer.from(b64Body, "base64").toString("utf8");
if (subject === "" && b64Subject !== "") {
  console.error("Invalid base64 subject.");
  process.exit(1);
}

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 587);
const user = requireEnv("SMTP_USERNAME");
const pass = requireEnv("SMTP_PASSWORD");
const fromEmail = process.env.SMTP_FROM_EMAIL || user;
const fromName = process.env.SMTP_FROM_NAME || "CodeDesign";
const useTls = (process.env.SMTP_USE_TLS || "true").toLowerCase() !== "false";
const secure = port === 465 || process.env.SMTP_SECURE === "1";

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  ...(useTls && !secure ? { requireTLS: true } : {}),
});

try {
  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: recipient,
    subject,
    text: body,
  });
} catch (err) {
  console.error(err?.message || String(err));
  process.exit(1);
}

process.exit(0);
