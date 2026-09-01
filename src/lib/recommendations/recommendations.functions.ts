/**
 * Server Functions for Practice Queue & Study Plan Persistence
 */

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { recommendationEngine, type CandidateContentItem } from './recommendation-engine';
import { analyticsEngine, type RawAttemptMetricInput } from '@/lib/analytics/analytics-engine';
import type { ToeflSectionType, ToeflItemType } from '@/types/toefl';

export const getStudentPracticeQueue = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const studentId = context.userId;

    // 1. Fetch student responses & score reports for weakness profile
    const { data: responses } = await supabaseAdmin
      .from('responses')
      .select('id, content_item_id, is_correct, score, time_spent_ms, answered_at, content_items(id, section_type, item_type, difficulty, skill_tags)')
      .eq('student_id', studentId);

    const { data: scoreReports } = await supabaseAdmin
      .from('score_reports')
      .select('*')
      .eq('student_id', studentId);

    const rawMetrics: RawAttemptMetricInput[] = (responses || []).map((r) => {
      const item = (r as unknown as { content_items: { id: string; section_type: ToeflSectionType; item_type: ToeflItemType; difficulty: string; skill_tags: string[] } }).content_items;
      return {
        attemptId: '',
        completedAt: r.answered_at,
        sectionType: item?.section_type || 'reading',
        itemType: item?.item_type || 'read_daily_life',
        difficulty: item?.difficulty || 'Medium',
        skillTags: item?.skill_tags || [],
        isCorrect: r.is_correct,
        score: r.score,
        timeSpentMs: r.time_spent_ms || 0,
      };
    });

    const adaptedReports = (scoreReports || []).map((sr) => ({
      attemptId: sr.attempt_id,
      generatedAt: sr.generated_at,
      overallBand: sr.overall_band,
      readingBand: sr.reading_band,
      listeningBand: sr.listening_band,
      writingBand: sr.writing_band,
      speakingBand: sr.speaking_band,
    }));

    const profile = analyticsEngine.computeStudentProfile(studentId, rawMetrics, adaptedReports);

    // 2. Fetch published content items as the candidate pool
    const { data: contentItems } = await supabaseAdmin
      .from('content_items')
      .select('id, section_type, item_type, difficulty, skill_tags, payload')
      .limit(50);

    const candidatePool: CandidateContentItem[] = (contentItems || []).map((ci) => ({
      id: ci.id,
      sectionType: ci.section_type as ToeflSectionType,
      itemType: ci.item_type as ToeflItemType,
      difficulty: ci.difficulty,
      skillTags: ci.skill_tags || [],
      title: (ci.payload as { title?: string })?.title,
      promptSnippet: (ci.payload as { prompt?: string })?.prompt?.slice(0, 100),
    }));

    const recentItemIds = (responses || []).map((r) => r.content_item_id);

    // 3. Generate deterministic recommendations queue
    const queue = recommendationEngine.generateQueue(profile, candidatePool, {
      recentAttemptedItemIds: recentItemIds,
      maxQueueSize: 6,
    });

    return {
      queue,
      profile,
    };
  });
