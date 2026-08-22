# Midnight Academy — Complete Project Context

> Purpose of this document: a single, self-contained brief that gives an AI coding assistant (or a new developer) everything needed to work on this project confidently — architecture, features, conventions, infrastructure, verification procedures, and history.

---

## 1. What This Product Is

**Midnight Academy** is a web platform for **reading comprehension assessment of technical passages**, built for the B.Tech students of **SRKR Engineering College, Bhimavaram, Andhra Pradesh (India)**.

The core exercise mirrors the "passage recall" pattern used in campus placement tests:

1. **Read** — a technical passage (DSA, DBMS, OS, Networks, OOP, Aptitude) appears for a short, strict timer (default 25 seconds). No typing allowed.
2. **Vanish** — the passage disappears completely when the timer ends.
3. **Recall & Express** — the student writes what they understood, from memory, in their own words (default 90-second window).
4. **AI Evaluation** — Gemini scores the rewrite across five axes and explains what was captured and what was missed.

Two roles:
- **Student** — takes tests by code, practices openly by category, views detailed results.
- **Instructor** — creates tests (PDF upload or paste), publishes test codes, reviews every student's answers and AI evaluations, sees analytics.

Important positioning note: the evaluation methodology is inspired by standard placement-test passage-recall rounds (including penalising verbatim copying), but **the product uses its own original wording everywhere** — no external exam brand names or their terminology appear anywhere in the UI or prompts.

**Live site:** https://midnight-academy-one.vercel.app
**Repository:** https://github.com/surendra2304/midnight-academy (branch `main`)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (Nitro SSR) + React 19 + TypeScript 5.8 + Vite 8 |
| Styling | Tailwind CSS v4, shadcn/radix UI components (`src/components/ui/`) |
| Routing | TanStack Router, file-based routes in `src/routes/` |
| Database & Auth | Supabase PostgreSQL + GoTrue (email/password + Google OAuth), RLS enforced |
| AI | Google Gemini via `@google/genai` — model `gemini-3.5-flash-lite` (fast; the older `gemini-3.7-flash` hangs with Google-side 504s — do not revert) |
| PDF parsing | `pdfjs-dist` — fully client-side in the instructor's browser |
| Email | Nodemailer + Gmail SMTP (App Password) |
| Hosting | Vercel (Node serverless function, 60s max duration, custom `scripts/vercel-build.mjs`) |
| Tests | Vitest — 7 suites, 120 tests |

---

## 3. Architecture

### 3.1 Source layout

```
src/
  routes/                    file-based routes (pages)
  lib/
    *.functions.ts           TanStack Start server functions (RPC endpoints, /_serverFn/<id>)
    *.server.ts              server-only modules (AI, evaluation, email, OTP, admin helpers)
    auth-store.ts            client auth state (Supabase session -> profile+role)
    auth-guard.ts            requireAuth / requireUnauth route guards
    mock-data.ts             axis labels, categories, sample content
  integrations/supabase/     client.ts (browser), client.server.ts (service role),
                             auth-middleware.ts (requireSupabaseAuth), types.ts (DB types)
  components/                app UI + shadcn ui/ set
  hooks/                     use-auth.tsx, use-mobile.tsx
scripts/
  e2e-probe.mjs              full production E2E driver (see §8)
  fn-probe.mjs               low-level server-function caller (seroval wire format)
  vercel-build.mjs           custom Vercel build (copies dist/server into one lambda, maxDuration 60)
supabase/migrations/         SQL migrations (applied to production via supabase CLI)
tests/                       vitest suites
```

### 3.2 Data flow

- Browser reads/writes Supabase directly for simple queries (anon key + RLS).
- All mutations, AI work, and privileged reads go through **server functions** (`src/lib/*.functions.ts`) which use the **service-role key** server-side. Clients never see secrets.
- Server functions are invoked as `POST/GET /_serverFn/<64-hex-id>`. The ID is `sha256("filename--exportName")` — stable across builds. CSRF: send `Origin` header matching the site.

### 3.3 Database schema (public)

