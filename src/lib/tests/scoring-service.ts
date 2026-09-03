/**
 * Scoring Service Interface & Orchestration Stubs
 * Defines the contract for deterministic scoring and AI evaluation orchestration.
 */

import type { ToeflItemType } from "@/types/toefl";

export interface ObjectiveEvaluationInput {
  contentItemId: string;
  itemType: ToeflItemType;
  rawAnswer: string | null;
  normalizedAnswer?: Record<string, unknown>;
  correctKey?: string;
  acceptedAnswers?: string[];
}

export interface ObjectiveEvaluationResult {
  isCorrect: boolean;
  score: number; // 0.0 to 1.0 or weighted
  feedback?: string;
}

export interface ScoringService {
  scoreObjective(input: ObjectiveEvaluationInput): ObjectiveEvaluationResult;
  orchestrateSectionEvaluation(attemptSectionId: string): Promise<void>;
  generateScoreReport(attemptId: string): Promise<void>;
}

/**
 * Deterministic scoring stub implementation
 */
export class DeterministicScoringService implements ScoringService {
  scoreObjective(input: ObjectiveEvaluationInput): ObjectiveEvaluationResult {
    if (!input.rawAnswer) {
      return { isCorrect: false, score: 0 };
    }

    // 1. Multiple Choice / Single selection option matching
    if (input.correctKey) {
      const isCorrect =
        input.rawAnswer.trim().toUpperCase() === input.correctKey.trim().toUpperCase();
      return { isCorrect, score: isCorrect ? 1.0 : 0.0 };
    }

    // 2. Cloze / Fill in the blank / Complete words
    if (input.acceptedAnswers && input.acceptedAnswers.length > 0) {
      const cleaned = input.rawAnswer.trim().toLowerCase();
      const isCorrect = input.acceptedAnswers.some((a) => a.trim().toLowerCase() === cleaned);
      return { isCorrect, score: isCorrect ? 1.0 : 0.0 };
    }

    return { isCorrect: false, score: 0 };
  }

  async orchestrateSectionEvaluation(_attemptSectionId: string): Promise<void> {
    // Stub: To be populated in Phase 4/5/6/7 with AI pipelines
  }

  async generateScoreReport(_attemptId: string): Promise<void> {
    // Stub: To be populated in Phase 8
  }
}

export const scoringService = new DeterministicScoringService();
