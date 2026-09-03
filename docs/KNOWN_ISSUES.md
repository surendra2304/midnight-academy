# Known Issues & Bug Tracking Log

## Critical Issues

---

### Issue: `AUTH-OTP-PROD-001`

- **Title**: Production OTP Email Delivery Failure
- **Status**: `OPEN`
- **Severity**: `CRITICAL`
- **Symptom**: On the live production site (`https://midnight-academy-one.vercel.app/auth`), entering an email and clicking "Send Verification Code" results in an error toast:
  > _"Unable to send the verification email right now. Please try again."_
- **Expected Behavior**: The serverless function successfully dispatches a 6-digit OTP email via Gmail SMTP, returns a 200 response with `{ success: true, resendInSeconds: 60 }`, and transitions the UI to Step 2 (OTP code input).
- **Actual Behavior**: The request returns `{ error: "delivery_failed", message: "Unable to send the verification email right now. Please try again." }`.
- **Likely Area**: Vercel Serverless environment variable provisioning, or outgoing SMTP connection handling from Vercel's runtime environment.
- **Relevant Files**:
  - `src/lib/email.server.ts`
  - `src/lib/auth.functions.ts`
  - `src/lib/otp.server.ts`
  - `src/routes/auth.tsx`
- **What Has Already Been Tried**:
  1. _Local SMTP Testing_: Authenticating with the Gmail App Password and dispatching emails directly from local Node environments works without error.
  2. _Password Sanitization_: Fixed a bug where `.replace(/[\s\"']/g, "")` stripped whitespace and altered the password string. Replaced with safe `.trim()`.
  3. _Transactional Order_: Ensured `sendEmail()` is called _before_ `saveOtpRecord()`, preventing users from being locked into cooldowns if delivery fails.
  4. _Environment Variable Verification_: Confirmed `SMTP_USER` and `SMTP_APP_PASSWORD` are present in Vercel project settings.
- **Next Recommended Investigation**:
  1. Verify how Vercel function instances decrypt and present `SMTP_APP_PASSWORD` to `process.env`.
  2. Confirm whether Vercel serverless functions in the `sfo1` / `iad1` regions encounter firewall blocks on outbound port 465 (SSL) to `smtp.gmail.com`.
  3. Inspect live Vercel function logs using `vercel logs midnight-academy-one.vercel.app --environment production --limit 100 --expand`.
- **How to Reproduce**:
  1. Navigate to `https://midnight-academy-one.vercel.app/auth`.
  2. Select "Sign Up".
  3. Enter any fresh valid email (e.g. `test_user_sample@example.com`).
  4. Click "Send Verification Code".

---

## Non-Critical / Monitored Items

---

### Issue: `AI-FALLBACK-MONITOR-002`

- **Title**: Gemini 429 Quota Rate Limiting on Primary Key
- **Status**: `MITIGATED`
- **Severity**: `MEDIUM`
- **Symptom**: High concurrency test evaluations can occasionally exhaust free-tier Gemini API rate limits.
- **Resolution Implemented**: Added automatic fallback to `GEMINI_FALLBACK_API_KEY` and exponential backoff retry in `src/lib/ai.server.ts`.
- **Next Steps**: Monitor token usage if traffic increases.

---

### Issue: `RLS-RECURSION-PREVENTION-003`

- **Title**: User Profile & Role Query Circular Recursion
- **Status**: `RESOLVED & VERIFIED`
- **Severity**: `LOW`
- **Resolution Implemented**: Migration `20260821100002_fix_rls_policies.sql` simplified RLS policies to use direct JWT check `(auth.uid() = id)` and service role execution for role elevation.

---

### Issue: `TOEFL-INTEGRITY-REPAIR-004`

- **Title**: TOEFL Production Fallback and Session State Integrity
- **Status**: `RESOLVED & VERIFIED`
- **Severity**: `P0 - ARCHITECTURAL`
- **Root Cause & Scope**:
  - `blueprint-loader.ts` contained 70KB of hardcoded synthetic blueprints (`MULTI_SERIES_BLUEPRINTS`) and synthetic attempt IDs (`att-${Date.now()}`).
  - Evaluator services returned fake fallback scores (`3.0`, `3.5`) when API calls failed.
  - Speaking recordings lacked a storage bucket and transcription pipeline.
  - Practice cards lacked individual task launch capabilities.
- **Resolution Implemented**:
  1. **Strict Database Authority**: Removed all synthetic blueprints and fallback attempt IDs. Tests now load exclusively from PostgreSQL `test_versions`, failing closed if missing or unpublished.
  2. **Atomic State & Security**: Implemented atomic section advances via PostgreSQL RPC `advance_attempt_section`. Enforced student ownership checks (`student_id === context.userId`), section timer validation, and module-to-section item authorization.
  3. **Zero Fake Data Policy**: Eliminated all fake/fallback scores. Evaluations fail closed into retryable `failed` states with UI retry controls.
  4. **Real Speaking Pipeline**: Created `speaking-recordings` Supabase storage bucket, real audio upload handler, and `@google/genai` audio transcription service (`GeminiSpeechToTextProvider`).
  5. **Direct Practice Launch**: Built interactive practice runner at `/practice/$taskType` supporting all 12 TOEFL task types with real-time scoring and feedback.
  6. **Content Seeding**: Seeded and audited 61 original content items, 120 question options, 12 modules, and 6 published blueprints in PostgreSQL. All 6 pass 100% of blueprint validation checks.

