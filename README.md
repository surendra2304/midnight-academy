# Midnight Academy

> **"Read. Understand. Explain. Improve."**  
> AI-powered technical question comprehension and articulation assessment platform.

---

## 🌌 Overview

**Midnight Academy** is an engineering assessment and training platform designed to evaluate candidate comprehension of complex technical problem statements before implementation. Candidates are presented with timed technical problems (DSA, System Design, OS, DBMS, Networks) and assessed by Google Gemini on their structured explanations, constraint recognition, and conceptual articulation.

- **Repository**: [https://github.com/surendra2304/midnight-academy](https://github.com/surendra2304/midnight-academy)
- **Live Deployment**: [https://midnight-academy-one.vercel.app](https://midnight-academy-one.vercel.app)

---

## 🚀 Key Features

- **Candidate Comprehension Engine**: Timed reading modes and articulation workflows across DSA, System Design, and Core CS.
- **AI-Powered Evaluation**: Automated grading using Google Gemini `gemini-3.7-flash` across 5 core axes (Clarity, Problem Decomposition, Edge Cases, Constraints, Technical Accuracy).
- **Admin Test Creator**: Multi-step test creation suite with automated AI question drafting.
- **Role-Based Workspaces**: Separate interfaces for Students (`/dashboard`, `/test`, `/result`) and Admins (`/admin`, `/admin/tests`, `/admin/students`).
- **In-App Notification Alerts**: Bell dropdown alerts for test submissions, evaluation completions, and system events.

---

## 🛠️ Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) / React 19 / TypeScript
- **Routing & State**: TanStack Router & TanStack Query
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Database & Auth**: Supabase PostgreSQL & GoTrue Auth
- **AI Engine**: Google Gemini API (`@google/genai 2.18.0`)
- **Email Service**: Gmail SMTP (`nodemailer 9.0.5`)
- **Hosting**: Vercel Serverless SSR

---

## 💻 Local Development

### 1. Prerequisites

- Node.js (v20+)
- Supabase CLI (optional for database migrations)

### 2. Setup

```bash
# Clone the repository
git clone https://github.com/surendra2304/midnight-academy.git
cd midnight-academy

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### 3. Running & Testing

```bash
# Start development server
npm run dev

# Run Type-Check
npx tsc --noEmit

# Run Linter & Formatter
npm run lint
npm run format

# Run Test Suite
npm test --silent

# Production Build Simulation
npm run build
npm run vercel-build
```

---

## 📚 Documentation Directory

Detailed technical and engineering guides are available under the `/docs` directory:

- 📖 [AI Engineering Handoff Guide](docs/AI_HANDOFF.md)
- 🤖 [Machine-Readable Project Context](docs/AI_CONTEXT.md)
- ⚠️ [Known Issues & Bug Tracker](docs/KNOWN_ISSUES.md)
- 🗄️ [Database & Migration Reference](docs/DATABASE.md)
- 🔑 [Environment Configuration Guide](docs/ENVIRONMENT.md)
- 🛠️ [Troubleshooting & Diagnostics Guide](docs/TROUBLESHOOTING.md)
- 🏗️ [Architecture & System Data Flows](docs/ARCHITECTURE.md)

---

## ⚠️ Current Project Status

- **TOEFL iBT 2026 Release**: Fully deployed and active at [midnight-academy-one.vercel.app](https://midnight-academy-one.vercel.app).
- **Database & Migrations**: Additive TOEFL domain schema synchronized on Supabase (`test_versions`, `sections`, `modules`, `content_items`, `rubrics`, etc.).
- **Multi-Modal Examination Suite**: 4-Section Full Mocks (Reading → Listening → Writing → Speaking) and single-skill tests operational.
- **AI Rubric Evaluations**: Gemini-assisted writing and speaking trait evaluations running with structured JSON validation and prompt injection defenses.
- **Unified Score Reporting**: 1.0–6.0 official band scores, estimated 0–120 score, diagnostic error reviews, and personalized weakness practice queues live.
- **Live OTP Registration**: **RESOLVED** ([AUTH-OTP-PROD-001](docs/AUTH_OTP_PROD_RESOLUTION.md)) with dual-port STARTTLS/SSL failover and native OTP fallback.
