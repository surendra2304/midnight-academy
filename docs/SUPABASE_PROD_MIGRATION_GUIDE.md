# Supabase Production Database Migration Guide (TOEFL 2026 Schema)

This document contains the step-by-step instructions and SQL statements required to bring the **Production Supabase Database** (`midnight-academy-one.vercel.app`) up to the complete TOEFL 2026 domain model.

---

## 1. Safety & Non-Destructive Standard
- **Zero Impact on Existing Data**: All statements use `CREATE TABLE IF NOT EXISTS`, `DO $$ BEGIN ... END $$`, and additive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- **Existing User Data Preserved**: `profiles`, `user_roles`, legacy `tests`, `questions`, `attempts`, and `attempt_answers` remain 100% untouched.

---

## 2. Instructions to Apply Migration in Supabase Dashboard

1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard/project/_).
2. Select your production project.
3. Open the **SQL Editor** from the left navigation sidebar.
4. Click **New Query**.
5. Copy and paste the contents of [`supabase/migrations/20260901100000_toefl_domain_schema.sql`](file:///D:/MidNight%20Academy/supabase/migrations/20260901100000_toefl_domain_schema.sql).
6. Click **Run** (or press `Ctrl+Enter`).

---

## 3. Post-Migration Seeding Pipeline

Once the migration has been executed in the Supabase SQL Editor, run the following automated seed scripts in terminal to populate the initial TOEFL content bank:

```bash
# Seed Reading, Listening, Writing, and Speaking items
npx tsx scripts/seed-toefl-reading.ts
npx tsx scripts/seed-toefl-listening.ts
npx tsx scripts/seed-toefl-writing.ts
npx tsx scripts/seed-toefl-speaking.ts

# Assemble 4-Section Full Mocks
npx tsx scripts/seed-toefl-full-mock.ts

# Seed Substantial Multi-Item Bank & Rubrics
npx tsx scripts/seed-substantial-toefl-bank.ts

# Seed Production Expanded Content Pool
npx tsx scripts/expand-production-toefl-bank.ts

# Verify Row Counts & Content Validator
npx tsx scripts/verify-production-toefl-db.ts
```
