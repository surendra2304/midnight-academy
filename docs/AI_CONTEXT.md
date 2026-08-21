# AI Machine-Readable Project Context

```yaml
PROJECT: Midnight Academy
REPOSITORY: https://github.com/surendra2304/midnight-academy
PRODUCTION: https://midnight-academy-one.vercel.app
PRIMARY_FRAMEWORK: TanStack Start (SSR) + React 19 + TypeScript
ROUTING: TanStack Router (File-based inside src/routes)
STYLING: Tailwind CSS v4 + Radix UI + Lucide Icons
DATABASE: Supabase PostgreSQL (Project fsrxmtbrvmfwmzddvvdg)
AUTH_SYSTEM: Supabase Auth (Email+Password, Google OAuth, Custom Email OTP)
AI_ENGINE: Google Gemini (gemini-3.7-flash with fallback key rotation)
EMAIL_SERVICE: Gmail SMTP via Nodemailer (Port 465 SSL)

ROLES:
  STUDENT: Takes tests, reviews comprehension analysis, tracks progress (/dashboard, /test, /result)
  ADMIN: Creates tests with AI drafting, monitors submissions, reviews questions (/admin, /admin/create)

DATABASE_TABLES:
  - profiles: User metadata, name, avatar
  - user_roles: Authoritative role assignment (admin | student)
  - tests: Test suites with codes (e.g. DSA-X7K29)
  - questions: Structured problem statements, constraints, test associations
  - attempts: Student attempt records, scores, timestamps
  - attempt_answers: Student comprehension explanations & AI evaluation scores
  - email_verifications: Hashed OTPs, attempt counters, verification tokens
  - notifications: In-app student/admin notification alerts

CURRENT_CRITICAL_BUGS:
  - ID: AUTH-OTP-PROD-001
    STATUS: OPEN
    AREA: Production Email OTP Registration
    SYMPTOM: "Unable to send the verification email right now. Please try again." on live site.
    NOTE: Local SMTP tests pass. Server-side trim fix applied. Issue persists in live Vercel environment.

CURRENT_STABLE_FEATURES:
  - Email/Password Login & Role Resolution
  - Google OAuth Authentication & Redirection
  - Seeded Test Engine (DSA-X7K29 with 3 questions)
  - Onboarding & Question Step Navigation (fixed button anchoring)
  - Test Taking Runner & Timed Problem Reading
  - Gemini 3.7 Flash Evaluation & Rubric Breakdown
  - Multi-step Test Creator with Gemini AI Drafting
  - Notification System UI & Backend RLS

IMPORTANT_FILES:
  AUTH_FUNCTIONS: src/lib/auth.functions.ts
  EMAIL_DISPATCH: src/lib/email.server.ts
  OTP_ENGINE: src/lib/otp.server.ts
  AI_EVALUATOR: src/lib/ai.server.ts, src/lib/evaluate.server.ts
  TEST_ATTEMPTS: src/lib/attempts.functions.ts, src/lib/attempts.server.ts
  SUPABASE_CLIENT_SERVER: src/integrations/supabase/client.server.ts
  SUPABASE_CLIENT_BROWSER: src/integrations/supabase/client.ts

MIGRATIONS:
  - 20260813041358_15e3afe1-4f2b-49ef-bd20-c4fdcfcf51b9.sql
  - 20260813041423_6c56f00e-7bc0-46ae-ab90-6bae0257c8b2.sql
  - 20260820215000_create_email_verifications.sql
  - 20260821100000_ensure_default_dsa_test.sql
  - 20260821100001_notifications_and_admin_rls.sql
  - 20260821100002_fix_rls_policies.sql

KEY_COMMANDS:
  DEV: npm run dev
  LINT: npm run lint
  TYPECHECK: npx tsc --noEmit
  TEST: npm test --silent
  BUILD: npm run build
  VERCEL_BUILD: npm run vercel-build

DO_NOT_CHANGE:
  - Do not revert Supabase Service Role usage in server functions to Anon key.
  - Do not make OTP records save before SMTP email dispatch succeeds.
  - Do not introduce recursive RLS policies on profiles or user_roles.
  - Do not remove the fallback key rotation in ai.server.ts.

NEXT_RECOMMENDED_INVESTIGATION:
  - Inspect Vercel environment variables encryption/format for SMTP_APP_PASSWORD and SMTP_USER.
  - Test outbound SMTP socket connectivity from Vercel function runtime.
```
