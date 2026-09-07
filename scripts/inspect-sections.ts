import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function run() {
  const { data: sections } = await supabase
    .from("sections")
    .select("id, section_type, section_order, test_version_id")
    .eq("test_version_id", "f2000000-0000-0000-0000-000000000000")
    .order("section_order", { ascending: true });
  console.log("Sections for Moon:", sections);

  const { data: item } = await supabase
    .from("content_items")
    .select("id, module_id, section_type, item_type")
    .eq("id", "f5000000-0000-0000-0003-000000000012")
    .single();
  console.log("Item:", item);

  if (item?.module_id) {
    const { data: mod } = await supabase
      .from("modules")
      .select("id, section_id")
      .eq("id", item.module_id)
      .single();
    console.log("Module:", mod);
  }
}

run();
