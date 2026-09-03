# Midnight Academy: Current State Architecture Map & Repository Audit

> **Document Version**: 1.0  
> **Date**: September 1, 2026  
> **Repository**: `surendra2304/midnight-academy`  
> **Production URL**: `https://midnight-academy-one.vercel.app`  
> **Stack**: TanStack Start / React 19 / TypeScript / Tailwind CSS v4 / Supabase PostgreSQL & Auth / Gemini API / Vercel SSR

---

## 1. Complete Route Inventory

Midnight Academy uses file-based routing via **TanStack Router** inside `src/routes/`.

| Route Path                   | File                                       | Access Level       | Purpose & Core Components                                                                                                                                                              |
| :--------------------------- | :----------------------------------------- | :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                          | `src/routes/index.tsx`                     | Public             | Landing page explaining technical comprehension philosophy, comparison table, sample problem walkthrough, FAQ, and dynamic CTA depending on session.                                   |
| `/auth`                      | `src/routes/auth.index.tsx`                | Public             | Authentication portal: Student & Instructor tabs, Email OTP login/signup, Google OAuth button, and role-based redirect.                                                                |
| `/auth/callback`             | `src/routes/auth.callback.tsx`             | Public (OAuth)     | Supabase OAuth redirect handler; verifies auth code / token hash and routes user to appropriate dashboard.                                                                             |
| `/auth/error`                | `src/routes/auth.error.tsx`                | Public             | Error page for authentication and verification failures.                                                                                                                               |
| `/dashboard`                 | `src/routes/dashboard.tsx`                 | Student            | Student hub: active test entry with test code, recommended practice cards, recent attempts table, and performance statistics.                                                          |
| `/test`                      | `src/routes/test.index.tsx`                | Student            | Test launch code entry view: test overview, countdown timer instructions, rules modal, and "Start Test" trigger.                                                                       |
| `/test/run`                  | `src/routes/test.run.tsx`                  | Student            | Live timed exam runner: staged reading timer (45s), staged writing response timer (90s), copy-paste prevention, full auto-submit.                                                      |
| `/result/$attemptId`         | `src/routes/result.$attemptId.tsx`         | Student / Admin    | Comprehensive score report: overall percentage, 5-axis chart, question-by-question review, AI evaluation feedback, and manual review actions.                                          |
| `/practice`                  | `src/routes/practice.tsx`                  | Student            | Practice library: curated English comprehension drills (`ENG-PRAC-01`, `ENG-PRAC-02`), unlimited retakes, instant attempt trigger.                                                     |
| `/history`                   | `src/routes/history.tsx`                   | Student            | Chronological history of all completed and in-progress attempts with score badges and direct links to result reports.                                                                  |
| `/progress`                  | `src/routes/progress.tsx`                  | Student            | Longitudinal analytics: 5-axis spider/radar radar chart, score trends over time, speed vs accuracy breakdown.                                                                          |
| `/profile`                   | `src/routes/profile.tsx`                   | Student / Admin    | User profile view: avatar, full name, email, code number, branch, dark mode toggle, and logout button.                                                                                 |
| `/admin`                     | `src/routes/admin.index.tsx`               | Admin / Instructor | Instructor control center: KPI metrics (tests created, total submissions, average score, active students), recent submissions table, quick actions.                                    |
| `/admin/create`              | `src/routes/admin.create.tsx`              | Admin / Instructor | 4-step test creation wizard: Basic metadata, Question drafting (Manual, Gemini AI Prompt, or PDF extraction via PDF.js/Tesseract), Question Review/Approval, and Test Code generation. |
| `/admin/tests`               | `src/routes/admin.tests.index.tsx`         | Admin / Instructor | Test management catalog: list of created tests, status toggles (active/draft/closed), question count, submission count, test codes.                                                    |
| `/admin/tests/$testId`       | `src/routes/admin.tests.$testId.tsx`       | Admin / Instructor | Test detail & analytics: test metadata, student attempt leaderboard, question-level breakdown, export to CSV.                                                                          |
| `/admin/students`            | `src/routes/admin.students.index.tsx`      | Admin / Instructor | Directory of all registered students with attempt counts, average scores, and last active timestamps.                                                                                  |
| `/admin/students/$studentId` | `src/routes/admin.students.$studentId.tsx` | Admin / Instructor | Individual student profile & analytics: full attempt history, 5-axis competency profile, and instructor notes.                                                                         |
| `/admin/analytics`           | `src/routes/admin.analytics.tsx`           | Admin / Instructor | Platform-wide analytics: score distributions, question difficulty index, completion rates, and cohort trends.                                                                          |

