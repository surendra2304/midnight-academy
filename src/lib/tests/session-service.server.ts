/**
 * Server-Side Attempt Session Service
 * Handles start, resume, save, advance, and finalize lifecycle against Supabase.
 */

import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { loadTestBlueprint } from './blueprint-loader';
import { calculateRemainingSeconds, type SessionSnapshot, type ItemResponseState } from './session-state';
import type { ToeflExamMode, ToeflSectionType } from '@/types/toefl';

export interface StartAttemptOptions {
  testVersionId: string;
  studentId: string;
  examMode?: ToeflExamMode;
  sectionTypeFilter?: ToeflSectionType;
  allowRetake?: boolean;
}

export class AttemptSessionService {
  /**
   * Start a new test attempt or resume an active in-progress one.
   */
  async startAttempt(options: StartAttemptOptions) {
    const { testVersionId, studentId, examMode = 'practice', allowRetake = true } = options;

    // 1. Check if an active in-progress attempt already exists for this student & version
    const { data: existing } = await supabaseAdmin
      .from('attempts')
      .select('id, status, test_version_id')
      .eq('test_version_id', testVersionId)
      .eq('student_id', studentId)
      .eq('status', 'in_progress')
      .maybeSingle();

    if (existing && !allowRetake) {
      return this.resumeAttempt(existing.id, studentId);
    }

    // 2. Fetch test version to get parent test_id
    let resolvedTestId = 'f1000000-0000-0000-0000-000000000000';
    let resolvedVersionId = testVersionId;

    const { data: version } = await supabaseAdmin
      .from('test_versions')
      .select('id, test_id, status')
      .eq('id', testVersionId)
      .maybeSingle();

    if (version) {
      resolvedTestId = version.test_id;
      resolvedVersionId = version.id;
    }

    // 3. Create new attempt
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from('attempts')
      .insert({
        test_id: resolvedTestId,
        test_version_id: resolvedVersionId,
        student_id: studentId,
        exam_mode: examMode,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .maybeSingle();

    const finalAttemptId = attempt?.id || `att-${Date.now()}`;

    // 4. Create attempt_sections for each section in the test_version
    const { data: sections } = await supabaseAdmin
      .from('sections')
      .select('id, section_order')
      .eq('test_version_id', resolvedVersionId)
      .order('section_order', { ascending: true });

    if (sections && sections.length > 0 && attempt?.id) {
      const attemptSectionsPayload = sections.map((sec, idx) => ({
        attempt_id: attempt.id,
        section_id: sec.id,
        status: idx === 0 ? 'in_progress' : 'not_started',
        started_at: idx === 0 ? new Date().toISOString() : null,
      }));

      await supabaseAdmin.from('attempt_sections').insert(attemptSectionsPayload);
    }

    return this.resumeAttempt(finalAttemptId, studentId, resolvedVersionId);
  }

  /**
   * Resume an attempt and recompute authoritative server-side timing and state.
   */
  async resumeAttempt(attemptId: string, studentId: string, fallbackVersionId?: string): Promise<{
    blueprint: Awaited<ReturnType<typeof loadTestBlueprint>>;
    snapshot: SessionSnapshot;
  }> {
    // 1. Fetch attempt
    const { data: attempt } = await supabaseAdmin
      .from('attempts')
      .select('id, test_version_id, student_id, status, exam_mode')
      .eq('id', attemptId)
      .maybeSingle();

    const effectiveVersionId = attempt?.test_version_id || fallbackVersionId || 'f2000000-0000-0000-0000-000000000000';
    const examMode = (attempt?.exam_mode as ToeflExamMode) || 'full';

    // 2. Hydrate client blueprint
    const blueprint = await loadTestBlueprint(effectiveVersionId, examMode);

    // 3. Fetch attempt_sections
    const targetAttemptId = attempt?.id || attemptId;
    const { data: attemptSections } = await supabaseAdmin
      .from('attempt_sections')
      .select('id, section_id, status, started_at, completed_at')
      .eq('attempt_id', targetAttemptId)
      .order('created_at', { ascending: true });

    // Determine current active section index
    let activeSecIndex = (attemptSections || []).findIndex((s) => s.status === 'in_progress');
    if (activeSecIndex === -1) {
      activeSecIndex = 0;
    }

    const currentAttemptSec = attemptSections?.[activeSecIndex];
    const currentSecBlueprint = blueprint.sections[activeSecIndex];

    // 4. Fetch all existing responses for this attempt
    const attemptSecIds = (attemptSections || []).map((s) => s.id);
    let responsesMap: Record<string, ItemResponseState> = {};
    if (attemptSecIds.length > 0) {
      const { data: dbResponses } = await supabaseAdmin
        .from('responses')
        .select('content_item_id, raw_answer, normalized_answer, time_spent_ms, flagged, answered_at')
        .in('attempt_section_id', attemptSecIds);

      for (const r of dbResponses || []) {
        responsesMap[r.content_item_id] = {
          rawAnswer: r.raw_answer,
          normalizedAnswer: (r.normalized_answer as Record<string, unknown>) || {},
          isAnswered: Boolean(r.raw_answer && r.raw_answer.trim().length > 0),
          isFlagged: Boolean(r.flagged),
          timeSpentMs: r.time_spent_ms || 0,
          lastSavedAt: r.answered_at,
        };
      }
    }

    // 5. Compute server timing
    const { remainingSeconds, isExpired } = calculateRemainingSeconds(
      currentAttemptSec?.started_at || null,
      currentSecBlueprint?.timingSeconds || 1800,
      currentSecBlueprint?.isTimed ?? true,
    );

    const snapshot: SessionSnapshot = {
      attemptId: attempt?.id || attemptId,
      status: attempt?.status === 'evaluated' ? 'completed' : isExpired ? 'section_transition' : 'in_progress',
      examMode: (attempt?.exam_mode as ToeflExamMode) || examMode,
      currentSectionIndex: activeSecIndex,
      currentItemIndex: 0,
      sectionStartedAt: currentAttemptSec?.started_at || null,
      sectionRemainingSeconds: remainingSeconds,
      isSectionLocked: isExpired || attempt?.status === 'evaluated',
      responses: responsesMap,
    };

    return { blueprint, snapshot };
  }

  /**
   * Save / Autosave student response to an item.
   */
  async saveResponse(params: {
    attemptId: string;
    studentId: string;
    contentItemId: string;
    rawAnswer: string | null;
    normalizedAnswer?: Record<string, unknown>;
    timeSpentMs?: number;
    flagged?: boolean;
  }) {
    const { attemptId, studentId, contentItemId, rawAnswer, normalizedAnswer = {}, timeSpentMs = 0, flagged = false } = params;

    // 1. Validate active section for this item
    const { data: attemptSec, error: secErr } = await supabaseAdmin
      .from('attempt_sections')
      .select('id, status, started_at, sections(timing_seconds)')
      .eq('attempt_id', attemptId)
      .eq('status', 'in_progress')
      .single();

    if (secErr || !attemptSec) {
      throw new Error('No active section in progress for this attempt');
    }

    // 2. Upsert response in database
    const { data: response, error: respErr } = await supabaseAdmin
      .from('responses')
      .upsert(
        {
          attempt_section_id: attemptSec.id,
          content_item_id: contentItemId,
          student_id: studentId,
          raw_answer: rawAnswer,
          normalized_answer: normalizedAnswer,
          time_spent_ms: timeSpentMs,
          flagged,
          answered_at: new Date().toISOString(),
        },
        { onConflict: 'attempt_section_id,content_item_id' },
      )
      .select('id')
      .single();

    if (respErr) {
      throw new Error(`Failed to save response: ${respErr.message}`);
    }

    return { responseId: response.id, savedAt: new Date().toISOString() };
  }

  /**
   * Advance from current section to next section. Locks previous section.
   */
  async advanceSection(attemptId: string, studentId: string, currentSectionIndex: number) {
    const { data: attemptSections } = await supabaseAdmin
      .from('attempt_sections')
      .select('id, status, section_id')
      .eq('attempt_id', attemptId)
      .order('created_at', { ascending: true });

    if (!attemptSections || attemptSections.length === 0) {
      throw new Error('No attempt sections found');
    }

    const currentSec = attemptSections[currentSectionIndex];
    if (currentSec) {
      // Mark current as completed
      await supabaseAdmin
        .from('attempt_sections')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', currentSec.id);
    }

    const nextIndex = currentSectionIndex + 1;
    if (nextIndex < attemptSections.length) {
      const nextSec = attemptSections[nextIndex];
      await supabaseAdmin
        .from('attempt_sections')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', nextSec.id);

      return { nextSectionIndex: nextIndex, isFinalized: false };
    }

    // Finished all sections -> finalize attempt
    await this.finalizeAttempt(attemptId, studentId);
    return { nextSectionIndex: nextIndex, isFinalized: true };
  }

  /**
   * Finalize attempt and trigger complete background evaluation pipeline.
   */
  async finalizeAttempt(attemptId: string, studentId: string) {
    await supabaseAdmin
      .from('attempts')
      .update({
        status: 'evaluating',
        completed_at: new Date().toISOString(),
      })
      .eq('id', attemptId);

    // Trigger evaluation pipeline asynchronously (non-blocking background task)
    import('../evaluation/mock-pipeline.server').then(({ mockEvaluationPipelineService }) => {
      mockEvaluationPipelineService.processAttemptEvaluation(attemptId).catch((err) => {
        console.error('[AttemptSessionService] Evaluation pipeline error:', err);
      });
    }).catch(err => {
      console.error('[AttemptSessionService] Failed to load evaluation pipeline:', err);
    });

    return { attemptId, status: 'evaluating' as const };
  }
}

export const attemptSessionService = new AttemptSessionService();
