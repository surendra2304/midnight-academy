/**
 * Production-safe blueprint loader.
 * Never substitutes a synthetic production blueprint.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type {
  ClientTestBlueprint,
  ClientSectionBlueprint,
  ClientContentItem,
} from "./session-state";
import type { ToeflExamMode, ToeflSectionType, ToeflItemType } from "@/types/toefl";

function fail(message: string): never {
  throw new Error(`Invalid published assessment blueprint: ${message}`);
}

export async function loadTestBlueprint(
  testVersionId: string,
  examMode: ToeflExamMode = "practice",
  sectionTypeFilter?: ToeflSectionType,
): Promise<ClientTestBlueprint> {
  const { data: version, error: versionErr } = await supabaseAdmin
    .from("test_versions")
    .select("id, test_id, blueprint_version, status, tests(name)")
    .eq("id", testVersionId)
    .single();

  if (versionErr || !version) {
    fail("test version does not exist");
  }

  if (version.status !== "published") {
    fail("test version is not published");
  }

  let sectionQuery = supabaseAdmin
    .from("sections")
    .select("id, section_type, section_order, timing_seconds, instructions, config")
    .eq("test_version_id", version.id)
    .order("section_order", { ascending: true });

  if (sectionTypeFilter) {
    sectionQuery = sectionQuery.eq("section_type", sectionTypeFilter);
  }

  const { data: sections, error: sectionErr } = await sectionQuery;

  if (sectionErr) {
    fail(`section query failed: ${sectionErr.message}`);
  }
  if (!sections || sections.length === 0) {
    fail("no sections exist for this published version");
  }

  const sectionIds = sections.map((section) => section.id);

  const { data: modules, error: moduleErr } = await supabaseAdmin
    .from("modules")
    .select("id, section_id, stage_index, difficulty_band, routing_rule, module_order")
    .in("section_id", sectionIds)
    .order("module_order", { ascending: true });

  if (moduleErr) {
    fail(`module query failed: ${moduleErr.message}`);
  }

  const moduleToSection = new Map<string, string>();
  for (const module of modules ?? []) {
    moduleToSection.set(module.id, module.section_id);
  }

  const moduleIds = (modules ?? []).map((module) => module.id);
  if (moduleIds.length === 0) {
    fail("published sections contain no modules");
  }

  const { data: items, error: itemErr } = await supabaseAdmin
    .from("content_items")
    .select("id, module_id, section_type, item_type, difficulty, skill_tags, payload, item_order")
    .in("module_id", moduleIds)
    .order("item_order", { ascending: true });

  if (itemErr) {
    fail(`content query failed: ${itemErr.message}`);
  }
  if (!items || items.length === 0) {
    fail("published sections contain no content");
  }

  const itemIds = items.map((item) => item.id);

  const { data: options, error: optionErr } = await supabaseAdmin
    .from("question_options")
    .select("id, content_item_id, option_key, option_text, option_order")
    .in("content_item_id", itemIds)
    .order("option_order", { ascending: true });

  if (optionErr) {
    fail(`option query failed: ${optionErr.message}`);
  }

  const optionsByItem = new Map<string, typeof options>();
  for (const option of options ?? []) {
    const list = optionsByItem.get(option.content_item_id) ?? [];
    list.push(option);
    optionsByItem.set(option.content_item_id, list);
  }

  const clientSections: ClientSectionBlueprint[] = sections.map((section) => {
    const sectionItems: ClientContentItem[] = items
      // STRICT association: module -> section. Never use section_type as a fallback.
      .filter((item) =>
        Boolean(item.module_id && moduleToSection.get(item.module_id) === section.id),
      )
      .sort((a, b) => a.item_order - b.item_order)
      .map((item) => ({
        id: item.id,
        moduleId: item.module_id!,
        sectionType: item.section_type as ToeflSectionType,
        itemType: item.item_type as ToeflItemType,
        difficulty: item.difficulty,
        skillTags: item.skill_tags ?? [],
        payload: (item.payload as Record<string, unknown>) ?? {},
        options: (optionsByItem.get(item.id) ?? []).map((option) => ({
          id: option.id,
          optionKey: option.option_key,
          optionText: option.option_text,
          optionOrder: option.option_order,
        })),
        itemOrder: item.item_order,
      }));

    if (sectionItems.length === 0) {
      fail(`section ${section.id} has no content items`);
    }

    return {
      id: section.id,
      sectionType: section.section_type as ToeflSectionType,
      sectionOrder: section.section_order,
      timingSeconds: section.timing_seconds,
      instructions: section.instructions || `${section.section_type} section`,
      isTimed: examMode !== "practice",
      items: sectionItems,
    };
  });

  return {
    testVersionId: version.id,
    testId: version.test_id ?? version.id,
    name:
      (version.tests as { name?: string } | null)?.name ??
      "Midnight Academy TOEFL Practice Assessment",
    examMode,
    blueprintVersion: version.blueprint_version,
    sections: clientSections,
  };
}