---

## 2. Server Functions & API Endpoints

Server functions are built with `@tanstack/react-start` (`createServerFn`) and secured with `requireSupabaseAuth` middleware.

### 2.1 Authentication & Profile (`src/lib/auth.functions.ts`)

- **`getAuthUser`**: `GET` | Context: Session Cookie | Returns: `{ user: { id, email, name, role, ... } | null }`
- **`sendOtp`**: `POST` | Input: `{ email, mode: 'login' | 'signup', role? }` | Sends 6-digit OTP via Nodemailer SMTP and stores in `email_verifications`.
- **`verifyOtp`**: `POST` | Input: `{ email, otp, fullName?, branch?, codeNumber? }` | Verifies OTP against DB, provisions Supabase Auth user if signup, and sets secure auth session.
- **`logoutUser`**: `POST` | Invalidates Supabase session and clears auth cookies.
- **`updateProfile`**: `POST` | Input: `{ fullName, branch, codeNumber }` | Updates `profiles` record in Supabase.

### 2.2 Test Attempt Engine (`src/lib/attempts.functions.ts`)

- **`startAttempt`**: `POST` | Input: `{ code, allowRetake? }` | Validates test code, checks active status and question count, provisions `attempts` row, returns `{ attemptId, test, total }`.
- **`getAttemptState`**: `GET` | Input: `{ attemptId }` | Fetches active question index, answered positions, and timing configurations.
- **`revealQuestion`**: `POST` | Input: `{ attemptId, position }` | Marks question as revealed (`revealed_at`), returns question prompt and begins reading countdown.
- **`submitAnswer`**: `POST` | Input: `{ attemptId, position, response }` | Saves `attempt_answers` response, triggers asynchronous Gemini evaluation for this answer in background.
- **`finishAttempt`**: `POST` | Input: `{ attemptId }` | Triggers final aggregation, calculates 5-axis scores and overall percentage, marks attempt as `evaluated`.
- **`processAttemptEvaluation`**: `POST` | Input: `{ attemptId }` | Safe idempotent evaluator: evaluates all unscored answers, runs `computeAxes`, updates `attempts.score`, and triggers email notification.
- **`getResult`**: `GET` | Input: `{ attemptId }` | Authorizes student/instructor and returns full test report, 5 axes, question feedback, and missed concepts/constraints.
- **`flagEvaluation`**: `POST` | Input: `{ attemptAnswerId }` | Flags an AI score for instructor manual review.
- **`saveManualReview`**: `POST` | Input: `{ attemptAnswerId, score, feedback }` | Instructor override for answer score and feedback.

### 2.3 Practice Library (`src/lib/practice.functions.ts`)

- **`listPracticeTests`**: `GET` | Returns active English comprehension practice tests (`ENG-PRAC-01`, `ENG-PRAC-02`) with question metadata.

### 2.4 Student Analytics & History (`src/lib/student.functions.ts`)

- **`getStudentDashboard`**: `GET` | Aggregates recent attempts, average score, total tests completed, and target score gap.
- **`getStudentHistory`**: `GET` | Returns paginated attempt history with filters.
- **`getStudentProgress`**: `GET` | Computes 5-axis competency averages and chronological test progress.

