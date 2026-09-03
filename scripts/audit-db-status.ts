import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function checkDb() {
  const tables = [
    "test_versions",
    "sections",
    "modules",
    "content_items",
    "content_assets",
    "question_options",
    "rubrics",
    "attempt_sections",
    "responses",
    "evaluations",
    "score_reports",
    "skills",
    "response_skills",
    "recommendations",
    "study_plans",
    "content_tags",
  ];

  console.log("=== DATABASE AUDIT RESULTS ===");
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`${t}: ERROR (${error.message})`);
    } else {
      console.log(`${t}: EXISTS, rows = ${count}`);
    }
  }

  const { data: published } = await supabase
    .from("test_versions")
    .select("id, test_id, status, tests(name, code)");
  console.log("\n=== PUBLISHED TEST VERSIONS ===");
  console.log(JSON.stringify(published, null, 2));
}

checkDb().catch(console.error);
