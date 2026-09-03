import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function main() {
  const t = {
    id: "e1000000-0000-0000-0000-000000000001",
    name: "English Practice Test 1",
    category: "English Comprehension",
    difficulty: "Easy",
    question_count: 3,
    seconds_per_question: 45,
    response_seconds: 90,
    status: "active",
    is_practice: true,
    code: "ENG-PRAC-01",
  };
  const { error } = await supabase.from("tests").upsert(t, { onConflict: "id" });
  console.log(error);
}
main();
