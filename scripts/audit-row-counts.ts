import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function checkRowCounts() {
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

  for (const t of tables) {
    const { data } = await supabase.from(t).select("id");
    console.log(`${t}: count = ${data?.length ?? 0}`);
  }

  const { data: published } = await supabase
    .from("test_versions")
    .select("id, test_id, status, tests(name, code)");
  console.log("\nPublished Test Versions count:", published?.length ?? 0);
  if (published && published.length > 0) {
    console.log(published);
  }
}

checkRowCounts().catch(console.error);
