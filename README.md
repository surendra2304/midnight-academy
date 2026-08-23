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

- **Database & Migrations**: Synchronized and reconciled remotely on Supabase.
- **Core Test Taking & AI Grading**: Operational.
- **Authentication**: Email/Password and Google OAuth operational.
- **Live OTP Registration**: Under active investigation (see [Issue AUTH-OTP-PROD-001](docs/KNOWN_ISSUES.md)).
