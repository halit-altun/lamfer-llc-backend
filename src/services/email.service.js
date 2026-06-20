const nodemailer = require("nodemailer");

const AMAZON_ORDER_HISTORY_URL =
  "https://www.amazon.com/gp/your-account/order-history?ref_=ya_d_c_yo";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  if (host === "smtp.gmail.com" || !host) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function buildFromAddress() {
  const address = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@lamfer.com";
  const name = process.env.SMTP_FROM_NAME || "Lamfer Product Reviews";
  return `"${name}" <${address}>`;
}

function buildReviewEmailHtml({ productName, reviewTitle, rating, message }) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const safeTitle = String(reviewTitle)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const safeMessage = message
    ? String(message)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br />")
    : "<em>No written feedback provided.</em>";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Customer Review — ${productName}</title>
</head>
<body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;color:#222;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:24px;">
    <p style="margin:0 0 8px;font-size:14px;color:#666;">New customer feedback</p>
    <h2 style="margin:0 0 20px;font-size:20px;color:#111;">${productName}</h2>
    <p style="margin:0 0 6px;font-size:13px;color:#666;">Rating</p>
    <p style="margin:0 0 16px;font-size:16px;">${stars} (${rating}/5)</p>
    <p style="margin:0 0 6px;font-size:13px;color:#666;">Review title</p>
    <p style="margin:0 0 16px;font-size:16px;">${safeTitle}</p>
    <p style="margin:0 0 6px;font-size:13px;color:#666;">Feedback</p>
    <p style="margin:0;font-size:15px;line-height:1.6;">${safeMessage}</p>
  </div>
</body>
</html>`;
}

async function sendReviewFeedbackEmail({ to, productName, reviewTitle, rating, message }) {
  const transporter = createTransporter();
  const from = buildFromAddress();
  const subject = `Customer review: ${reviewTitle} — ${productName} (${rating}/5)`;
  const text = [
    "New customer feedback",
    "",
    `Product: ${productName}`,
    `Rating: ${rating}/5`,
    `Title: ${reviewTitle}`,
    "",
    message || "(no message)",
  ].join("\n");
  const html = buildReviewEmailHtml({ productName, reviewTitle, rating, message });

  if (!transporter) {
    return { sent: false, logged: true };
  }

  await transporter.sendMail({
    from,
    to,
    replyTo: process.env.SMTP_REPLY_TO || process.env.SMTP_USER,
    subject,
    text,
    html,
    priority: "normal",
  });

  return { sent: true, logged: false };
}

module.exports = {
  AMAZON_ORDER_HISTORY_URL,
  sendReviewFeedbackEmail,
};
