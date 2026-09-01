/**
 * Test Definition & Blueprint Loader
 * Hydrates published test versions into client-safe runtime blueprints.
 * Guarantees that answer keys, is_correct, and distractor_rationales are NEVER serialized to clients.
 */

import { supabaseAdmin } from '@/integrations/supabase/client.server';
import type { ClientTestBlueprint, ClientSectionBlueprint, ClientContentItem } from './session-state';
import type { ToeflExamMode, ToeflSectionType, ToeflItemType } from '@/types/toefl';

export async function loadTestBlueprint(
  testVersionId: string,
  examMode: ToeflExamMode = 'practice',
  sectionTypeFilter?: ToeflSectionType,
): Promise<ClientTestBlueprint> {
  // 1. Fetch test version & parent test metadata
  const { data: version, error: versionErr } = await supabaseAdmin
    .from('test_versions')
    .select('id, test_id, blueprint_version, status, tests(name)')
    .eq('id', testVersionId)
    .single();

  if (versionErr || !version) {
    throw new Error(`Test blueprint version not found: ${testVersionId}`);
  }

  // 2. Fetch sections in strict order
  let sectionQuery = supabaseAdmin
    .from('sections')
    .select('id, section_type, section_order, timing_seconds, instructions, config')
    .eq('test_version_id', version.id)
    .order('section_order', { ascending: true });

  if (sectionTypeFilter) {
    sectionQuery = sectionQuery.eq('section_type', sectionTypeFilter);
  }

  const { data: sections, error: secErr } = await sectionQuery;
  if (secErr || !sections || sections.length === 0) {
    throw new Error('No sections found for this test version');
  }

  const sectionIds = sections.map((s) => s.id);

  // 3. Fetch modules for these sections
  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('id, section_id, stage_index, difficulty_band, module_order')
    .in('section_id', sectionIds)
    .order('module_order', { ascending: true });

  const moduleIds = (modules || []).map((m) => m.id);

  // 4. Fetch content items
  const { data: items } = await supabaseAdmin
    .from('content_items')
    .select('id, module_id, section_type, item_type, difficulty, skill_tags, payload, item_order')
    .in('section_type', sections.map((s) => s.section_type))
    .order('item_order', { ascending: true });

  const itemIds = (items || []).map((i) => i.id);

  // 5. Fetch options for items (STRIP is_correct and distractor_rationale for security!)
  const { data: rawOptions } = await supabaseAdmin
    .from('question_options')
    .select('id, content_item_id, option_key, option_text, option_order')
    .in('content_item_id', itemIds)
    .order('option_order', { ascending: true });

  const optionsByItem = new Map<string, typeof rawOptions>();
  for (const opt of rawOptions || []) {
    const list = optionsByItem.get(opt.content_item_id) || [];
    list.push(opt);
    optionsByItem.set(opt.content_item_id, list);
  }

  // 6. Assemble client-safe blueprint
  const clientSections: ClientSectionBlueprint[] = sections.map((sec) => {
    const secItems: ClientContentItem[] = (items || [])
      .filter((i) => i.section_type === sec.section_type)
      .map((i) => ({
        id: i.id,
        moduleId: i.module_id,
        sectionType: i.section_type as ToeflSectionType,
        itemType: i.item_type as ToeflItemType,
        difficulty: i.difficulty,
        skillTags: i.skill_tags || [],
        payload: (i.payload as Record<string, unknown>) || {},
        options: (optionsByItem.get(i.id) || []).map((opt) => ({
          id: opt.id,
          optionKey: opt.option_key,
          optionText: opt.option_text,
          optionOrder: opt.option_order,
        })),
        itemOrder: i.item_order,
      }));

    return {
      id: sec.id,
      sectionType: sec.section_type as ToeflSectionType,
      sectionOrder: sec.section_order,
      timingSeconds: sec.timing_seconds,
      instructions: sec.instructions,
      isTimed: examMode !== 'practice', // Practice mode can be untimed
      items: secItems,
    };
  });

  return {
    testVersionId: version.id,
    testId: version.test_id,
    name: (version.tests as { name?: string })?.name || 'TOEFL iBT Assessment',
    examMode,
    blueprintVersion: version.blueprint_version,
    sections: clientSections,
  };
}
