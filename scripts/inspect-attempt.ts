import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function run() {
  const { data: it } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", "c5010000-0000-0000-0000-000000000001")
    .single();
  console.log("Entire Item:", JSON.stringify(it, null, 2));
}

run();
