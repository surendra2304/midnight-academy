# TOEFL Platform Production Release Verification Checklist

This document details the hardening verification, security controls, and end-to-end user workflows confirming the platform is production-ready.

---

## 1. End-to-End Learner Journey Verification

| Step  | Workflow Stage                       |  Status  | Verification Detail                                                                                                                                                |
| :---: | :----------------------------------- | :------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Account Creation & Auth**          | VERIFIED | Supabase Auth with custom Nodemailer SMTP / Native OTP fallback. Role assignment (`student`/`admin`) enforced by database triggers and RLS.                        |
| **2** | **Test Catalog & Blueprint Loading** | VERIFIED | Catalog loads published tests (`test_versions.status = 'published'`). Zero answer key or `is_correct` leakage across all network calls.                            |
| **3** | **Pre-Test Hardware Checks**         | VERIFIED | `FullMockRunnerOrchestrator` verifies microphone recording and audio playback capabilities prior to test initialization.                                           |
| **4** | **4-Section Timed Test Execution**   | VERIFIED | Strict sequence: **Reading $\rightarrow$ Listening $\rightarrow$ Writing $\rightarrow$ Speaking**. 1s timer, autosave on answer change, section lockout on expiry. |
| **5** | **Multi-Modal Scoring Pipeline**     | VERIFIED | Deterministic scoring for MCQ, Cloze, and Syntax Ordering. Gemini AI scoring for Email, Academic Discussion, Repetition, and Interview.                            |
| **6** | **Unified Score Report**             | VERIFIED | 1.0–6.0 band scores, estimated 0–120 score, 4 section cards, and target gap calculation against student's goal.                                                    |
| **7** | **Item-by-Item Diagnostic Review**   | VERIFIED | Revisit all questions with selected answers, correct keys, distractor rationales, side-by-side writing corrections, and audio playback.                            |
| **8** | **Analytics & Weakness Diagnostics** | VERIFIED | Deterministic weakness profile ranking, error classifications, task-type time efficiency table, and AI study coach explanation.                                    |
| **9** | **Personalized Practice Queue**      | VERIFIED | Explainable recommendations queue prioritizing top weak skills with evidence trails.                                                                               |

---

## 2. Security & Immutability Hardening

1. **Answer Key Protection**:
   - `blueprint-loader.ts` and Supabase RLS strip `is_correct`, `distractor_rationale`, and `acceptedSequences` from active attempt payloads.
2. **Untrusted Input Isolation**:
   - All Gemini evaluation prompts sandbox student responses inside strict structured-JSON contracts with prompt injection defenses.
3. **Database Immutability**:
   - Published `test_versions` cannot be mutated. PostgreSQL triggers enforce new version creation for any changes.
4. **Evaluation Idempotency**:
   - Response hashing prevents duplicate AI evaluation calls on retry.
5. **Role-Based Access Control (RBAC)**:
   - Admin server functions strictly enforce `admin` or `instructor` role checks before executing question generation, validation, or publishing.

---

## 3. Continuous Integration & Production Build Health

- **Automated CI Workflow**: `.github/workflows/ci.yml` runs typecheck, test suites, and production build on every PR and push to `main`.
- **Vitest Suite**: **17 test suites, 164 unit/integration tests (100% passing)**.
- **Vite/SSR Production Build**: **0 errors**, fully bundled for Vercel Serverless deployment.
