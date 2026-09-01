/**
 * Student Analytics Server Functions
 * Loads real attempt data, computes deterministic weakness profiles, and optionally generates Gemini natural-language explanations.
 */

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { analyticsEngine, type RawAttemptMetricInput } from './analytics-engine';
import { chatJson } from '@/lib/ai.server';
import type { ToeflSectionType, ToeflItemType } from '@/types/toefl';

export const getStudentAnalyticsDashboard = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const studentId = context.userId;

    // 1. Fetch all completed score reports
    const { data: scoreReports } = await supabaseAdmin
      .from('score_reports')
      .select('attempt_id, student_id, overall_band, reading_band, listening_band, writing_band, speaking_band, comparable_score, generated_at')
      .eq('student_id', studentId)
      .order('generated_at', { ascending: true });

    // 2. Fetch all student responses
    const { data: responses } = await supabaseAdmin
      .from('responses')
      .select('id, attempt_section_id, content_item_id, is_correct, score, time_spent_ms, answered_at, content_items(id, section_type, item_type, difficulty, skill_tags), attempt_sections(attempt_id)')
      .eq('student_id', studentId);

    const rawMetrics: RawAttemptMetricInput[] = (responses || []).map((r) => {
      const item = (r as unknown as { content_items: { id: string; section_type: ToeflSectionType; item_type: ToeflItemType; difficulty: string; skill_tags: string[] }; attempt_sections: { attempt_id: string } }).content_items;
      const attId = (r as unknown as { attempt_sections: { attempt_id: string } }).attempt_sections?.attempt_id || '';

      return {
        attemptId: attId,
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

    // 3. Compute Deterministic Weakness Profile
    const profile = analyticsEngine.computeStudentProfile(studentId, rawMetrics, adaptedReports);

    // 4. Fetch Student Target Goal
    const { data: studyPlan } = await supabaseAdmin
      .from('study_plans')
      .select('target_overall_band')
      .eq('student_id', studentId)
      .maybeSingle();

    return {
      profile,
      targetBand: studyPlan?.target_overall_band || 5.0,
    };
  });

export const explainWeaknessProfileAi = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ weakSkills: z.array(z.string()), errorPatterns: z.array(z.string()) }).parse(data))
  .handler(async ({ data }) => {
    try {
      const prompt = `Based on these deterministic TOEFL weak skills: [${data.weakSkills.join(', ')}] and error patterns: [${data.errorPatterns.join(', ')}], provide a brief 2-paragraph personalized coaching summary explaining why the student is losing marks and what their core study focus should be. Return JSON: { "explanation": "<text>" }`;

      const result = await chatJson<{ explanation: string }>([
        { role: 'system', content: 'You are an insightful TOEFL learning analytics advisor.' },
        { role: 'user', content: prompt },
      ]);

      return { explanation: result.explanation };
    } catch (err) {
      return { explanation: 'Focus your practice on strengthening your lowest-accuracy skills and reviewing distractor rationales.' };
    }
  });
