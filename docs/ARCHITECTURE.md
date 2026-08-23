# Architecture & Data Flow Reference

This document maps the architectural topology, communication protocols, and runtime data flows across Midnight Academy.

---

## 1. High-Level Architectural Diagram

```
+-------------------------------------------------------------------------+
|                        CLIENT TIER (Browser)                            |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                 React 19 & TanStack Router UI                     |  |
|  |  - Landing Page (/)               - Test Runner (/test/run)       |  |
|  |  - Auth Hub (/auth)               - Result Breakdowns (/result)   |  |
|  |  - Student Dashboard (/dashboard) - Admin Studio (/admin/*)       |  |
|  +-------------------------------------------------------------------+  |
|         |                                      |                        |
|         | (Direct Client Queries)              | (RPC Server Calls)     |
|         v                                      v                        |
|  +---------------------------+       +-------------------------------+  |
|  | Supabase Browser Client   |       | TanStack Start Server Client  |  |
|  | (Anon Key / Auth Session) |       | (RPC POST /_serverFn/*)       |  |
|  +---------------------------+       +-------------------------------+  |
+------------------------------------------------|------------------------+
                                                 |
                                                 v
+-------------------------------------------------------------------------+
|                  SERVER TIER (TanStack Start / Nitro SSR)               |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                       Server Functions Layer                      |  |
|  |  - auth.functions.ts            - admin.functions.ts              |  |
|  |  - attempts.functions.ts        - notifications.functions.ts      |  |
|  +-------------------------------------------------------------------+  |
|         |                     |                     |                   |
|         |                     |                     |                   |
|         v                     v                     v                   |
|  +---------------+   +------------------+   +------------------------+  |
|  |  PostgreSQL   |   |   Google Gemini  |   |   Nodemailer (SMTP)    |  |
|  | (Supabase SDK |   |  (@google/genai) |   | (Gmail SSL Port 465)   |  |
|  | Service Role) |   |                  |   |                        |  |
|  +---------------+   +------------------+   +------------------------+  |
+---------|---------------------|--------------------------|--------------+
          v                     v                          v
+------------------+   +------------------+   +------------------------+
|  Supabase Cloud  |   |   Gemini 3.7     |   |   Gmail SMTP Servers   |
|   PostgreSQL     |   |   Flash API      |   |   (smtp.gmail.com)     |
+------------------+   +------------------+   +------------------------+
```

---

## 2. Core Data Flow Workflows

### A. Test Execution & AI Evaluation Lifecycle

```
1. Student enters test code (DSA-X7K29) on /test
2. Student views Onboarding Instructions -> Clicks Start
3. Question 1 displays in Timed Mode -> Timer starts
4. Student reads problem statement -> Transitions to Articulation view
5. Student enters written explanation -> Submits to submitQuestionAnswer
6. Answer saved to `attempt_answers` table
7. Repeat for all test questions
8. Student clicks "Finalize Test" -> Calls `finalizeTestAttempt`
9. Server function invokes Gemini 3.7 Flash AI Evaluator
10. AI Evaluator analyzes explanations across 5 core axes
11. Scores & JSON feedback saved to `attempt_answers` and `attempts`
12. Notification dispatched to student -> Redirected to /result/:attemptId
```

### B. Custom Email OTP Registration Flow

```
1. User enters email at /auth -> Calls requestRegistrationOtp
2. Server validates email is not already registered in auth.users
3. Server generates 6-digit cryptographically secure OTP
4. Server dispatches email via Gmail SMTP (Nodemailer 465 SSL)
5. IF (SMTP succeeds):
     - Saves SHA-256(OTP) to `email_verifications` table
     - Sets resendAvailableAt (60s cooldown)
     - Returns { success: true }
   ELSE:
     - Returns { error: "delivery_failed" }
     - Does NOT save record / Does NOT start cooldown
6. User enters 6-digit OTP -> Calls verifyRegistrationOtp
7. Server validates hash, attempts count, and expiry (10 min)
8. Server returns short-lived `verificationToken`
9. User inputs password -> Calls completeRegistrationWithPassword
10. Server creates user via supabaseAdmin.auth.admin.createUser
11. User authenticated and redirected to /dashboard
```