### 2.5 Admin Operations (`src/lib/admin.functions.ts`)

- **`getAdminOverview`**: `GET` | Platform KPIs and recent submission stream.
- **`listAdminTests`**: `GET` | All tests owned by instructor with status filters.
- **`getAdminTestDetails`**: `GET` | Input: `{ testId }` | Full test analytics, questions list, and student attempt submissions.
- **`createTest`**: `POST` | Input: `{ name, category, difficulty, secondsPerQuestion, responseSeconds, questions[] }` | Creates test, generates unique code, inserts questions.
- **`updateTestStatus`**: `POST` | Input: `{ testId, status: 'draft' | 'active' | 'closed' }` | Toggles test availability.
- **`aiDraftQuestions`**: `POST` | Input: `{ prompt, count, category, difficulty }` | Calls Gemini to generate structured test questions.

### 2.6 Notifications (`src/lib/notifications.functions.ts`)

- **`listNotifications`**: `GET` | Returns unread notifications for current user.
- **`markNotificationRead`**: `POST` | Input: `{ notificationId }` | Marks notification as read.

---

## 3. Full Supabase Schema & Database Architecture

Database: PostgreSQL on Supabase.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    profiles     │──────<│   user_roles    │       │  notifications  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        │
        │ owns / attempts
        ▼
┌─────────────────┐ 1   * ┌─────────────────┐
│      tests      │──────<│    questions    │
└─────────────────┘       └─────────────────┘
        │ 1
        │
        ▼ *
