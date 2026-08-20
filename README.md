# Midnight Academy

> **"Read. Understand. Explain. Improve."**
> AI-powered technical question comprehension and digestibility training platform.

---

## 🌌 Overview

**Midnight Academy** is a specialized platform designed to train and assess technical question comprehension. Unlike conventional quiz or coding practice tools, Midnight Academy trains students to thoroughly digest, comprehend, and articulate complex problem statements (DSA, System Design, Operating Systems, DBMS, Computer Networks, and Aptitude) **before** jumping straight into implementation.

### 🔄 Core Learning Loop
1. **Timed Reading**: The student is presented with a technical problem under timed exposure.
2. **Recall & Articulation**: The problem disappears, and the student writes what they understood, key constraints, and core objectives in their own words.
3. **AI Comprehension Evaluation**: Intelligent evaluation scores the explanation across key comprehension axes, highlighting missed constraints, conceptual gaps, and action items.

---

## 🚀 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) / React 19
- **Routing & State**: TanStack Router & TanStack Query
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & Auth**: Supabase
- **Language**: TypeScript

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+) or Bun / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/surendra2304/midnight-academy.git
cd midnight-academy

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run development server
npm run dev
```

### Build & Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
midnight-academy/
├── public/              # Static assets
├── src/
│   ├── components/      # UI components & shared widgets
│   ├── hooks/           # Custom React hooks (auth, mobile, etc.)
│   ├── integrations/    # Supabase client & middleware
│   ├── lib/             # Utilities, AI evaluator client & server helpers
│   └── routes/          # TanStack file-based routes
├── supabase/            # Supabase schema migrations and config
└── vite.config.ts       # Vite & TanStack Start configuration
```
