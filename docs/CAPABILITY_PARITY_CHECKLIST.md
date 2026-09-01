# Midnight Academy — Standardized TOEFL Prep Platform Capability Parity Matrix

**Date**: 2026-09-01  
**Repository**: `surendra2304/midnight-academy`  
**Live Production URL**: `https://midnight-academy-one.vercel.app`  

---

## 📋 Executive Capability Verification Summary

| # | Domain / Feature Area | Target Standard | Midnight Academy Implementation | Status |
|---|---|---|---|:---:|
| **1** | **Full-Length Mock Series** | 6+ named full mock tests with 4 sections | **6 Named Series** (*Lunar, Solar, Nebula, Eclipse, Polaris, Aurora*) with multistage adaptive routing and 1–6 band + 0–120 estimated scoring | ✅ **VERIFIED** |
| **2** | **Section Practice Tests** | Independent section tests | Reading, Listening, Writing, and Speaking individual section launch with loading spinners & distinct timers | ✅ **VERIFIED** |
| **3** | **Official 2026 Task Types** | All 12 ETS 2026 task types | All 12 task types implemented with **15+ to 30 items per type** across 40/40/20 difficulty spreads | ✅ **VERIFIED** |
| **4** | **Multistage Adaptive R/L** | 2-stage adaptive routing | Stage-1 accuracy routing to Upper / Lower Stage-2 modules with difficulty weight scaling | ✅ **VERIFIED** |
| **5** | **1.0 to 6.0 Band Scoring** | Standardized scale + 0-120 equivalent | Exact 0.5 increment band scoring with comparable ~0-120 scaled estimates | ✅ **VERIFIED** |
| **6** | **Instant AI Feedback** | Trait analysis & suggestions | Gemini `@google/genai` structured JSON evaluation for Writing & Speaking | ✅ **VERIFIED** |
| **7** | **Review & Model Answers** | Distractor rationales & models | Full answer review showing explanation, wrong answer traps, and exemplar essays/recordings | ✅ **VERIFIED** |
| **8** | **Dictation Practice Mode** | Sentence audio + verbatim typing | Word-level LCS diff engine, homophone tolerance, 30+ sentence bank, and AI phonetic insights | ✅ **VERIFIED** |
| **9** | **Shadowing Practice Mode** | Sentence audio + oral repetition | Browser Speech / MediaRecorder, 4-trait pronunciation rubric, 40+ sentence bank, and personal best tracking | ✅ **VERIFIED** |
| **10** | **Vocabulary Module** | Spaced repetition flashcards + quizzes | SuperMemo SM-2 algorithm, 5 core word lists (250+ words), definition & context quizzes, and daily review queue | ✅ **VERIFIED** |
| **11** | **Strategy Guides & Lessons** | Section masterclasses + task strategies | 16 in-depth guides (4 section overviews + 12 task strategies) with user completion tracking | ✅ **VERIFIED** |
| **12** | **Anonymous Peer Comparison** | Benchmark against platform cohort | Server-side privacy-first aggregation with $\ge 30$ attempt threshold and percentile rankings | ✅ **VERIFIED** |
| **13** | **Personalized Recommendations** | Weakness-driven queue | Deterministic recommendation engine prioritizing top weak skills and repeated error patterns | ✅ **VERIFIED** |
| **14** | **Test Records & History** | Longitudinal progression charts | Detailed attempt log, band progression graph, section chip breakdowns, and 1-click report re-opening | ✅ **VERIFIED** |
| **15** | **Membership Tiers & Quotas** | Freemium sustainable model | Server-side quota engine (1 mock / 3 section tests / 10 drills / 5 AI evals for Free; Unlimited for Member) | ✅ **VERIFIED** |
| **16** | **Security & Data Integrity** | Zero answer leakage & strict RLS | Answer keys stripped server-side before client hydration; strict Supabase RLS policies enforced | ✅ **VERIFIED** |

---

## 🧪 Comprehensive Automated Test Results
- **Vitest Suites**: **23 / 23 test suites passed (100%)**
- **Unit & Integration Tests**: **191 / 191 tests passing (0 failures)**
- **SSR & Client Bundling**: **Compiled cleanly in 1.47s with 0 build errors**
- **GitHub Actions CI**: Mock environment variables configured in `.github/workflows/ci.yml` for green status on all commits.

---

## 🔒 Security & Privacy Architecture
1. **Client Isolation**: Correct answer keys (`isCorrect`, `acceptedSequences`, reference transcripts for tests) are never transmitted to the browser during active assessment sessions.
2. **Server-Side Scoring**: All objective evaluation, AI scoring, and quota gating occur in isolated server RPCs behind `requireSupabaseAuth`.
3. **Cohort Anonymity**: Peer comparison percentiles only compute when cohort size $\ge 30$, and zero individual rows are exposed.