┌─────────────────┐ 1   * ┌─────────────────┐
│    attempts     │──────<│ attempt_answers │
└─────────────────┘       └─────────────────┘
```

### Table Definitions:

1. **`profiles`**:
   - `id` (uuid, PK, references `auth.users.id` on delete cascade)
   - `full_name` (text)
   - `email` (text)
   - `avatar_url` (text)
   - `code_number` (text) — Student roll/code number
   - `branch` (text) — Engineering/academic branch
   - `created_at`, `updated_at` (timestamptz)

2. **`user_roles`**:
   - `id` (uuid, PK, default `gen_random_uuid()`)
   - `user_id` (uuid, references `profiles.id` on delete cascade)
   - `role` (`app_role` enum: `'student'`, `'instructor'`, `'admin'`)
   - `created_at` (timestamptz)
   - Unique constraint: `(user_id, role)`

3. **`tests`**:
   - `id` (uuid, PK, default `gen_random_uuid()`)
   - `owner_id` (uuid, references `profiles.id`)
   - `name` (text, not null)
   - `category` (text, not null)
   - `difficulty` (text, default `'Medium'`)
   - `question_count` (int4, not null)
   - `seconds_per_question` (int4, default 45) — Reading phase duration
   - `response_seconds` (int4, default 90) — Writing phase duration
   - `status` (`test_status` enum: `'draft'`, `'active'`, `'closed'`)
   - `code` (text, unique, not null) — e.g., `ENG-PRAC-01`, `A-HR3LS`
   - `is_practice` (bool, default false)
   - `expires_at` (timestamptz)
   - `created_at` (timestamptz)

4. **`questions`**:
   - `id` (uuid, PK, default `gen_random_uuid()`)
   - `test_id` (uuid, references `tests.id` on delete cascade)
   - `position` (int4, not null)
   - `text` (text, not null) — Question passage / statement
   - `category` (text, not null)
   - `topic` (text)
   - `difficulty` (text)
   - `concepts` (text[], default `{}`) — Expected key concepts
   - `constraints` (text[], default `{}`) — Stated conditions/limits
   - `reference_answer` (text, not null)
   - `approved` (bool, default true)
   - `created_at` (timestamptz)

5. **`attempts`**:
   - `id` (uuid, PK, default `gen_random_uuid()`)
   - `test_id` (uuid, references `tests.id` on delete cascade)
   - `student_id` (uuid, references `profiles.id` on delete cascade)
   - `status` (`attempt_status` enum: `'in_progress'`, `'evaluating'`, `'evaluated'`)
   - `score` (numeric) — Overall calculated percentage (0–100)
   - `axes` (jsonb) — `{ objective, constraint, io, concept, interpretation }`
   - `blur_count` (int4, default 0) — Tab switch count
   - `started_at` (timestamptz, default `now()`)
   - `completed_at` (timestamptz)

6. **`attempt_answers`**:
   - `id` (uuid, PK, default `gen_random_uuid()`)
   - `attempt_id` (uuid, references `attempts.id` on delete cascade)
   - `question_id` (uuid, references `questions.id` on delete cascade)
   - `position` (int4, not null)
   - `response` (text, default `''`)
   - `score` (numeric) — Question score (0.0–10.0)
   - `feedback` (text) — AI-generated structured feedback
   - `missed_concepts` (text[], default `{}`)
   - `missed_constraints` (text[], default `{}`)
   - `flagged` (bool, default false)
   - `manual_score` (numeric)
   - `manual_feedback` (text)
   - `revealed_at` (timestamptz)
   - `submitted_at` (timestamptz)

7. **`email_verifications`**:
   - `id` (uuid, PK, default `gen_random_uuid()`)
   - `email` (text, not null)
   - `otp_hash` (text, not null)
   - `expires_at` (timestamptz, not null)
   - `attempts` (int4, default 0)
   - `created_at` (timestamptz, default `now()`)

8. **`notifications`**:
   - `id` (uuid, PK, default `gen_random_uuid()`)
   - `user_id` (uuid, references `profiles.id` on delete cascade)
   - `title` (text, not null)
   - `message` (text, not null)
   - `link` (text)
   - `read` (bool, default false)
   - `created_at` (timestamptz, default `now()`)

### Row Level Security (RLS) Policies:

- **`profiles`**: Public read for basic names; update restricted to `auth.uid() = id`.
- **`tests`**: Instructors read/write own tests; students read tests they attempted or tests where `is_practice = true` / active test code.
- **`questions`**: Instructors read/write own test questions; students read approved questions for tests they are actively attempting.
- **`attempts` & `attempt_answers`**: Students read/write own attempts; test owners (instructors) read attempts for their tests.
- **`email_verifications`**: Service-role only (accessed strictly through server functions).

---

## 4. Auth Flow & The Vercel SMTP Environment Issue

```
1. Student/Instructor inputs Email
          │
          ▼
2. Server generates 6-digit OTP & bcrypt hash
          │
          ├──> Stores in `email_verifications` via Supabase Admin
          │
          ▼
3. Transports email via Nodemailer (Gmail SMTP)
          │
          ▼
4. User inputs OTP in UI (input-otp)
          │
          ▼
5. `verifyOtp` server function validates hash + expiry
          │
          ▼
6. Supabase Admin API provisions or logs in user
          │
          ▼
7. Sets secure HTTP-only session cookie
```

### The Vercel SMTP Environment Issue Analysis:

- **Root Cause**: On Vercel serverless environments, outbound SMTP on standard port `587` (STARTTLS) can experience connection timeouts or certificate handshakes hangs if serverless cold starts take too long or if Gmail rate-limits the shared Vercel IP ranges.
- **Current Mitigation in Code**:
  - `src/lib/email.server.ts` configures connection timeout (`connectionTimeout: 10000`, `greetingTimeout: 5000`).
  - Fallback development logging exists if credentials are absent.
  - Production recommendation: Switch to a transactional email API (e.g. Resend, SendGrid, or Supabase Auth Native SMTP) instead of direct Nodemailer Gmail SMTP for 100% serverless delivery reliability.

---

## 5. Current Test Engine Lifecycle

```
[Start Attempt]
   │  Checks test code validity & question count in `tests` table
   ▼
[Test Runner Initialized] (`/test/run?attemptId=...`)
   │  Sets up staged timer & attaches window-level copy/paste blocking
   ▼
