# Diagnostic Gap Report: Why the Live App Renders the Old Technical Dashboard

**Audit Date**: September 1, 2026  
**Repository**: `surendra2304/midnight-academy`  
**Production Deployment**: `midnight-academy-one.vercel.app`

---

## 1. Executive Summary

A comprehensive, read-only audit across all 4 operational layers (Deployment, Database, Content Bank, and Routes/UI) reveals the exact architectural reasons why the live production application continues to render the legacy technical comprehension interface rather than the newly engineered TOEFL platform.

In brief:

1. **The Database Schema Exists, But is Empty**: All 16 TOEFL domain tables were successfully created in Supabase via forward migrations, but **no published `test_versions` or `content_items` have been seeded into the production database instance** (`count = 0`).
2. **The Student UI Routes Are Still Wired to the Legacy Comprehension Dashboard**: While the TOEFL domain libraries, scoring engines, and UI components (`FullMockRunnerOrchestrator.tsx`, `UnifiedScoreReportView.tsx`, `AnalyticsDashboardView.tsx`, `PracticeQueueView.tsx`) were built under `src/components/test-runner/` and `src/lib/`, the top-level page routes (`src/routes/dashboard.tsx`, `src/routes/test.index.tsx`, `src/routes/test.run.tsx`, `src/routes/index.tsx`) still import and render the legacy comprehension views (`student.functions.ts`, `attempts.functions.ts`).

---

## 2. Detailed Findings by Area

### 🔍 Area 1: Deployment Status

- **Repository Commit State**: Clean, passing all 18 Vitest test suites (167 tests passed) and production build succeeds with 0 errors.
- **Latest Commit on `main`**: `eef3f99` (`feat(calibration): implement content bank empirical calibration engine...`).
- **GitHub Actions CI**: Connected and active via `.github/workflows/ci.yml`.

---

### 🗄️ Area 2: Database Schema Audit

Direct querying of the connected Supabase instance via service role confirms:

- **All 16 TOEFL domain tables exist**:
  - `test_versions`: **EXISTS**
  - `sections`: **EXISTS**
  - `modules`: **EXISTS**
  - `content_items`: **EXISTS**
  - `content_assets`: **EXISTS**
  - `question_options`: **EXISTS**
  - `rubrics`: **EXISTS**
  - `attempt_sections`: **EXISTS**
  - `responses`: **EXISTS**
  - `evaluations`: **EXISTS**
  - `score_reports`: **EXISTS**
  - `skills`: **EXISTS**
  - `response_skills`: **EXISTS**
  - `recommendations`: **EXISTS**
  - `study_plans`: **EXISTS**
  - `content_tags`: **EXISTS**

---

### 📦 Area 3: Content Bank Seeding Audit

Row count queries on the production database return:

- `test_versions`: **0 rows**
- `sections`: **0 rows**
- `modules`: **0 rows**
- `content_items`: **0 rows**
- `question_options`: **0 rows**
- `rubrics`: **0 rows**
- **Published Test Versions**: **0**

**Finding**: The seed scripts (`scripts/seed-substantial-toefl-bank.ts`, `scripts/seed-toefl-full-mock.ts`) were created in the repo, but the production database currently has 0 rows in these new tables.

---

### 🌐 Area 4: Student-Facing Route & UI Mapping

| Route File                         | Current Render Target                                                             | Data Source                                                             | Finding                                                                                              |
| :--------------------------------- | :-------------------------------------------------------------------------------- | :---------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `src/routes/index.tsx`             | Legacy "Don't Solve Yet. Understand First." Landing Page                          | Static mock data (`lib/mock-data.ts`)                                   | Shows old comprehension marketing copy.                                                              |
| `src/routes/dashboard.tsx`         | Legacy Technical Comprehension Dashboard (`ComprehensionBreakdown`, `ScoreTrend`) | `getStudentDashboardData()` querying old `attempts` / `attempt_answers` | "Take Test" button links to `/test`. Needs to render `AnalyticsDashboardView` & `PracticeQueueView`. |
| `src/routes/test.index.tsx`        | Legacy Test Entry Screen ("Enter your test code")                                 | Old `tests` table / code lookup                                         | Needs to render the TOEFL 2026 Test Catalog (Full Mocks, Section Tests, Practice Bank).              |
| `src/routes/test.run.tsx`          | Legacy Timed Reading/Explanation Runner (`submitAnswer`)                          | Old `questions` table                                                   | Needs to mount `FullMockRunnerOrchestrator` / `useAttemptSession`.                                   |
| `src/routes/result.$attemptId.tsx` | Legacy 5-Axis Breakdown View                                                      | Old `attempts` evaluation                                               | Needs to mount `UnifiedScoreReportView` using `getToeflScoreReport()`.                               |

---

## 3. Step-by-Step Remediation Plan (Ordered by Dependency)

To transition the live application from the legacy comprehension app to the full TOEFL 2026 platform:

1. **Step 1: Execute Seed Pipeline on Production Database**
   - Run `npx tsx scripts/seed-substantial-toefl-bank.ts` and `npx tsx scripts/seed-toefl-full-mock.ts` against the live Supabase instance to populate `test_versions`, `sections`, `modules`, `content_items`, `question_options`, and `rubrics`.
2. **Step 2: Rewire Student Dashboard (`src/routes/dashboard.tsx`)**
   - Mount `AnalyticsDashboardView` (fetching from `getStudentAnalyticsDashboard`) and `PracticeQueueView` (fetching from `getStudentPracticeQueue`).
3. **Step 3: Rewire Test Catalog & Runner (`src/routes/test.index.tsx` & `src/routes/test.run.tsx`)**
   - In `test.index.tsx`, render a published TOEFL assessment catalog (Full Mocks, Section Tests, Practice Bank).
   - In `test.run.tsx`, mount `FullMockRunnerOrchestrator` initialized via `startToeflAttempt` and `useAttemptSession`.
4. **Step 4: Rewire Result Report Route (`src/routes/result.$attemptId.tsx`)**
   - Mount `UnifiedScoreReportView` backed by `getToeflScoreReport`.
5. **Step 5: Rewire Landing Page (`src/routes/index.tsx`)**
   - Update hero copy to reflect Midnight Academy's TOEFL iBT 2026 preparation platform.
