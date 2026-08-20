# Phase 0 — Architecture & Supabase Audit

This document serves as the complete inventory of the frontend and its coupling to Supabase, in preparation for a migration to NestJS and PostgreSQL.

## 1. Route Classification

The application uses TanStack Router with file-based routing in `src/routes/`.

- **Public**:
  - `__root.tsx` (Root layout/context provider)
  - `index.tsx` (Landing page)
  - `auth.tsx` (Login/Signup)
- **Authenticated (Student)**:
  - `dashboard.tsx` (Student overview)
  - `onboarding.tsx` (New student setup)
  - `practice.tsx` (Practice sets)
  - `history.tsx` (Past attempts)
  - `progress.tsx` (Analytics over time)
  - `profile.tsx` (User settings)
  - `test.index.tsx` (Test details/start)
  - `test.run.tsx` (Active test session)
  - `result.$attemptId.tsx` (Review completed attempt)
- **Admin**:
  - `admin.tsx` (Admin layout)
  - `admin.index.tsx` (Admin dashboard)
  - `admin.create.tsx` (Create a new test)
  - `admin.review.tsx` (Review flagged evaluations)
  - `admin.question-bank.tsx` (Manage questions)
  - `admin.tests.index.tsx` (List all tests)
  - `admin.tests.$testId.tsx` (Manage specific test)
  - `admin.students.index.tsx` (List all students)
  - `admin.students.$studentId.tsx` (View specific student progress)
  - `admin.analytics.tsx` (Cohort-level analytics)

## 2. Auth State Read/Set/Consume

**Location**: `src/hooks/use-auth.tsx` and `src/integrations/supabase/*`

- **Read & Set**: `use-auth.tsx` initializes state via `supabase.auth.getSession()` and subscribes to changes via `supabase.auth.onAuthStateChange()`. It then reads the user's role by querying the `user_roles` table (`role` column) using the retrieved user ID.
- **Consumption**: The `AuthProvider` wraps the `__root.tsx` `Outlet`, exposing `session`, `user`, `role`, `loading`, and `signOut` via `AuthContext`.
- **Backend Protection**: Server-side auth is enforced via `auth-middleware.ts`, which injects user information into the TanStack router context (`requireSupabaseAuth`). `auth-attacher.ts` syncs this via headers.

## 3. Server Functions Catalog

**Location**: `src/lib/attempts.functions.ts` and `src/lib/admin.functions.ts`

### `attempts.functions.ts`

- `startAttempt`: Creates an entry in `attempts`, checking if test exists.
- `revealQuestion`: Fetches a specific question by position, checks constraints.
- `submitAnswer`: Inserts to `attempt_answers` with initial data.
- `recordBlur`: Increments `blur_count` on `attempts`.
- `finishAttempt`: Marks attempt as `evaluating`, fetches all answers, calls `evaluateAnswer` via LLM, then updates scores.
- `getResult`: Fetches the `attempt`, `tests`, and all `attempt_answers`.
- `flagEvaluation`: Sets `flagged = true` on `attempt_answers`.
- `getStudentOverview`: Aggregates attempt data for the dashboard.

### `admin.functions.ts`

- `listAdminTests`, `getAdminTest`: Queries `tests`.
- `draftTest`, `publishTest`, `setTestStatus`: Mutations on `tests`.
- `saveQuestions`: Upserts into `questions`.
- `getAdminOverview`: Aggregates test, question, and student data.
- `listAdminStudents`, `getAdminStudent`: Queries `profiles` and aggregates attempt data.
- `getCohortAnalytics`: Complex aggregation over `attempts` and `attempt_answers`.
- `listFlaggedEvaluations`, `resolveFlag`: Queries/mutates `attempt_answers` based on `flagged`.

## 4. Current Domain Schema (Supabase Migrations)

Extracted from `supabase/migrations/20260813041358_15e3afe1-4f2b-49ef-bd20-c4fdcfcf51b9.sql`

