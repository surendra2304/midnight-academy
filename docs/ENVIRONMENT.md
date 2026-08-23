# Environment Configuration Guide

This document outlines all environment variables required to run Midnight Academy across local development, testing, and production (Vercel & Supabase).

> **SECURITY NOTICE**: Never commit actual secrets or API keys to version control. Use `.env.example` as a template.

---

## Variable Reference Matrix

| Variable                        | Purpose                                      | Execution Context | Required | Example Placeholder                       |
| :------------------------------ | :------------------------------------------- | :---------------- | :------- | :---------------------------------------- |
| `SUPABASE_URL`                  | Supabase API endpoint                        | Server / SSR      | Yes      | `https://your-project.supabase.co`        |
| `SUPABASE_PUBLISHABLE_KEY`      | Public Anon key for client queries           | Server / SSR      | Yes      | `your-anon-key-placeholder`               |
| `SUPABASE_SECRET_KEY`           | Supabase Service Role Key (Admin privileges) | Server-Only       | Yes      | `your-service-role-key-placeholder`       |
| `SUPABASE_PROJECT_ID`           | Project Reference ID                         | Server / Build    | Yes      | `your-project-id`                         |
| `VITE_SUPABASE_URL`             | Supabase API endpoint for browser client     | Client (Browser)  | Yes      | `https://your-project.supabase.co`        |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public Anon key for browser client           | Client (Browser)  | Yes      | `your-anon-key-placeholder`               |
| `VITE_SUPABASE_PROJECT_ID`      | Project Reference ID for browser client      | Client (Browser)  | Yes      | `your-project-id`                         |
| `GEMINI_API_KEY`                | Primary Google Gemini API key                | Server-Only       | Yes      | `your-primary-gemini-key`                 |
| `GEMINI_FALLBACK_API_KEY`       | Secondary fallback key for quota overflow    | Server-Only       | Optional | `your-fallback-gemini-key`                |
| `GEMINI_MODEL`                  | Gemini Model Identifier                      | Server-Only       | Yes      | `gemini-3.7-flash`                        |
| `SMTP_USER`                     | Gmail Account email address                  | Server-Only       | Yes      | `user@gmail.com`                          |
| `SMTP_APP_PASSWORD`             | Google 16-character App Password             | Server-Only       | Yes      | `xxxx-xxxx-xxxx-xxxx`                     |
| `SMTP_FROM_NAME`                | Sender display name                          | Server-Only       | No       | `Midnight Academy`                        |
| `APP_URL`                       | Canonical Base URL of the application        | Client / Server   | Yes      | `https://midnight-academy-one.vercel.app` |

---

## Environment Setup Instructions

### 1. Local Development (`.env`)

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Populate the values with your local Supabase credentials and Gemini/Gmail testing keys.

### 2. Vercel Production Environment

In the Vercel Project Settings > Environment Variables:

- Ensure all variables above are defined under **Production** and **Preview**.
- Mark `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY`, `GEMINI_FALLBACK_API_KEY`, and `SMTP_APP_PASSWORD` as **Sensitive / Encrypted**.
