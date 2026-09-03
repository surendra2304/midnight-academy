import dotenv from "dotenv";
dotenv.config();
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

async function applyMigrationDirect() {
  console.log(
    "Applying TOEFL domain migration to Supabase production via management API / SQL exec...",
  );

  const sql = readFileSync(
    resolve(process.cwd(), "supabase/migrations/20260901100000_toefl_domain_schema.sql"),
    "utf-8",
  );
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY!;

  // Execute SQL via Supabase REST query endpoint if available
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  console.log("Migration response status:", res.status, res.statusText);
  const text = await res.text();
  console.log("Response body:", text);
}

applyMigrationDirect().catch(console.error);
