# Database Architecture & Migration Reference

This document provides a complete overview of the Supabase PostgreSQL database schemas, constraints, relationships, security policies, and migration history for Midnight Academy.

---

## 1. Database Schema & Tables

### Table: `profiles`

Stores student and admin profile information linked to Supabase Auth (`auth.users`).

| Column       | Type          | Constraints                                                | Description               |
| :----------- | :------------ | :--------------------------------------------------------- | :------------------------ |
| `id`         | `uuid`        | `PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE` | Matches user's Auth UUID. |
| `email`      | `text`        | `NOT NULL`                                                 | User email address.       |
| `full_name`  | `text`        | `NULLABLE`                                                 | Display name.             |
| `avatar_url` | `text`        | `NULLABLE`                                                 | Profile picture URL.      |
| `created_at` | `timestamptz` | `DEFAULT now()`                                            | Creation timestamp.       |
| `updated_at` | `timestamptz` | `DEFAULT now()`                                            | Last update timestamp.    |

**RLS Policies**:

- `profiles_select_all`: Authenticated users can view profiles.
- `profiles_update_own`: Users can update only their own profile (`auth.uid() = id`).

---

### Table: `user_roles`

Authoritative role assignment for Role-Based Access Control (RBAC).

| Column       | Type          | Constraints                                             | Description         |
| :----------- | :------------ | :------------------------------------------------------ | :------------------ |
| `id`         | `uuid`        | `PRIMARY KEY DEFAULT gen_random_uuid()`                 | Unique record ID.   |
| `user_id`    | `uuid`        | `NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE` | User UUID.          |
| `role`       | `app_role`    | `NOT NULL, ENUM ('admin', 'student')`                   | Assigned user role. |
| `created_at` | `timestamptz` | `DEFAULT now()`                                         | Timestamp.          |

**RLS Policies**:

- `user_roles_select_own`: Users can read their own role records (`auth.uid() = user_id`).
- _Inserts & Updates_: Strictly executed via Supabase Service Role in server functions.

---

### Table: `tests`

Test configurations and assessment metadata.

| Column               | Type          | Constraints                             | Description                                       |
| :------------------- | :------------ | :-------------------------------------- | :------------------------------------------------ |
| `id`                 | `uuid`        | `PRIMARY KEY DEFAULT gen_random_uuid()` | Test unique ID.                                   |
| `title`              | `text`        | `NOT NULL`                              | Test title (e.g. "DSA Comprehension Assessment"). |
| `description`        | `text`        | `NULLABLE`                              | Assessment description.                           |
| `test_code`          | `text`        | `UNIQUE NOT NULL`                       | 9-character join code (e.g. `DSA-X7K29`).         |
| `category`           | `text`        | `NOT NULL DEFAULT 'DSA'`                | Subject category.                                 |
| `time_limit_minutes` | `integer`     | `NOT NULL DEFAULT 45`                   | Duration allowed.                                 |
| `is_active`          | `boolean`     | `NOT NULL DEFAULT true`                 | Availability toggle.                              |
| `created_by`         | `uuid`        | `REFERENCES auth.users(id)`             | Admin creator ID.                                 |
| `created_at`         | `timestamptz` | `DEFAULT now()`                         | Timestamp.                                        |

**RLS Policies**:

- `tests_select_active`: Authenticated users can view active tests (`is_active = true`).
- `tests_admin_all`: Admin creators have full CRUD on tests they own.

---

### Table: `questions`

Structured technical question statements belonging to a test.

| Column              | Type          | Constraints                                        | Description                     |
| :------------------ | :------------ | :------------------------------------------------- | :------------------------------ |
| `id`                | `uuid`        | `PRIMARY KEY DEFAULT gen_random_uuid()`            | Question unique ID.             |
| `test_id`           | `uuid`        | `NOT NULL, REFERENCES tests(id) ON DELETE CASCADE` | Parent test ID.                 |
| `title`             | `text`        | `NOT NULL`                                         | Question title.                 |
| `problem_statement` | `text`        | `NOT NULL`                                         | Full technical prompt.          |
| `constraints`       | `text[]`      | `NOT NULL DEFAULT '{}'`                            | Array of technical constraints. |
| `order_index`       | `integer`     | `NOT NULL DEFAULT 0`                               | Sequence in test.               |
| `created_at`        | `timestamptz` | `DEFAULT now()`                                    | Timestamp.                      |

**RLS Policies**:

- Accessible if the parent test is accessible.

---

### Table: `attempts`

Student test attempt sessions.

| Column         | Type          | Constraints                                             | Description                          |
| :------------- | :------------ | :------------------------------------------------------ | :----------------------------------- |
| `id`           | `uuid`        | `PRIMARY KEY DEFAULT gen_random_uuid()`                 | Attempt unique ID.                   |
| `test_id`      | `uuid`        | `NOT NULL, REFERENCES tests(id) ON DELETE CASCADE`      | Test taken.                          |
| `user_id`      | `uuid`        | `NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE` | Student UUID.                        |
| `status`       | `text`        | `NOT NULL DEFAULT 'in_progress'`                        | `'in_progress'` \| `'completed'`.    |
| `score`        | `numeric`     | `NULLABLE`                                              | Overall comprehension score (0-100). |
| `started_at`   | `timestamptz` | `DEFAULT now()`                                         | Start time.                          |
| `submitted_at` | `timestamptz` | `NULLABLE`                                              | Finish time.                         |

