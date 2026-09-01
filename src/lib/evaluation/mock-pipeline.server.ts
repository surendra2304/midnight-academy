/**
 * End-to-End Orchestrated Evaluation Pipeline Service (Server-Only)
 * Pipeline: Finalize -> Deterministic Scoring (Reading, Listening, Build Sentence) -> Async AI Evaluation (Writing & Speaking) -> Score Report Aggregation -> In-App Notification.
 */

import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { readingScoringService } from '@/lib/scoring/reading-scoring';
import { sentenceScoringService } from '@/lib/scoring/sentence-scoring';
import { evaluationService } from '@/lib/evaluation/evaluation-service.server';
import { speakingEvaluationService } from '@/lib/evaluation/speaking-evaluation.server';
import { bandToComparable120 } from '@/types/toefl';
import type { ToeflItemType, ToeflSectionType } from '@/types/toefl';

export interface SectionScoreSummary {
  sectionType: ToeflSectionType;
  rawScore: number;
  maxScore: number;
  bandScore: number; // 1.0 - 6.0 in half-point increments
}

export class MockEvaluationPipelineService {
  /**
   * Main entrypoint triggered upon attempt finalization.
   */
  async processAttemptEvaluation(attemptId: string) {
    console.log(`[MockEvaluationPipeline] Starting evaluation for attempt: ${attemptId}`);

    // 1. Fetch Attempt & Student Info
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from('attempts')
      .select('id, test_id, test_version_id, student_id, exam_mode, tests(name)')
      .eq('id', attemptId)
      .single();

    if (aErr || !attempt) {
      throw new Error(`Attempt ${attemptId} not found`);
    }

    // 2. Fetch all attempt_sections and responses
    const { data: attemptSections } = await supabaseAdmin
      .from('attempt_sections')
      .select('id, section_id, status, sections(section_type, section_order)')
      .eq('attempt_id', attemptId);

    const attemptSecIds = (attemptSections || []).map((s) => s.id);

    const { data: responses } = await supabaseAdmin
      .from('responses')
      .select('id, attempt_section_id, content_item_id, student_id, raw_answer, normalized_answer, content_items(id, section_type, item_type, difficulty, payload)')
      .in('attempt_section_id', attemptSecIds);

    const { data: allOptions } = await supabaseAdmin
      .from('question_options')
      .select('id, content_item_id, option_key, option_text, is_correct, distractor_rationale');

    const optionsByItem = new Map<string, typeof allOptions>();
    for (const opt of allOptions || []) {
      const list = optionsByItem.get(opt.content_item_id) || [];
      list.push(opt);
      optionsByItem.set(opt.content_item_id, list);
    }

    // 3. Process Section by Section
    const sectionSummaries: Record<ToeflSectionType, SectionScoreSummary> = {
      reading: { sectionType: 'reading', rawScore: 0, maxScore: 0, bandScore: 1.0 },
      listening: { sectionType: 'listening', rawScore: 0, maxScore: 0, bandScore: 1.0 },
      writing: { sectionType: 'writing', rawScore: 0, maxScore: 0, bandScore: 1.0 },
      speaking: { sectionType: 'speaking', rawScore: 0, maxScore: 0, bandScore: 1.0 },
    };

    const sectionBands: Record<ToeflSectionType, number[]> = {
      reading: [],
      listening: [],
      writing: [],
      speaking: [],
    };

    for (const resp of responses || []) {
      const item = (resp as unknown as { content_items: { id: string; section_type: ToeflSectionType; item_type: ToeflItemType; payload: Record<string, unknown> } }).content_items;
      if (!item) continue;

      const secType = item.section_type;
      const itemOpts = optionsByItem.get(item.id) || [];

      // A. Deterministic Items (MCQ, Cloze, Build Sentence)
      if (
        item.itemType === 'read_daily_life' ||
        item.itemType === 'read_academic' ||
        item.itemType === 'complete_words' ||
        item.itemType === 'listen_choose_response' ||
        item.itemType === 'listen_conversation' ||
        item.itemType === 'listen_announcement' ||
        item.itemType === 'listen_academic_talk'
      ) {
        const scoreRes = readingScoringService.scoreItem(resp.raw_answer, {
          itemType: item.itemType,
          options: itemOpts.map((o) => ({
            optionKey: o.option_key,
            optionText: o.option_text,
            isCorrect: o.is_correct,
            distractorRationale: o.distractor_rationale,
          })),
        });

        await supabaseAdmin
          .from('responses')
          .update({
            is_correct: scoreRes.isCorrect,
            score: scoreRes.score,
          })
          .eq('id', resp.id);

        sectionSummaries[secType].rawScore += scoreRes.earnedPoints;
        sectionSummaries[secType].maxScore += scoreRes.maxPoints;
      } else if (item.itemType === 'build_sentence') {
        let parsedTokens: string[] = [];
        try {
          parsedTokens = JSON.parse(resp.raw_answer || '[]');
        } catch {
          parsedTokens = (resp.raw_answer || '').split(' ');
        }

        const sentenceRule = {
          acceptedSequences: (item.payload?.acceptedSequences as string[][]) || [],
          tokenList: (item.payload?.wordBank as string[]) || [],
        };

        const sentScore = sentenceScoringService.scoreSentence(parsedTokens, sentenceRule);

        await supabaseAdmin
          .from('responses')
          .update({
            is_correct: sentScore.isCorrect,
            score: sentScore.score,
          })
          .eq('id', resp.id);

        sectionSummaries[secType].rawScore += sentScore.earnedPoints;
        sectionSummaries[secType].maxScore += sentScore.maxPoints;
      }
      // B. AI-Evaluated Writing Tasks (Write an Email, Academic Discussion)
      else if (item.itemType === 'write_email' || item.itemType === 'academic_discussion') {
        const evalResult = await evaluationService.evaluateWriting({
          taskType: item.itemType,
          promptText: (item.payload?.prompt as string) || (item.payload?.title as string) || '',
          contextData: item.payload,
          studentResponse: resp.raw_answer || '',
          referenceModelAnswer: item.payload?.modelAnswer as string,
        });

        await supabaseAdmin.from('evaluations').insert({
          response_id: resp.id,
          score_band: evalResult.score_band,
          task_score: evalResult.task_score,
          traits: evalResult.traits,
          strengths: evalResult.strengths,
          issues: evalResult.issues,
          corrections: evalResult.corrections,
          next_actions: evalResult.next_actions,
          confidence: evalResult.confidence,
          rubric_version: evalResult.rubric_version,
          model_id: evalResult.model,
        });

        await supabaseAdmin
          .from('responses')
          .update({ score: evalResult.task_score / 100 })
          .eq('id', resp.id);

        sectionBands[secType].push(evalResult.score_band);
      }
      // C. AI-Evaluated Speaking Tasks (Listen & Repeat, Interview)
      else if (item.itemType === 'listen_repeat' || item.itemType === 'take_interview') {
        const evalResult = await speakingEvaluationService.evaluateSpeaking({
          taskType: item.itemType,
          promptText: (item.payload?.prompt as string) || '',
          transcript: resp.raw_answer || 'Audio response provided.',
          referenceModelAnswer: item.payload?.modelAnswer as string,
        });

        await supabaseAdmin.from('evaluations').insert({
          response_id: resp.id,
          score_band: evalResult.score_band,
          task_score: evalResult.task_score,
          traits: evalResult.traits,
          strengths: evalResult.strengths,
          issues: evalResult.issues,
          corrections: evalResult.corrections,
          next_actions: evalResult.next_actions,
          confidence: evalResult.confidence,
          rubric_version: evalResult.rubric_version,
          model_id: evalResult.model,
        });

        await supabaseAdmin
          .from('responses')
          .update({ score: evalResult.task_score / 100 })
          .eq('id', resp.id);

        sectionBands[secType].push(evalResult.score_band);
      }
    }

    // 4. Compute 1.0 - 6.0 Band Scores per Section
    // Reading Band
    const rdRatio = sectionSummaries.reading.maxScore > 0 ? sectionSummaries.reading.rawScore / sectionSummaries.reading.maxScore : 0;
    sectionSummaries.reading.bandScore = Math.max(1.0, Math.min(6.0, Math.round((1.0 + rdRatio * 5.0) * 2) / 2));

    // Listening Band
    const lsRatio = sectionSummaries.listening.maxScore > 0 ? sectionSummaries.listening.rawScore / sectionSummaries.listening.maxScore : 0;
    sectionSummaries.listening.bandScore = Math.max(1.0, Math.min(6.0, Math.round((1.0 + lsRatio * 5.0) * 2) / 2));

    // Writing Band (Average of AI task bands & Build a Sentence)
    const wrBands = sectionBands.writing;
    sectionSummaries.writing.bandScore = wrBands.length > 0
      ? Math.round((wrBands.reduce((a, b) => a + b, 0) / wrBands.length) * 2) / 2
      : 3.5;

    // Speaking Band (Average of AI interview bands)
    const spBands = sectionBands.speaking;
    sectionSummaries.speaking.bandScore = spBands.length > 0
      ? Math.round((spBands.reduce((a, b) => a + b, 0) / spBands.length) * 2) / 2
      : 3.5;

    // Overall Band (Average of 4 section bands rounded to nearest 0.5)
    const allBands = [
      sectionSummaries.reading.bandScore,
      sectionSummaries.listening.bandScore,
      sectionSummaries.writing.bandScore,
      sectionSummaries.speaking.bandScore,
    ];
    const overallBand = Math.round((allBands.reduce((a, b) => a + b, 0) / 4) * 2) / 2;
    const comparableScore120 = bandToComparable120(overallBand);

    // 5. Update Attempt Sections with final scores
    for (const attSec of attemptSections || []) {
      const sType = (attSec as unknown as { sections: { section_type: ToeflSectionType } }).sections?.section_type;
      if (sType && sectionSummaries[sType]) {
        await supabaseAdmin
          .from('attempt_sections')
          .update({
            status: 'completed',
            raw_score: sectionSummaries[sType].rawScore,
            section_band: sectionSummaries[sType].bandScore,
          })
          .eq('id', attSec.id);
      }
    }

    // 6. Generate and Persist Score Report
    await supabaseAdmin.from('score_reports').upsert(
      {
        attempt_id: attemptId,
        student_id: attempt.student_id,
        overall_band: overallBand,
        reading_band: sectionSummaries.reading.bandScore,
        listening_band: sectionSummaries.listening.bandScore,
        writing_band: sectionSummaries.writing.bandScore,
        speaking_band: sectionSummaries.speaking.bandScore,
        comparable_score: comparableScore120,
        summary: `Completed full TOEFL mock assessment with overall band ${overallBand.toFixed(1)}/6.0 (~${comparableScore120}/120 comparable score).`,
        skill_breakdown: {
          reading: sectionSummaries.reading,
          listening: sectionSummaries.listening,
          writing: sectionSummaries.writing,
          speaking: sectionSummaries.speaking,
        },
      },
      { onConflict: 'attempt_id' },
    );

    // 7. Mark Attempt as Evaluated
    await supabaseAdmin
      .from('attempts')
      .update({
        status: 'evaluated',
        score: comparableScore120,
        percentage_score: Math.round((overallBand / 6.0) * 100),
      })
      .eq('id', attemptId);

    // 8. Generate In-App Notification for Student
    await supabaseAdmin.from('notifications').insert({
      user_id: attempt.student_id,
      title: 'TOEFL Mock Test Evaluated 🎉',
      message: `Your score report for ${attempt.tests?.name || 'TOEFL Mock'} is ready! Overall Band: ${overallBand.toFixed(1)}/6.0 (~${comparableScore120}/120).`,
      type: 'test_evaluated',
      link: `/result/${attemptId}`,
      is_read: false,
    });

    console.log(`[MockEvaluationPipeline] Evaluation complete for attempt: ${attemptId}`);
    return {
      attemptId,
      overallBand,
      comparableScore120,
      sectionSummaries,
    };
  }
}

export const mockEvaluationPipelineService = new MockEvaluationPipelineService();
