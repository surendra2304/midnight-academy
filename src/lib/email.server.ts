/**
 * Server-only email dispatch utility for Midnight Academy using Gmail SMTP and Google App Password.
 */
import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const user = (process.env["SMTP_USER"] || "").trim();
  const pass = (process.env["SMTP_APP_PASSWORD"] || "").trim();

  if (!user || !pass) {
    console.warn(
      "[email.server] SMTP credentials not configured (SMTP_USER / SMTP_APP_PASSWORD missing).",
    );
    return null;
  }

  if (!cachedTransporter) {
    // Port/secure are configurable so production can switch to 587 + STARTTLS
    // if the hosting platform blocks direct outbound SSL on 465.
    const port = Number(process.env["SMTP_PORT"] || 465);
    cachedTransporter = nodemailer.createTransport({
      host: process.env["SMTP_HOST"] || "smtp.gmail.com",
      port,
      secure: process.env["SMTP_SECURE"] ? process.env["SMTP_SECURE"] === "true" : port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
    });
  }

  return cachedTransporter;
}

function describeSmtpError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { code?: string; command?: string; message?: string };
    return [e.code, e.command, e.message].filter(Boolean).join(" | ");
  }
  return String(err);
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return { success: false, error: "SMTP not configured" };
    }

    const fromName = process.env["SMTP_FROM_NAME"] || "Midnight Academy";
    const fromEmail = process.env["SMTP_USER"];
    const from = `"${fromName}" <${fromEmail}>`;

    const message = {
      from,
      to,
      subject,
      text:
        text ||
        html
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      html,
    };

    try {
      const info = await transporter.sendMail(message);
      console.log(`[email.server] Email sent successfully, messageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (firstErr: unknown) {
      // Transient SMTP failures (connection drops, greeting timeouts) are common
      // in serverless environments; one retry with a fresh connection helps.
      console.warn(
        "[email.server] First send attempt failed, retrying once:",
        describeSmtpError(firstErr),
      );
      cachedTransporter = null;
      const retryTransporter = getTransporter();
      if (!retryTransporter) {
        return { success: false, error: "SMTP not configured" };
      }
      const info = await retryTransporter.sendMail(message);
      console.log(`[email.server] Email sent on retry, messageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    }
  } catch (err: unknown) {
    // Technical error logged strictly to server-side stderr (no credentials/PII)
    console.error("[email.server] Failed to send email via Gmail SMTP:", describeSmtpError(err));
    return {
      success: false,
      error: "Unable to deliver verification email. Please verify your email configuration.",
    };
  }
}

/**
 * Pre-formatted HTML template for Evaluation Completion notifications.
 */
export function renderEvaluationCompletedEmail({
  studentName,
  testName,
  score,
  attemptId,
  appUrl,
}: {
  studentName: string;
  testName: string;
  score: number;
  attemptId: string;
  appUrl: string;
}): string {
  const resultUrl = `${appUrl.replace(/\/$/, "")}/result/${attemptId}`;
  const scorePercent = Math.round(score);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Test Evaluation is Ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #131b2e; border: 1px solid #202b42; border-radius: 12px; overflow: hidden; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: 0.05em; text-transform: uppercase;">Midnight Academy</span>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px;">Evaluation Complete</h1>
              <p style="font-size: 15px; line-height: 24px; color: #94a3b8; margin-top: 0; margin-bottom: 20px;">
                Hello ${studentName || "Student"}, your responses for <strong>${testName}</strong> have been evaluated by AI comprehension intelligence.
              </p>
              <div style="background-color: #1a233b; border: 1px solid #2d3b5e; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Comprehension Score</span>
                <span style="display: block; font-size: 42px; font-weight: 800; color: #38bdf8; margin-top: 6px;">${scorePercent}%</span>
              </div>
              <div style="text-align: center; margin-top: 28px; margin-bottom: 16px;">
                <a href="${resultUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">
                  View Full Evaluation & Feedback
                </a>
              </div>
              <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 28px; margin-bottom: 0;">
                Midnight Academy — Understand Before You Solve
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Pre-formatted HTML template for OTP verification emails.
 */
export function renderOtpVerificationEmail({
  otp,
  expiresInMinutes = 10,
}: {
  otp: string;
  expiresInMinutes?: number;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code — Midnight Academy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #131b2e; border: 1px solid #202b42; border-radius: 12px; overflow: hidden; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <span style="font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: 0.05em; text-transform: uppercase;">Midnight Academy</span>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; text-align: center;">Verify Your Email</h1>
              <p style="font-size: 15px; line-height: 24px; color: #94a3b8; margin-top: 0; margin-bottom: 24px; text-align: center;">
                Use the following 6-digit verification code to confirm your email and complete your Midnight Academy account setup:
              </p>
              <div style="background-color: #0b0f19; border: 1px solid #2d3b5e; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.3em; color: #38bdf8; font-family: monospace;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
                Midnight Academy — Understand Before You Solve
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Pre-formatted HTML template for password reset OTP emails.
 */
export function renderPasswordResetEmail({
  otp,
  expiresInMinutes = 10,
}: {
  otp: string;
  expiresInMinutes?: number;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password — Midnight Academy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #131b2e; border: 1px solid #202b42; border-radius: 12px; overflow: hidden; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <span style="font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: 0.05em; text-transform: uppercase;">Midnight Academy</span>
            </td>
          </tr>
          <tr>
            <td>
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; text-align: center;">Reset Your Password</h1>
              <p style="font-size: 15px; line-height: 24px; color: #94a3b8; margin-top: 0; margin-bottom: 24px; text-align: center;">
                We received a request to reset your Midnight Academy password. Use the following 6-digit code to proceed:
              </p>
              <div style="background-color: #0b0f19; border: 1px solid #2d3b5e; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.3em; color: #38bdf8; font-family: monospace;">${otp}</span>
              </div>
              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 0; margin-bottom: 16px;">
                This code expires in <strong>${expiresInMinutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email.
              </p>
              <hr style="border: 0; border-top: 1px solid #202b42; margin: 24px 0 16px 0;" />
              <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
                Midnight Academy — Understand Before You Solve
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
