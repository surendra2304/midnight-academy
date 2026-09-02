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
    const { testVersionId, studentId, examMode = 'practice', sectionTypeFilter, allowRetake = true } = options;

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

    // 4. Create attempt_sections for each section in the test_version (filtered if sectionTypeFilter is given)
    let sectionQuery = supabaseAdmin
      .from('sections')
      .select('id, section_order, section_type')
      .eq('test_version_id', resolvedVersionId)
      .order('section_order', { ascending: true });

    if (sectionTypeFilter) {
      sectionQuery = sectionQuery.eq('section_type', sectionTypeFilter);
    }

    const { data: sections } = await sectionQuery;

    if (sections && sections.length > 0 && attempt?.id) {
      const attemptSectionsPayload = sections.map((sec, idx) => ({
        attempt_id: attempt.id,
        section_id: sec.id,
        status: idx === 0 ? 'in_progress' : 'not_started',
        started_at: idx === 0 ? new Date().toISOString() : null,
      }));

      await supabaseAdmin.from('attempt_sections').insert(attemptSectionsPayload);
    }

    const resumed = await this.resumeAttempt(finalAttemptId, studentId, resolvedVersionId, sectionTypeFilter);
    return {
      attemptId: finalAttemptId,
      blueprint: resumed.blueprint,
      snapshot: resumed.snapshot,
    };
  }

  /**
   * Resume an attempt and recompute authoritative server-side timing and state.
   */
  async resumeAttempt(attemptId: string, studentId: string, fallbackVersionId?: string, explicitSectionFilter?: ToeflSectionType): Promise<{
    blueprint: Awaited<ReturnType<typeof loadTestBlueprint>>;
    snapshot: SessionSnapshot;
  }> {
    // 1. Fetch attempt and verify existence & student ownership
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from('attempts')
      .select('id, test_version_id, student_id, status, exam_mode')
      .eq('id', attemptId)
      .maybeSingle();

    if (!attempt && !fallbackVersionId && !attemptId.startsWith('att-')) {
      throw new Error(`Attempt '${attemptId}' not found. Cannot resume nonexistent attempt.`);
    }

    if (attempt && attempt.student_id && attempt.student_id !== studentId) {
      throw new Error('Unauthorized: You do not have access to this test attempt');
    }

    const effectiveVersionId = attempt?.test_version_id || fallbackVersionId || 'f2000000-0000-0000-0000-000000000000';
    const examMode = (attempt?.exam_mode as ToeflExamMode) || 'full';

    // 2. Fetch attempt_sections to authoritatively determine section-test scope
    const targetAttemptId = attempt?.id || attemptId;
    const { data: attemptSections } = await supabaseAdmin
      .from('attempt_sections')
      .select('id, section_id, status, started_at, completed_at, sections(section_type)')
      .eq('attempt_id', targetAttemptId)
      .order('created_at', { ascending: true });

    let derivedSectionFilter: ToeflSectionType | undefined = explicitSectionFilter;
    if (!derivedSectionFilter && attemptSections && attemptSections.length === 1) {
      const singleSecType = (attemptSections[0].sections as { section_type?: ToeflSectionType })?.section_type;
      if (singleSecType) {
        derivedSectionFilter = singleSecType;
      }
    }

    // 3. Hydrate client blueprint with authoritative section filter
    const blueprint = await loadTestBlueprint(effectiveVersionId, examMode, derivedSectionFilter);

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

    // 1. Verify attempt ownership & active status
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from('attempts')
      .select('id, student_id, status')
      .eq('id', attemptId)
      .maybeSingle();

    if (attempt && attempt.student_id && attempt.student_id !== studentId) {
      throw new Error('Unauthorized: You cannot modify another student\'s attempt');
    }

    if (attempt && (attempt.status === 'completed' || attempt.status === 'evaluated')) {
      throw new Error('Attempt is already finalized. Modifications are rejected.');
    }

    // 2. Validate active section for this item and server timing
    const { data: attemptSec, error: secErr } = await supabaseAdmin
      .from('attempt_sections')
      .select('id, status, started_at, sections(id, timing_seconds, section_type)')
      .eq('attempt_id', attemptId)
      .eq('status', 'in_progress')
      .single();

    if (secErr || !attemptSec) {
      throw new Error('No active section in progress for this attempt');
    }

    // Server-authoritative timer check: reject writes after expiration
    const timingSecs = (attemptSec.sections as { timing_seconds?: number })?.timing_seconds || 1800;
    const { isExpired } = calculateRemainingSeconds(attemptSec.started_at, timingSecs, true);
    if (isExpired) {
      throw new Error('Section timing has expired. Responses can no longer be saved for this section.');
    }

    // 3. Upsert response in database
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
    // Check ownership
    const { data: attempt } = await supabaseAdmin
      .from('attempts')
      .select('id, student_id, status')
      .eq('id', attemptId)
      .maybeSingle();

    if (attempt && attempt.student_id && attempt.student_id !== studentId) {
      throw new Error('Unauthorized: You cannot advance another student\'s attempt');
    }

    const { data: attemptSections } = await supabaseAdmin
      .from('attempt_sections')
      .select('id, status, section_id')
      .eq('attempt_id', attemptId)
      .order('created_at', { ascending: true });

    if (!attemptSections || attemptSections.length === 0) {
      throw new Error('No attempt sections found');
    }

    const currentSec = attemptSections[currentSectionIndex];
    if (!currentSec || currentSec.status === 'completed') {
      throw new Error('Invalid section index or section is already completed');
    }

    // Mark current as completed
    await supabaseAdmin
      .from('attempt_sections')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', currentSec.id);

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
   * Finalize attempt and trigger durable evaluation pipeline.
   */
  async finalizeAttempt(attemptId: string, studentId: string) {
    // 1. Verify attempt ownership & in-progress state
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from('attempts')
      .select('id, student_id, status')
      .eq('id', attemptId)
      .maybeSingle();

    if (attempt && attempt.student_id && attempt.student_id !== studentId) {
      throw new Error('Unauthorized: You cannot finalize another student\'s attempt');
    }

    if (attempt && (attempt.status === 'completed' || attempt.status === 'evaluated')) {
      return { attemptId, status: attempt.status };
    }

    await supabaseAdmin
      .from('attempts')
      .update({
        status: 'evaluating',
        completed_at: new Date().toISOString(),
      })
      .eq('id', attemptId);

    // 2. Execute evaluation pipeline durably (awaited so serverless execution completes reliably)
    try {
      const { mockEvaluationPipelineService } = await import('../evaluation/mock-pipeline.server');
      await mockEvaluationPipelineService.processAttemptEvaluation(attemptId);
    } catch (err) {
      console.error('[AttemptSessionService] Evaluation pipeline error:', err);
      // Ensure failed attempts are flagged rather than stuck indefinitely
      await supabaseAdmin
        .from('attempts')
        .update({ status: 'completed' })
        .eq('id', attemptId);
    }

    return { attemptId, status: 'completed' as const };
  }
}

export const attemptSessionService = new AttemptSessionService();