**RLS Policies**:

- `attempts_student_access`: Students can view/manage their own attempts (`auth.uid() = user_id`).
- `attempts_admin_view`: Admins can view attempts for tests they created.

---

### Table: `attempt_answers`

Student written comprehension explanations and corresponding AI evaluation feedback.

| Column             | Type          | Constraints                                            | Description                       |
| :----------------- | :------------ | :----------------------------------------------------- | :-------------------------------- |
| `id`               | `uuid`        | `PRIMARY KEY DEFAULT gen_random_uuid()`                | Answer ID.                        |
| `attempt_id`       | `uuid`        | `NOT NULL, REFERENCES attempts(id) ON DELETE CASCADE`  | Parent attempt.                   |
| `question_id`      | `uuid`        | `NOT NULL, REFERENCES questions(id) ON DELETE CASCADE` | Question ID.                      |
| `explanation_text` | `text`        | `NOT NULL`                                             | Student written explanation.      |
| `ai_score`         | `numeric`     | `NULLABLE`                                             | Question score (0-100).           |
| `ai_feedback`      | `jsonb`       | `NULLABLE`                                             | Structured feedback & radar axes. |
| `created_at`       | `timestamptz` | `DEFAULT now()`                                        | Timestamp.                        |

---

### Table: `email_verifications`

Storage for OTP hashes and temporary verification tokens.

| Column                    | Type          | Constraints     | Description                     |
| :------------------------ | :------------ | :-------------- | :------------------------------ |
| `id`                      | `uuid`        | `PRIMARY KEY`   | Verification ID.                |
| `email`                   | `text`        | `NOT NULL`      | Lowercased target email.        |
| `otp_hash`                | `text`        | `NOT NULL`      | SHA-256 hash of 6-digit OTP.    |
| `verification_token_hash` | `text`        | `NULLABLE`      | SHA-256 hash of post-OTP token. |
| `attempts_count`          | `integer`     | `DEFAULT 0`     | Failed attempts count.          |
| `max_attempts`            | `integer`     | `DEFAULT 5`     | Max allowed attempts.           |
| `verified`                | `boolean`     | `DEFAULT false` | Whether OTP was verified.       |
| `used`                    | `boolean`     | `DEFAULT false` | Whether registration finished.  |
| `expires_at`              | `timestamptz` | `NOT NULL`      | Expiration time (10 min).       |
| `resend_available_at`     | `timestamptz` | `NOT NULL`      | Cooldown time (60s).            |

**RLS**: Strict Service Role access only.

---

### Table: `notifications`

In-app notifications for alerts, submissions, and evaluations.

| Column       | Type          | Constraints                                             | Description                             |
| :----------- | :------------ | :------------------------------------------------------ | :-------------------------------------- |
| `id`         | `uuid`        | `PRIMARY KEY DEFAULT gen_random_uuid()`                 | Notification ID.                        |
| `user_id`    | `uuid`        | `NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE` | Recipient ID.                           |
| `title`      | `text`        | `NOT NULL`                                              | Alert title.                            |
| `message`    | `text`        | `NOT NULL`                                              | Alert content.                          |
| `type`       | `text`        | `NOT NULL DEFAULT 'info'`                               | `'info'` \| `'evaluation'` \| `'test'`. |
| `is_read`    | `boolean`     | `NOT NULL DEFAULT false`                                | Read status toggle.                     |
| `created_at` | `timestamptz` | `DEFAULT now()`                                         | Timestamp.                              |

**RLS Policies**:

- `notifications_select_own`: Users can view their own notifications (`auth.uid() = user_id`).
- `notifications_update_own`: Users can update (mark as read) their own notifications.

---

## 2. Migration History

| Migration File                                            | Description & Changes                                                                                                                        |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `20260813041358_15e3afe1-4f2b-49ef-bd20-c4fdcfcf51b9.sql` | Created `app_role` enum, `profiles`, `user_roles`, `tests`, `questions`, `attempts`, `attempt_answers` tables and foundational RLS policies. |
| `20260813041423_6c56f00e-7bc0-46ae-ab90-6bae0257c8b2.sql` | Added automatic trigger to populate `profiles` on `auth.users` insert.                                                                       |
| `20260820215000_create_email_verifications.sql`           | Created `email_verifications` table with indexes for fast email lookup.                                                                      |
| `20260821100000_ensure_default_dsa_test.sql`              | Idempotently seeded the default `DSA-X7K29` test and 3 comprehensive DSA questions.                                                          |
| `20260821100001_notifications_and_admin_rls.sql`          | Created `notifications` table and added admin attempt view policies.                                                                         |
| `20260821100002_fix_rls_policies.sql`                     | Replaced recursive subqueries with direct `auth.uid()` checks across `profiles` and `user_roles`.                                            |
