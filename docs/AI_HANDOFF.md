# Midnight Academy — AI Engineering Handoff & Architecture Guide

> **Current Repository**: [https://github.com/surendra2304/midnight-academy](https://github.com/surendra2304/midnight-academy)  
> **Production URL**: [https://midnight-academy-one.vercel.app](https://midnight-academy-one.vercel.app)  
> **Target Audience**: AI Coding Agents (Claude, GPT, Gemini, etc.) and Incoming Engineers.

---

## 1. Project Overview

**Midnight Academy** is an AI-powered technical question comprehension and articulation assessment platform. Rather than testing traditional syntax or rote multiple-choice recall, it focuses on assessing how well technical candidates **read, digest, understand, and articulate** complex problem statements (DSA, System Design, Operating Systems, DBMS, Networks, and Aptitude) under timed conditions.

### Target Roles & Workflows

1. **Student Role**:
   - Accesses dashboard (`/dashboard`), history (`/history`), progress (`/progress`), and profile (`/profile`).
   - Enters 9-character Test Codes (e.g. `DSA-X7K29`) on `/test` to start an assessment.
   - Goes through pre-test onboarding instructions (`/onboarding`), questions in timed view mode (`/test/run`), writes structured explanations across key comprehension axes, submits, and views AI-evaluated breakdowns (`/result/:attemptId`).
2. **Admin Role**:
   - Accesses admin hub (`/admin`), test management (`/admin/tests`), student analytics (`/admin/students`), question bank (`/admin/question-bank`), and manual/AI review (`/admin/review`).
   - Creates new assessments using the multi-step Test Creator (`/admin/create`), with automatic Gemini-assisted question drafting.
   - Monitors student submissions and inspects AI evaluations.

---

## 2. Technology Stack

- **Frontend / Framework**: React 19 (`19.2.0`), TypeScript (`5.8.3`), Vite (`8.2.0`), Tailwind CSS (`4.2.1`) with `@tailwindcss/vite`.
- **Full-Stack SSR & Routing**: TanStack Start (`1.168.32`), TanStack Router (`1.170.18`), TanStack Query (`5.101.1`), Nitro SSR engine (`3.0.260603-beta`).
- **Database & Auth**: Supabase PostgreSQL (`@supabase/supabase-js 2.112.3`), GoTrue Auth, Row Level Security (RLS).
- **AI Intelligence**: Google Gemini API (`@google/genai 2.18.0`) using model `gemini-3.7-flash` with automatic fallback key rotation.
- **Email & SMTP**: `nodemailer` (`9.0.5`) with Gmail SMTP (SSL Port 465).
- **UI Components**: Radix UI primitives, Lucide Icons (`0.575.0`), `sonner` (toasts), `input-otp`, `recharts` (analytics), `vaul`, `cmdk`.
- **Testing & Tooling**: Vitest (`4.1.11`), JSDOM, ESLint 9, Prettier 3, Vercel CLI.

---

## 3. System Architecture & Execution Boundaries

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT RUNTIME                         │
│  - React 19 UI Components & Lucide Icons                                │
│  - TanStack Router (File-based routing & Client Auth Guards)             │
│  - Supabase Browser Client (Anon Key, Session Persistence)              │
│  - Input-OTP, Sonner Toasts, Recharts                                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ RPC / Server Functions (HTTP POST)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    TANSTACK START / NITRO SERVER RUNTIME                │
│  - Server Functions (`createServerFn` with Zod validation)              │
│  - Supabase Admin Client (`supabaseAdmin` with Service Role Key)        │
│  - Role Verification & Admin Action Guards                             │
│  - AI Evaluator & Prompt Generator (`@google/genai`)                   │
│  - SMTP Email Dispatch (`nodemailer` via Gmail SSL 465)                 │
│  - In-memory / Database OTP Verification & Token Hashing                │
└──────────────┬─────────────────────────────┬────────────────────────────┘
               │                             │
       PostgreSQL / RLS               AI Inference
               ▼                             ▼
┌─────────────────────────────┐ ┌─────────────────────────────────────────┐
│     SUPABASE DATABASE       │ │          GOOGLE GEMINI API              │
│ - profiles, user_roles      │ │ - Primary: GEMINI_API_KEY               │
│ - tests, questions          │ │ - Fallback: GEMINI_FALLBACK_API_KEY     │
│ - attempts, attempt_answers │ │ - Model: gemini-3.7-flash               │
│ - email_verifications       │ └─────────────────────────────────────────┘
│ - notifications             │
└─────────────────────────────┘
```

### Execution Boundaries

- **Client-Side Only**: Components under `src/components/`, router definitions, local reactive state, browser Supabase client (`src/integrations/supabase/client.ts`).
- **Server Functions (`*.functions.ts`)**: TanStack Start RPC functions (`createServerFn`). Validates client inputs with Zod and dynamically imports server-only modules.
- **Server-Only (`*.server.ts`)**: Code that directly touches secrets (`SUPABASE_SECRET_KEY`, `GEMINI_API_KEY`, `SMTP_APP_PASSWORD`). Never bundled into client JavaScript.

---

## 4. Directory Map & File Reference

| File / Directory                             | Purpose                         | Key Exports & Dependencies                                                                                                     |
| :------------------------------------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/`                                | File-based TanStack routes      | Route definitions (`__root.tsx`, `auth.tsx`, `dashboard.tsx`, `admin.*.tsx`, `test.*.tsx`, `result.$attemptId.tsx`).           |
| `src/lib/auth.functions.ts`                  | Auth RPC server functions       | `requestRegistrationOtp`, `verifyRegistrationOtp`, `completeRegistrationWithPassword`, `loginWithPassword`, `resolveUserRole`. |
| `src/lib/otp.server.ts`                      | OTP management & crypto         | `generateOtp`, `hashOtp`, `secureCompare`, `saveOtpRecord`, `getLatestOtpRecord`, `updateOtpRecord`.                           |
| `src/lib/email.server.ts`                    | Server email dispatch           | `sendEmail`, `renderOtpVerificationEmail`, `renderEvaluationCompletedEmail`. Uses `SMTP_USER` & `SMTP_APP_PASSWORD`.           |
| `src/lib/ai.server.ts`                       | Gemini AI Client wrapper        | `callGeminiWithRetry`, fallback key rotation, `gemini-3.7-flash` invocation.                                                   |
| `src/lib/evaluate.server.ts`                 | Comprehension evaluation engine | `evaluateComprehensionAnswer`, structured scoring across 5 axes.                                                               |
| `src/lib/admin.functions.ts`                 | Admin RPC operations            | `createDraftTest`, `publishTest`, `getAdminDashboardMetrics`, `getAdminAttemptsList`.                                          |
| `src/lib/student.functions.ts`               | Student RPC operations          | `getStudentDashboardData`, `getStudentTestHistory`.                                                                            |
| `src/lib/attempts.functions.ts`              | Test attempt engine             | `startTestAttempt`, `submitQuestionAnswer`, `finalizeTestAttempt`, `getAttemptResult`.                                         |
| `src/lib/notifications.functions.ts`         | Notifications RPC               | `getUserNotifications`, `markNotificationAsRead`, `markAllNotificationsAsRead`.                                                |
| `src/integrations/supabase/client.server.ts` | Server-only Supabase Admin      | `supabaseAdmin` initialized with `SUPABASE_SECRET_KEY`.                                                                        |
| `src/integrations/supabase/client.ts`        | Browser Supabase client         | `supabase` client initialized with Anon key.                                                                                   |
| `src/hooks/use-auth.tsx`                     | React Auth context & hook       | `AuthProvider`, `useAuth` hook managing user session, profile, and role state.                                                 |
| `supabase/migrations/`                       | PostgreSQL migrations           | 6 reconciled migration files for schemas, RLS, and seed data.                                                                  |

---

## 5. Complete Route Inventory

| Route                        | Purpose                       | Role            | Auth Required | Key Notes & Status                                                |
| :--------------------------- | :---------------------------- | :-------------- | :------------ | :---------------------------------------------------------------- |
| `/`                          | Landing / Hero page           | Public          | No            | Live marketing page with role CTA buttons.                        |
| `/auth`                      | Authentication hub            | Public          | No            | Sign In, Sign Up (OTP 3-step), and Google OAuth.                  |
| `/auth.callback`             | OAuth redirect handler        | Public          | No            | Exchanging OAuth code for session and resolving role.             |
| `/auth.error`                | Authentication error page     | Public          | No            | Displays auth failure messages with retry CTAs.                   |
| `/dashboard`                 | Student dashboard             | Student         | Yes           | Shows active tests, recent scores, comprehension radar chart.     |
| `/history`                   | Student test history          | Student         | Yes           | Chronological list of completed attempts and scores.              |
| `/progress`                  | Student progress metrics      | Student         | Yes           | Deep dive into comprehension axes strengths/weaknesses.           |
| `/profile`                   | User profile management       | Any             | Yes           | Displays name, email, role, joined date.                          |
| `/test`                      | Test code entry               | Student         | Yes           | Form to enter 9-character test codes (e.g. `DSA-X7K29`).          |
| `/onboarding`                | Test rules onboarding         | Student         | Yes           | Instructions screen before test timer begins.                     |
| `/test/run`                  | Active test runner            | Student         | Yes           | Timed reading view, recall explanation input, question switching. |
| `/result/$attemptId`         | Test evaluation result        | Student / Admin | Yes           | Full breakdown of AI scores, axes, suggestions, and feedback.     |
| `/admin`                     | Admin dashboard overview      | Admin           | Yes (Admin)   | Total tests, students, attempts, quick actions.                   |
| `/admin/create`              | Test creation studio          | Admin           | Yes (Admin)   | Multi-step test generator with Gemini AI question drafting.       |
| `/admin/tests`               | Admin tests management        | Admin           | Yes (Admin)   | List of published & draft tests with activate/deactivate toggles. |
| `/admin/tests/$testId`       | Specific test editor          | Admin           | Yes (Admin)   | Edit questions, time limits, and test settings.                   |
| `/admin/students`            | Students roster & performance | Admin           | Yes (Admin)   | Student list with average scores and attempt counts.              |
| `/admin/students/$studentId` | Individual student report     | Admin           | Yes (Admin)   | Comprehensive performance history for specific student.           |
| `/admin/question-bank`       | Global question repository    | Admin           | Yes (Admin)   | Question filtering by category, difficulty, and tags.             |
| `/admin/review`              | Evaluation review queue       | Admin           | Yes (Admin)   | List of evaluated attempts for admin moderation and overrides.    |

---

## 6. Authentication & Authorization Flows

### A. Custom Email OTP Registration (3 Steps)

1. **Request OTP (`requestRegistrationOtp`)**: User inputs email. Checks if email is already in Supabase Auth. Sends 6-digit OTP email via Nodemailer. **Only upon successful SMTP send** does it save the hashed OTP to `email_verifications` and activate the 60s resend cooldown.
2. **Verify OTP (`verifyRegistrationOtp`)**: User submits 6-digit OTP. Compares constant-time SHA-256 hash against record. Checks expiration (10 min) and max attempts (5). Invalidates OTP and returns a cryptographically secure `verificationToken`.
3. **Set Password & Finalize (`completeRegistrationWithPassword`)**: User submits password + `verificationToken`. Verifies token hash, creates Supabase user with confirmed email via `supabaseAdmin.auth.admin.createUser`, creates `profiles` record, assigns `student` role in `user_roles`, and marks verification token as `used`.

### B. Standard Email & Password Login (`loginWithPassword`)

1. Authenticates against Supabase Auth.
2. Fetches authoritative role from `user_roles` via `supabaseAdmin`.
3. Directs user to `/admin` if role is `admin`, or `/dashboard` if role is `student`.

### C. Google OAuth (`/auth.callback`)

1. Standard Supabase OAuth PKCE exchange.
2. If new user, creates profile and default `student` entry in `user_roles`.
3. Automatically routes based on resolved role.

---

## 7. Email Dispatch & Known Production Issue

### Technical Details

- **Transporter**: Gmail SMTP (`smtp.gmail.com:465`, SSL, `secure: true`).
- **Required Env**: `SMTP_USER` (Gmail address) and `SMTP_APP_PASSWORD` (16-character Google App Password).
- **Sanitization Rule**: Env vars are sanitized strictly with `.trim()`. **Never** strip internal whitespace or quote characters aggressively.

### ⚠️ Current Critical Issue: `AUTH-OTP-PROD-001`

- **Symptom**: On the live site `https://midnight-academy-one.vercel.app/auth`, clicking "Send Verification Code" returns:  
  `"Unable to send the verification email right now. Please try again."`
- **What Was Verified**:
  - Local SMTP tests pass with Google App Passwords.
  - Server code logic correctly orders `sendEmail` before DB persistence.
  - Trim logic fixed in `src/lib/email.server.ts`.
- **Next AI Investigation**:
  - Check Vercel serverless environment variables: ensure `SMTP_USER` and `SMTP_APP_PASSWORD` are present, decrypted, and not masked incorrectly in the production environment.
  - Verify Vercel deployment protection / function firewall is not blocking outbound port 465 SMTP sockets.

---

## 8. Supabase Database & Migrations

### Tables Schema Summary

| Table                 | Purpose                     | Key Columns                                                                                            | RLS Security                                                          |
| :-------------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `profiles`            | User profile data           | `id` (FK auth.users), `email`, `full_name`, `avatar_url`, `created_at`                                 | Users can view/edit their own profile. Admins can view all.           |
| `user_roles`          | Authoritative RBAC roles    | `id`, `user_id` (FK), `role` (`'admin'`                                                                | `'student'`)                                                          | Users can read own role. Only Service Role can insert/update. |
| `tests`               | Tests & Assessments         | `id`, `title`, `description`, `test_code`, `category`, `time_limit_minutes`, `is_active`, `created_by` | Students view active tests. Admins have full CRUD on own tests.       |
| `questions`           | Test question items         | `id`, `test_id` (FK), `title`, `problem_statement`, `constraints`, `order_index`                       | Readable if associated test is active or owned by admin.              |
| `attempts`            | Student test attempts       | `id`, `test_id`, `user_id`, `status`, `score`, `started_at`, `submitted_at`                            | Students see own attempts. Admins see attempts on tests they created. |
| `attempt_answers`     | Individual question answers | `id`, `attempt_id`, `question_id`, `explanation_text`, `ai_score`, `ai_feedback`                       | Access restricted to attempt owner and test admin.                    |
| `email_verifications` | OTP records & tokens        | `id`, `email`, `otp_hash`, `verification_token_hash`, `resend_available_at`, `expires_at`              | Service Role only.                                                    |
| `notifications`       | User notifications          | `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`                                   | Users can read and update (mark read) only their own notifications.   |

### Migration History

1. `20260813041358_15e3afe1-4f2b-49ef-bd20-c4fdcfcf51b9.sql`: Initial core schema, enums, tables, and RLS.
2. `20260813041423_6c56f00e-7bc0-46ae-ab90-6bae0257c8b2.sql`: Profile auto-creation trigger on `auth.users` insert.
3. `20260820215000_create_email_verifications.sql`: `email_verifications` table for passwordless OTP verification.
4. `20260821100000_ensure_default_dsa_test.sql`: Idempotent seed for the default test (`DSA-X7K29`) and 3 structured DSA questions.
5. `20260821100001_notifications_and_admin_rls.sql`: `notifications` table, RLS, and admin attempt visibility policies.
6. `20260821100002_fix_rls_policies.sql`: Elimination of recursive RLS policies and hardening of profile/role access.

---

## 9. Google Gemini AI Integration

- **Model**: `gemini-3.7-flash` (via `@google/genai` SDK).
- **Keys**: `GEMINI_API_KEY` (Primary) with automatic fallback to `GEMINI_FALLBACK_API_KEY` upon 429 / 503 errors.
- **Retry Logic**: Built-in exponential backoff in `src/lib/ai.server.ts`.
- **Use Cases**:
  1. **Comprehension Evaluation**: Scores student explanations across 5 core axes (Clarity, Problem Decomposition, Edge Cases, Constraint Awareness, Technical Accuracy).
  2. **AI Question Drafting**: Generates realistic problems and rubric hints for admins in `/admin/create`.

---

## 10. Local Development & Verification Commands

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Type-check TypeScript
npx tsc --noEmit

# 4. Run Lint & Format Checks
npm run lint
npm run format

# 5. Run Vitest Test Suite
npm test --silent

# 6. Build Local Vite Bundle
npm run build

# 7. Run Vercel Serverless SSR Build Simulation
npm run vercel-build
```

---

## 11. Known Feature Status Matrix

| Feature Area                   | Status                     | Evidence / Verification                                                     |
| :----------------------------- | :------------------------- | :-------------------------------------------------------------------------- |
| **Email OTP Registration**     | ⚠️ **Broken in Live Prod** | Returns delivery error in live Vercel runtime. (Issue `AUTH-OTP-PROD-001`). |
| **Email/Password Login**       | ✅ **Working**             | Verified with existing Supabase credentials.                                |
| **Google OAuth**               | ✅ **Working**             | Callback and role resolution working.                                       |
| **Default Test (`DSA-X7K29`)** | ✅ **Working**             | Questions seed applied remotely and accessible.                             |
| **Test Taking Runner**         | ✅ **Working**             | Timed view, answer submission, and timer working.                           |
| **AI Evaluation Engine**       | ✅ **Working**             | Gemini 3.7 Flash integration passes all test suites.                        |
| **Admin Test Creation**        | ✅ **Working**             | AI drafting and manual test creation operational.                           |
| **Notifications Dropdown**     | ✅ **Working**             | RLS and database table reconciled; badge and drawer operational.            |
| **Database Migrations**        | ✅ **Reconciled**          | All 6 migrations applied remotely on Supabase.                              |