**Enums**:

- `app_role`: 'admin', 'student'
- `test_status`: 'draft', 'active', 'completed'
- `attempt_status`: 'in_progress', 'evaluating', 'evaluated'

**Tables**:

- `profiles`: `id` (uuid), `full_name` (text), `email` (text), `institution` (text), `year` (text), `onboarded` (bool), `created_at` (timestamptz).
- `user_roles`: `id` (uuid), `user_id` (uuid FK), `role` (app_role).
- `tests`: `id` (uuid), `owner_id` (uuid FK), `name` (text), `category` (text), `difficulty` (text), `question_count` (int), `seconds_per_question` (int), `response_seconds` (int), `status` (test_status), `code` (text), `expires_at` (timestamptz), `created_at`.
- `questions`: `id` (uuid), `test_id` (uuid FK), `position` (int), `text` (text), `category` (text), `topic` (text), `difficulty` (text), `concepts` (text[]), `constraints` (text[]), `reference_answer` (text), `approved` (bool), `created_at`.
- `attempts`: `id` (uuid), `test_id` (uuid FK), `student_id` (uuid FK), `status` (attempt_status), `score` (int), `axes` (jsonb), `blur_count` (int), `started_at`, `completed_at`.
- `attempt_answers`: `id` (uuid), `attempt_id` (uuid FK), `question_id` (uuid FK), `position` (int), `response` (text), `score` (numeric), `feedback` (text), `missed_concepts` (text[]), `missed_constraints` (text[]), `flagged` (bool), `revealed_at`, `submitted_at`.

## 5. AI Evaluation Flow End-to-End

**Location**: `src/lib/evaluate.server.ts`, `src/lib/ai.server.ts`

- **Trigger**: Occurs in `finishAttempt` (in `attempts.functions.ts`).
- **Input (`EvaluationInput`)**: Takes `questionText`, `referenceAnswer`, `concepts` (list), `constraints` (list), and the student's `response`.
- **LLM Call**: Calls OpenAI via `chatJson` with a `SYSTEM` prompt enforcing 5 evaluation axes: `objective`, `constraint`, `io`, `concept`, `interpretation`. Instructs the AI to only judge comprehension based on whether the student successfully recalled requirements, not if they solved it.
- **Output Shape**: Requires strict JSON matching:
  ```json
  {
    "score": number,
    "feedback": "string",
    "missed_concepts": ["..."],
    "missed_constraints": ["..."],
    "axis_scores": {
      "objective": number,
      "constraint": number,
      "io": number,
      "concept": number,
      "interpretation": number
    }
  }
  ```
- **Post-processing**: The response is parsed, bounded (clamped to 0-10 scores), and string matching is performed to extract missed concepts/constraints verbatim.

## 6. Frontend Supabase Coupling Points

- `src/hooks/use-auth.tsx`: Directly imports `supabase` client from `src/integrations/supabase/client.ts`.
- `src/start.ts`: Imports `attachSupabaseAuth` from `src/integrations/supabase/auth-attacher.ts`.
- `src/lib/attempts.functions.ts` & `src/lib/admin.functions.ts`: Import `requireSupabaseAuth` middleware and `supabaseAdmin` dynamically.
- `src/lib/admin.server.ts`: Expects `SupabaseClient` type for context injection.

## 7. Environment Variables Findings

The `.env` file contains the following Supabase variables:

- `SUPABASE_PROJECT_ID`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

> [!WARNING]
> **Finding**: The publishable key and Supabase URL are currently in a committed `.env` file because `.env` is NOT excluded in `.gitignore`. (This is acceptable for anon keys, but noted for future phase cleanup).

## 8. Build, Lint, and Typecheck Verification

- **Build**: `npm run build` (`vite build`) works cleanly.
- **Lint**: `npm run lint` (`eslint .`) works cleanly.
- **Typecheck**: Validated by `npm run build` process and IDE type inference.
