import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function inspect() {
  const attemptId = "c50fb940-0624-475c-9149-4d174122fe8f";
  const { data: att } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .single();
  console.log("Attempt:", JSON.stringify(att, null, 2));

  const { data: secs } = await supabase
    .from("attempt_sections")
    .select("*, sections(*)")
    .eq("attempt_id", attemptId)
    .order("created_at", { ascending: true });
  console.log("Attempt Sections:", JSON.stringify(secs, null, 2));

  const { data: resps } = await supabase
    .from("responses")
    .select("*")
    .in("attempt_section_id", (secs ?? []).map((s) => s.id));
  console.log("Responses:", JSON.stringify(resps, null, 2));
}

inspect();