[Phase 1: Reading Stage (45s)]
   │  Calls `revealQuestion`. Displays statement passage.
   │  Timer expires -> question text unmounts immediately from DOM.
   ▼
[Phase 2: Writing Stage (90s)]
   │  User writes recall and understanding from memory.
   │  Autosaves drafts to `sessionStorage` (`DRAFT_KEY_PREFIX`).
   ▼
[Submit Answer]
   │  Calls `submitAnswer`. Saves response.
   │  Triggers async Gemini evaluation in background (`attempt_answers.score`).
   │  Advances to next question.
   ▼
[Finalize & Aggregate]
   │  Calls `finishAttempt`. Runs `evaluateAttempt` in `src/lib/attempts.server.ts`.
   │  Calculates 5-axis radar metrics & total percentage score.
   │  Marks attempt as `evaluated` in DB.
   ▼
[Result Report] (`/result/$attemptId`)
   │  Displays total score %, 5-axis radar chart, question-by-question review,
   │  and question-grouped missed constraints/concepts.
```

---

## 6. Gemini Integration Points & Evaluation Mechanics

All AI calls are centralized in server-only modules (`src/lib/ai.server.ts`, `src/lib/evaluate.server.ts`).

1. **Client Library**: `@google/genai` (Google Gen AI SDK v2) using `gemini-2.5-flash` with structured JSON output schema.
2. **Evaluator Prompts (`src/lib/evaluate.server.ts`)**:
   - `SYSTEM` prompt: Evaluates **Meaning/Comprehension**, **Omitted Constraints**, and **English Grammar/Expression**.
   - Output JSON Schema:
     ```json
     {
       "score": 0.0-10.0,
       "feedback": "1. What you understood... 2. What you missed... 3. Grammar & Clarity...",
       "missed_concepts": ["..."],
       "missed_constraints": ["..."],
       "axis_scores": {
         "objective": 0-10,
         "constraint": 0-10,
         "io": 0-10,
         "concept": 0-10,
         "interpretation": 0-10
       }
     }
     ```
3. **Scoring Rigor**:
   - Irrelevant/gibberish answers are strictly scored as **`0%`**.
   - Validated via Zod (`RawEvaluationSchema`).
4. **AI Test Drafting (`src/lib/admin.functions.ts`)**:
   - `aiDraftQuestions`: Generates realistic test questions from instructor prompts with reference answers, concepts, and constraints.

---

## 7. Shared Types, Utilities & Components

- **UI Kit (`src/components/ui/`)**: 30+ accessible Radix-UI components styled with Tailwind CSS (Dialog, Select, Tabs, Accordion, Progress, Sonner Toasts, Tooltips, Table, Textarea, Input).
- **Domain Components (`src/components/`)**:
  - `AppNav`: Main responsive navigation header with unread notification badge, theme toggle, and role-based routes.
  - `ComprehensionBreakdown`: Recharts radar/bar visualization for the 5 competency axes.
  - `CountUp`: Animated numerical counter for score results.
  - `Brand`: Midnight Academy SVG logo and typography.
- **Axes & Metrics (`src/lib/axes.ts`)**:
  - Calculates the 5 core axes: `objective`, `constraint`, `io`, `concept`, `interpretation`.
- **Date/Time Formatter (`src/lib/format.ts`)**:
  - Formats timestamps to Indian Standard Time (IST).

---

## 8. Dependency Inventory (Exact Versions)

### Production Dependencies (`dependencies`):

- `@google/genai`: `^2.18.0`
- `@hookform/resolvers`: `^5.2.2`
- `@radix-ui/react-*`: `^1.1.x` - `^2.2.x` (Full suite of 26 primitive UI components)
- `@supabase/supabase-js`: `^2.112.3`
- `@tailwindcss/vite`: `^4.2.1`
- `@tanstack/react-query`: `^5.101.1`
- `@tanstack/react-router`: `1.170.18`
- `@tanstack/react-start`: `1.168.32`
- `@tanstack/router-plugin`: `1.168.23`
- `nodemailer`: `^9.0.5`
- `pdfjs-dist`: `^6.2.108`
- `react`: `^19.2.0`
- `react-dom`: `^19.2.0`
- `react-hook-form`: `^7.71.2`
- `recharts`: `^2.15.4`
- `sonner`: `^2.0.7`
- `tailwindcss`: `^4.2.1`
- `tesseract.js`: `^7.0.0`
- `zod`: `^3.24.2`

### Development Dependencies (`devDependencies`):

- `@testing-library/react`: `^16.3.2`
- `typescript`: `^5.9.3`
- `vite`: `^8.2.2`
- `vitest`: `^4.1.11`

---

## 9. Existing Tests & CI/Build Health

- **Test Suite (`vitest`)**:
  - `tests/roles-auth.test.ts` (22 tests)
  - `tests/production-flow.test.ts` (27 tests)
  - `tests/ai-evaluator.test.ts` (8 tests)
  - `tests/security.test.ts` (14 tests)
  - `tests/otp-flow.test.ts` (5 tests)
  - `tests/core.test.ts` (7 tests)
  - `tests/production-regression.test.ts` (37 tests)
  - **Total: 120 tests passing (100% pass rate)**.
- **Build Verification**:
  - `npm run build` generates SSR server and client bundles in `dist/` with **0 errors**.

---

## 10. Gap Analysis: Current State vs. TOEFL 2026 Target

| Capability                      | Current Midnight Academy State                                    | TOEFL 2026 Target Architecture                                                                                   | Required Expansion                                                                   |
| :------------------------------ | :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Test Structure**              | Single-section flat test with reading/writing stages per question | 4 Distinct Sections (Reading, Listening, Writing, Speaking) + Multistage Adaptive                                | Add `sections`, `modules`, `test_versions` entities                                  |
| **Content Items**               | Single `questions` table with text passage & reference answer     | Rich item types: Cloze words, Audio conversation, Announcement, Sentence Builder, Academic Discussion, Interview | Add `content_items`, `question_options`, `content_assets` (audio/transcript)         |
| **Scoring Model**               | Single 0–100% score + 5 comprehension axes                        | 1–6 ETS half-point band per section + overall band + 0–120 transition equivalent                                 | Add deterministic scoring engine + `score_reports` entity                            |
| **Audio Pipeline**              | None (Text only)                                                  | Listening audio playback + Speaking microphone recording & WebAudio stream                                       | Add browser audio recorder + Supabase Storage audio bucket + Gemini audio evaluation |
| **Adaptive Engine**             | Linear fixed question list                                        | Multistage routing (Module A $\rightarrow$ Upper / Lower Module B)                                               | Add `adaptive_router` based on Module A performance threshold                        |
| **Analytics & Recommendations** | Basic test history list & 5-axis average                          | Skill taxonomy, error categorization, target gap, personalized practice queue                                    | Add `skills`, `response_skills`, `recommendations`, `study_plans`                    |
| **Admin Lifecycle**             | 4-step wizard for text questions                                  | Full test builder with audio asset upload, rubric editor, versioning, draft/publish workflow                     | Add rich content studio with validation and immutable versioning                     |

---

## Summary of Findings & Non-Breaking Evolution Strategy

1. **Architecture Baseline is Healthy**:
   - Authentication, routing, server functions, database access, and build pipelines are operating cleanly with 120/120 passing unit tests.
2. **Safe Vertical Slices**:
   - The evolution to TOEFL should proceed additively: new database tables and services can be introduced alongside the existing system without breaking existing student accounts or test histories.
3. **Deterministic First**:
   - Implement deterministic grading for Reading, Listening, and Build a Sentence tasks, while leveraging Gemini strictly for open-ended Speaking, Writing, and Personalized Coaching.
