# Troubleshooting & AI Diagnostics Guide

A reference manual for diagnosing common failures, runtime errors, and configuration bottlenecks in Midnight Academy.

---

## 1. Authentication & OTP Failures

### Symptom: _"Unable to send the verification email right now. Please try again."_

- **Area**: `src/lib/auth.functions.ts` / `src/lib/email.server.ts`
- **Common Causes**:
  - `SMTP_USER` or `SMTP_APP_PASSWORD` environment variables missing or improperly formatted in Vercel.
  - Vercel Serverless Function firewall blocking outbound SSL connections to `smtp.gmail.com:465`.
  - Gmail App Password expired or revoked.
- **Diagnostic Procedure**:
  ```bash
  # Check live Vercel production logs for runtime SMTP errors:
  vercel logs midnight-academy-one.vercel.app --environment production --limit 50 --expand
  ```

---

## 2. Gemini AI Evaluation Failures

### Symptom: Evaluation stuck or returning error 429 / 503

- **Area**: `src/lib/ai.server.ts` / `src/lib/evaluate.server.ts`
- **Common Causes**:
  - `GEMINI_API_KEY` exhausted monthly/minute quota.
  - Invalid Gemini model specified in environment.
- **Diagnostic Procedure**:
  - Verify that `GEMINI_FALLBACK_API_KEY` is configured.
  - Test the retry mechanism by running unit tests:
    ```bash
    npm test tests/ai-evaluator.test.ts
    ```

---

## 3. Supabase RLS & Database Permission Errors

### Symptom: PostgREST error 42501 (Permission Denied / Infinite Recursion)

- **Area**: `supabase/migrations/` / PostgreSQL RLS Policies
- **Common Causes**:
  - Policies querying `user_roles` inside `profiles` policy (causing circular dependency).
- **Resolution**:
  - Verify that all migrations are synchronized:
    ```bash
    npx supabase migration list
    ```
  - Ensure migration `20260821100002_fix_rls_policies.sql` is applied remotely.

---

## 4. Vercel Serverless SSR Build Errors

### Symptom: `vercel-build` fails or Nitro SSR bridge errors out

- **Area**: `scripts/vercel-build.mjs` / `vite.config.ts`
- **Diagnostic Procedure**:
  - Run the local Vercel SSR build simulator:
    ```bash
    npm run vercel-build
    ```
  - Check that all server dependencies (e.g. `@google/genai`, `nodemailer`) are not bundled into client routes.
