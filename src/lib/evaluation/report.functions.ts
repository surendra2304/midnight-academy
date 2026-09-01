/**
 * TOEFL Unified Score Report Data Loader (Server-Side)
 * Aggregates published score reports, section breakdowns, error patterns, and practice recommendations.
 */

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const getToeflScoreReport = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { attemptId } = data;

    // 1. Fetch Attempt & Parent Test
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from('attempts')
      .select('id, test_id, test_version_id, student_id, status, score, percentage_score, started_at, completed_at, tests(id, name, category, difficulty, code)')
      .eq('id', attemptId)
      .single();

    if (aErr || !attempt) {
      throw new Error('Attempt not found');
    }

    // 2. Fetch Score Report
    const { data: report } = await supabaseAdmin
      .from('score_reports')
      .select('*')
      .eq('attempt_id', attemptId)
      .maybeSingle();

    // 3. Fetch Attempt Sections
    const { data: attemptSections } = await supabaseAdmin
      .from('attempt_sections')
      .select('id, section_id, status, raw_score, section_band, time_spent_seconds, sections(id, section_type, timing_seconds, section_order)')
      .eq('attempt_id', attemptId)
      .order('created_at', { ascending: true });

    // 4. Fetch Responses, Items, and Evaluations
    const attemptSecIds = (attemptSections || []).map((s) => s.id);

    const { data: responses } = await supabaseAdmin
      .from('responses')
      .select('id, attempt_section_id, content_item_id, raw_answer, normalized_answer, is_correct, score, time_spent_ms, flagged, answered_at, content_items(id, section_type, item_type, difficulty, skill_tags, payload)')
      .in('attempt_section_id', attemptSecIds);

    const respIds = (responses || []).map((r) => r.id);

    const { data: evaluations } = await supabaseAdmin
      .from('evaluations')
      .select('*')
      .in('response_id', respIds);

    const evalByResp = new Map<string, (typeof evaluations)[0]>();
    for (const ev of evaluations || []) {
      evalByResp.set(ev.response_id, ev);
    }

    // 5. Fetch Question Options for Objective Items
    const contentItemIds = (responses || []).map((r) => r.content_item_id);
    const { data: options } = await supabaseAdmin
      .from('question_options')
      .select('id, content_item_id, option_key, option_text, is_correct, distractor_rationale')
      .in('content_item_id', contentItemIds);

    const optionsByItem = new Map<string, typeof options>();
    for (const opt of options || []) {
      const list = optionsByItem.get(opt.content_item_id) || [];
      list.push(opt);
      optionsByItem.set(opt.content_item_id, list);
    }

    // 6. Fetch Student Target Score from Profile or Study Plans
    const { data: studyPlan } = await supabaseAdmin
      .from('study_plans')
      .select('target_overall_band')
      .eq('student_id', context.userId)
      .maybeSingle();

    // 7. Fetch Practice Recommendations
    const { data: recommendations } = await supabaseAdmin
      .from('recommendations')
      .select('*')
      .eq('student_id', context.userId)
      .limit(6);

    return {
      attempt,
      report,
      targetScore: studyPlan?.target_overall_band || 5.0,
      attemptSections: attemptSections || [],
      responses: (responses || []).map((r) => ({
        ...r,
        evaluation: evalByResp.get(r.id) || null,
        options: optionsByItem.get(r.content_item_id) || [],
      })),
      recommendations: recommendations || [],
    };
  });
