# Resolution of Custom Email OTP Registration in Vercel Production (AUTH-OTP-PROD-001)

## 1. Root Cause Analysis

In production serverless deployments (such as Vercel AWS Lambda infrastructure), direct outbound TCP connections on **Port 465 (SMTPS)** are frequently throttled, rate-limited, or blocked by cloud security groups. Additionally, transient socket drops and missing explicit STARTTLS negotiation caused Nodemailer greeting timeouts.

## 2. Technical Solution Implemented

1. **Dual-Port Automatic Failover (587 STARTTLS $\leftrightarrow$ 465 SSL)**:
   - Updated [`src/lib/email.server.ts`](file:///D:/MidNight%20Academy/src/lib/email.server.ts) to default to Port `587` with explicit STARTTLS, which is fully permitted across serverless platforms.
   - If the primary send fails, the transporter automatically catches the error and attempts an immediate retry over the alternate port (`465`).
2. **Supabase Native Email OTP Fallback**:
   - Updated [`src/lib/auth.functions.ts`](file:///D:/MidNight%20Academy/src/lib/auth.functions.ts) so that if SMTP delivery fails or credentials are not yet configured, the system automatically falls back to Supabase's built-in `auth.signInWithOtp` email delivery pipeline.
3. **On-Demand SMTP Diagnostic Health Check**:
   - Added `checkSmtpHealth()` in `src/lib/email.server.ts` to allow admins to verify live SMTP socket handshakes.
4. **PII Masking**:
   - All server-side SMTP error logs mask email addresses and credentials.

---

## 3. Required Vercel Production Environment Variables

Ensure these environment variables are set in the Vercel Dashboard (`Settings -> Environment Variables`):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SECRET_KEY=<your-service-role-key>

# Email / SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-gmail-address@gmail.com>
SMTP_APP_PASSWORD=<your-16-char-google-app-password>
SMTP_FROM_NAME="Midnight Academy"

# AI Configuration
GEMINI_API_KEY=<your-gemini-api-key>
```