- `profiles` — `id` (=auth user), `full_name`, `email`, `year`, `branch`, `code_number` (student regd. number, exactly 10 chars, uppercase), `subject` (instructor's teaching subject), `institution`, `onboarded`.
- `user_roles` — `user_id`, `role` (`app_role` enum: `admin` = instructor, `student`). **A user with no role row is an unregistered Google identity in signup continuation.**
- `tests` — owner instructor, name, category, difficulty, question_count, seconds_per_question (reading), response_seconds (writing), status (`draft|active|completed`), unique `code` like `D-A4MCQ`.
- `questions` — per test: position, text, topic, difficulty, concepts[], constraints[], reference_answer, approved.
- `attempts` — student x test: status (`in_progress|evaluating|evaluated`), score (0-100), axes (jsonb, five keys 0-100), blur_count.
- `attempt_answers` — per question: response, score (0-10), feedback, missed_concepts[], missed_constraints[], flagged, revealed_at, submitted_at.
- `notifications` — in-app bell items.
- `email_verifications` — OTP records for email signup (hashed OTP, 10-min expiry, 60s resend cooldown, max 5 attempts).

### 3.4 RLS security model

RLS is strict; clients can only touch their own rows. Because cross-table `EXISTS()` subqueries in policies re-enter RLS and caused an **infinite recursion bug** (see §9), all cross-table ownership checks go through **SECURITY DEFINER helper functions** (they bypass RLS internally):

- `has_role(user, role)` — role membership
- `owns_test(test_id, user)` — instructor owns the test
- `has_attempt_on_test(test_id, user)` — student attempted the test
- `owns_attempt(attempt_id, user)` — attempt belongs to student
- `owns_attempt_test(attempt_id, user)` — attempt's test belongs to instructor

**Critical invariant: role assignment happens ONLY at signup completion** (server functions `completeRegistrationWithPassword` / `completeGoogleRegistration`, both service-role). The `on_auth_user_created` trigger intentionally creates only a profile row — it must NEVER insert a role, or Google login would auto-create accounts again.

---

## 4. Authentication & Signup Flows

### 4.1 Email + OTP signup
`/auth` → Sign up → email → 6-digit OTP email → password → role selection (Student / Instructor cards) → details → account created (service role) → auto sign-in.

### 4.2 Google OAuth
Both tabs have a Google button. The callback (`/auth/callback`) calls the server function `getOAuthAccountStatus` (service role):
- **Account exists** (has role) → sign in, redirect by role.
- **No account** → redirect to `/auth?flow=google-new&email=...&name=...` → the auth page continues signup at the **password step** (no email/OTP needed) → role → details → `completeGoogleRegistration` (sets password, saves role+details via service role). Double-registration is blocked with a clear error.

### 4.3 Details per role (exact current spec)
- **Student**: Name, **Regd. Number** (exactly 10 alphanumeric characters — client blocks other lengths, server regex-enforces `^[A-Za-z0-9]{10}$`, stored uppercase), Branch, Year.
- **Instructor**: Full Name, Subject (e.g. "Data Structures").

### 4.4 Roles & routing
`auth-store` resolves the session to `role: "ADMIN" | "STUDENT"` (client enum; DB enum is lowercase `admin`/`student`). Guards: `requireAuth({role})` redirects wrong roles to their dashboard; a session without a role resolves to `user: null` so `/auth` stays accessible for the Google continuation.

---

## 5. Core Features

### 5.1 Instructor: create a test
`/admin/create` — four steps:
1. **Test Details** — name, category, difficulty, reading seconds (default 25).
2. **Question Source** — **upload a PDF** (pdf.js extracts text client-side; questions detected by numbering/blank lines and shown in **editable numbered boxes** — edit/remove/add freely) or paste text. Continue via **"Draft with AI & Continue"** (Gemini drafts topic/difficulty/concepts/constraints/reference answers; falls back to manual-review stubs if AI is down) or **"Continue Without AI"** (`useAi:false` stores questions as-is).
3. **Review Questions** — full editing, approve individually or all.
4. **Publish** — generates unique code (e.g. `D-NGZL4`).

### 5.2 Student: take a test
`/test` → enter code → timed reading → passage vanishes → write from memory → submit → `finishAttempt` runs Gemini evaluation (concurrency 4, per-call 15s timeout) → result page shows per-question: original passage, their answer, score, feedback, missed concepts/constraints, reference answer. Blur (tab-switch) counting included.

### 5.3 Instructor: review
`/admin/tests/$testId` — participants **ordered by regd. number**, shown with regd. no. + email; **Evaluation** button opens the student's complete attempt (same result view; `getResult` authorises the test owner). Admin dashboard has stats, per-test performance, **Recent Student Submissions**, review queue for flagged evaluations, cohort analytics, question bank, students list/detail.

### 5.4 Open practice (no code needed)
`/practice` → "Open Practice" panel with a button per category → `/practice/run?category=X` pulls 3 random **approved** questions from the bank → 25s read timer → write → instant AI feedback with five-axis breakdown, missed items, original passage and reference answer. Unlimited attempts; **never persisted or counted in official scores**.

### 5.5 Evaluation axes (five)
Internal keys (never rename — stored in DB): `objective, constraint, io, concept, interpretation`.
Display labels: **Objective Grasp · Detail Capture · Fact Recall · Concept Identification · Clear Expression**.
The evaluator prompt (in `src/lib/evaluate.server.ts`) explicitly **penalises verbatim copying** (Express axis capped ≤5 with an explanatory note) and favours clean, grammatical restatement.

---

## 6. AI Layer (`src/lib/ai.server.ts`)

- `chatJson(messages)` — the single Gemini entry point used by drafting and evaluation.
- Model: `GEMINI_MODEL` env or default `gemini-3.5-flash-lite`.
- **Key fallback**: `GEMINI_API_KEY` (primary) then `GEMINI_FALLBACK_API_KEY` — automatic switch on 429/quota; 2 attempts per key with backoff; 15s per-call timeout (`GEMINI_TIMEOUT_MS`); JSON parse with brace-extraction fallback.
- Do NOT switch back to `gemini-3.7-flash` / `gemini-flash-latest` — verified to hang with Google-side `504 DEADLINE_EXCEEDED`, which previously killed the 60s serverless function.
- If a better/cheaper provider is ever wanted (Groq/Cerebras), swap inside `chatJson` only — it is the single abstraction point.

---

## 7. Infrastructure & Deployment

- **Vercel**: deploy with `npx vercel deploy --prod` from the repo root (project linked: `midnight-academy`, alias `midnight-academy-one.vercel.app`). Occasionally the CLI returns a transient "Not authorized" — retry.
- **Env vars (Vercel, production)**: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY`, `GEMINI_FALLBACK_API_KEY`, `GEMINI_MODEL=gemini-3.5-flash-lite`, `SMTP_USER`, `SMTP_APP_PASSWORD` (working Gmail app password — the account `midnightacademy.admin@gmail.com`; do NOT paste values from `.env.production.local`, that file contains `[SENSITIVE]` placeholders), optional `SMTP_HOST/SMTP_PORT/SMTP_SECURE`, `APP_URL`.
- **Database migrations**: write SQL in `supabase/migrations/`, then `npx supabase db push` (CLI is authenticated; it prompts then applies to production). Always `--dry-run` first to confirm only intended files apply.
- **Supabase project ref**: `fsrxmtbrvmfwmzddvvdg` (Seoul region).

---

## 8. Verification Procedures (use these after any change)

1. **Static**: `npx tsc --noEmit` → `npm run lint` (after `npx eslint . --fix`) → `npm test` (120 tests must pass).
2. **Build**: `npm run build` must succeed.
3. **Full production E2E**: `node scripts/e2e-probe.mjs` — creates throwaway instructor+student accounts (`.env` creds), drafts a test with real Gemini, publishes, takes the test as a student, evaluates, and checks both dashboards. Expects `########## E2E COMPLETE ##########`.
4. **Google-flow probe**: `node scripts/google-flow-probe.mjs` — verifies first-time Google identities get `hasAccount:false`, registration completion, and double-registration blocking.
5. **Logs**: `npx vercel logs midnight-academy-one.vercel.app --environment production`.
6. Throwaway accounts are `*.e2e.*` / `gflow.*` / `googleflow.*` @midnightacademy.dev (password `E2eTest#2026`) — safe to delete on request.

**Server-function wire format (needed for probes)**: `POST /_serverFn/<id>` with headers `Origin: <site>`, `x-tsr-serverFn: true`, `Content-Type: application/json`, optional `Authorization: Bearer <supabase jwt>`; body = `JSON.stringify(toJSON({data}, {plugins}))` using seroval's `toJSON` (NOT `toCrossJSON`/plain JSON) with `@tanstack/router-core`'s `defaultSerovalPlugins`. Responses decode with `fromCrossJSON`. Function IDs: extract in order from the built chunk `dist/client/assets/<module>.functions-*.js` (regex `` `([0-9a-f]{64})` ``), mapped to export order in the source file. `scripts/fn-probe.mjs` implements all of this.

---

## 9. Bug History (fixed — do not regress)

| # | Bug | Root cause / fix |
|---|---|---|
| 1 | Production OTP emails failing | Wrong Gmail credentials in Vercel; also `.env.production.local` holds placeholders. Fixed creds + SMTP hardening (retry, configurable port, PII-safe logs). |
| 2 | Gemini drafting/evaluation hanging | `gemini-3.7-flash` 504s. Switched to `gemini-3.5-flash-lite`, 15s timeout, 2 retries/key. |
| 3 | Could not create/list tests | **Infinite RLS recursion** across tests/attempts/policies. Fixed with SECURITY DEFINER helpers (§3.4). |
| 4 | "No next button" on create flow | UX dead-end; buttons renamed to "… & Continue", manual no-AI path added, PDF upload added. |
| 5 | Google login created accounts instantly | `on_auth_user_created` trigger auto-assigned student role. Trigger changed to profile-only; Google continuation flow added. |
| 6 | Google users could never sign in (older) | Client-side `user_roles` insert was RLS-denied; moved to service-role server function (now `completeGoogleRegistration`). |
| 7 | Hardcoded "weakest axis" | Computed from real attempt axes (`weakestAxis()` in `admin.server.ts`). |
| 8 | Evaluator accepted verbatim copying | Prompt now explicitly penalises copying; Express axis ≤5 with note. |

---

## 10. Conventions

- **Language**: English only — UI copy, comments, commits, docs.
- **Wording style**: simple, professional, encouraging; no harsh words ("wrong", "failed"); no external exam branding.
- **Server/client split**: anything touching secrets, service role, or Gemini lives in `*.server.ts` / `*.functions.ts`; the `no-restricted-imports` lint rule blocks `server-only` imports.
- **Commits**: conventional (`feat:`, `fix:`, `chore:`) with a body explaining why.
- **ESLint**: `react-refresh/only-export-components` is off for `src/components/ui/**` and `src/hooks/**` (shadcn boilerplate).
- **Vite**: uses native `resolve.tsconfigPaths` (the `vite-tsconfig-paths` plugin was removed).
- When editing large files, prefer patch-script files (`.mjs`) over shell `sed`/inline `node -e` heredocs — inline shell escaping has corrupted files twice.

---

## 11. Environment Files (local)

`.env` holds real working local credentials (Supabase URL/keys, two Gemini keys, working SMTP creds). `.env.example` documents all vars. **`.env.production.local` contains `[SENSITIVE]` placeholders — never copy values from it into Vercel.**

---

## 12. Current State (as of last verified deploy)

- All flows verified live: signup (both paths + roles + regd. no.), create test (paste + PDF + AI + no-AI), publish, take test, Gemini evaluation (~5-7s), student/instructor result visibility, dashboards, open practice, OTP email delivery.
- tsc clean, ESLint clean, 120/120 tests, production logs clean.
- Open follow-ups if requested: delete throwaway probe accounts; replace `.env.production.local` placeholders; optional Groq fallback provider; OCR for scanned PDFs.
