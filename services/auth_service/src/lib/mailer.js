import nodemailer from "nodemailer";

export class MailerError extends Error {
  constructor(message) {
    super(message);
    this.name = "MailerError";
  }
}

/*
Arg:
     -----
Return:
     true nếu đủ SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL.
*/

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_USERNAME &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM_EMAIL
  );
}

/*
Arg:
     toEmail, subject, body: Nội dung text/plain.
Return:
     void; ném MailerError nếu lỗi.
*/

export async function sendTransactionalEmail(toEmail, subject, body) {
  if (!isSmtpConfigured()) {
    throw new MailerError(
      "SMTP chưa cấu hình. Đặt SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL."
    );
  }
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;
  const fromName =
    process.env.SMTP_FROM_NAME || "CodeDesign Marketplace";
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
      to: toEmail,
      subject,
      text: body,
    });
  } catch (err) {
    throw new MailerError(
      err?.message ? `Lỗi SMTP: ${err.message}` : "Lỗi SMTP không xác định"
    );
  }
}
