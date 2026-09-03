import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function checkListeningItems() {
  const sectionId = "c3000002-0000-0000-0000-000000000020";
  const { data: modules, error: modErr } = await supabase.from("modules").select("*").eq("section_id", sectionId);
  console.log("Modules:", modules, "Error:", modErr);

  const moduleIds = (modules ?? []).map((m) => m.id);
  const { data: items } = await supabase
    .from("content_items")
    .select("id, item_order, item_type, payload")
    .in("module_id", moduleIds)
    .order("item_order", { ascending: true });

  console.log("Items in Listening section:", items?.map(i => ({ id: i.id, order: i.item_order, type: i.item_type, audioUrl: (i.payload as any)?.audioUrl, promptAudioUrl: (i.payload as any)?.promptAudioUrl })));
}

checkListeningItems();
