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
  const user = (process.env["SMTP_USER"] || "").replace(/^["']|["']$/g, "").trim();
  const pass = (process.env["SMTP_APP_PASSWORD"] || "").replace(/[\s"']/g, "");

  console.log(`[email.server] Authenticating with SMTP_USER: "${user}"`);

  if (!user || !pass) {
    console.warn(
      "[email.server] SMTP credentials not configured (SMTP_USER / SMTP_APP_PASSWORD missing).",
    );
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL on port 465
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  return cachedTransporter;
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

    const info = await transporter.sendMail({
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
    });

    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const rawError = err instanceof Error ? err.message : "Unknown SMTP error";
    // Technical error logged strictly to server-side stderr
    console.error("[email.server] Failed to send email via Gmail SMTP:", rawError);
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
              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 0; margin-bottom: 16px;">
                This code expires in <strong>${expiresInMinutes} minutes</strong>. If you did not request this verification, you can safely ignore this email.
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
