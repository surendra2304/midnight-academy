import { describe, it, expect } from 'vitest';
import {
  EvaluationContractSchema,
  traitsToBand,
  hashEvaluationInput,
} from '../src/lib/evaluation/evaluation-service.server';
import { sentenceScoringService } from '../src/lib/scoring/sentence-scoring';

describe('TOEFL Writing & Gemini Evaluation Engine Suite', () => {
  describe('Deterministic Build a Sentence Scoring', () => {
    const sentenceRule = {
      tokenList: ['The', 'students', 'studied', 'quietly', 'in', 'the', 'library'],
      acceptedSequences: [
        ['The', 'students', 'studied', 'quietly', 'in', 'the', 'library'],
        ['The', 'students', 'quietly', 'studied', 'in', 'the', 'library'],
      ],
    };

    it('scores exact word chip sequence with 100% credit', () => {
      const res = sentenceScoringService.scoreSentence(
        ['The', 'students', 'studied', 'quietly', 'in', 'the', 'library'],
        sentenceRule,
      );
      expect(res.isCorrect).toBe(true);
      expect(res.score).toBe(1.0);
      expect(res.earnedPoints).toBe(1);
    });

    it('scores alternative valid syntax order with 100% credit', () => {
      const res = sentenceScoringService.scoreSentence(
        ['The', 'students', 'quietly', 'studied', 'in', 'the', 'library'],
        sentenceRule,
      );
      expect(res.isCorrect).toBe(true);
      expect(res.score).toBe(1.0);
    });

    it('scores wrong scrambled sequence with zero or partial credit', () => {
      const res = sentenceScoringService.scoreSentence(
        ['library', 'the', 'in', 'studied', 'quietly', 'students', 'The'],
        sentenceRule,
      );
      expect(res.isCorrect).toBe(false);
      expect(res.score).toBeLessThanOrEqual(0.5);
    });
  });

  describe('Evaluation Contract Schema Validation', () => {
    it('successfully parses valid structured Gemini JSON evaluation', () => {
      const sampleValidOutput = {
        score_band: 5.5,
        task_score: 92,
        traits: {
          task_fulfillment: 5.5,
          organization: 5.5,
          language_use: 5.0,
        },
        strengths: ['Clear and polite greeting', 'Effectively outlines two course alternatives'],
        issues: ['Minor preposition choice in paragraph two'],
        corrections: [
          {
            original: 'conflict with two courses',
            improved: 'conflict between two courses',
            explanation: 'Use "between" when comparing two distinct items.',
          },
        ],
        improved_response: 'Dear Dr. Martinez, I hope you are well...',
        next_actions: ['Practice prepositional collocations.'],
        confidence: 0.95,
        rubric_version: '2026.1',
        model: 'gemini-2.5-flash',
      };

      const parsed = EvaluationContractSchema.safeParse(sampleValidOutput);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.score_band).toBe(5.5);
        expect(parsed.data.traits.task_fulfillment).toBe(5.5);
      }
    });

    it('fails on out-of-bounds score band or invalid types', () => {
      const invalidOutput = {
        score_band: 8.5, // > 6.0 limit
        task_score: 'one hundred', // Not a number
      };

      const parsed = EvaluationContractSchema.safeParse(invalidOutput);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Trait to Band Conversion', () => {
    it('converts trait scores to exact 0.5 half-point increments accurately', () => {
      expect(traitsToBand({ task_fulfillment: 6.0, organization: 6.0, language_use: 6.0 }).scoreBand).toBe(6.0);
      expect(traitsToBand({ task_fulfillment: 5.0, organization: 5.5, language_use: 5.0 }).scoreBand).toBe(5.0); // avg 5.16 -> 5.0
      expect(traitsToBand({ task_fulfillment: 5.5, organization: 5.5, language_use: 5.0 }).scoreBand).toBe(5.5); // avg 5.33 -> 5.5
      expect(traitsToBand({ task_fulfillment: 1.0, organization: 1.0, language_use: 1.0 }).scoreBand).toBe(1.0);
    });
  });

  describe('Response Hashing for Evaluation Caching', () => {
    it('generates consistent deterministic hash for identical responses', () => {
      const hash1 = hashEvaluationInput({
        taskType: 'write_email',
        promptText: 'Write to advisor',
        studentResponse: 'Dear Dr. Martinez...',
        rubricVersion: '2026.1',
      });

      const hash2 = hashEvaluationInput({
        taskType: 'write_email',
        promptText: 'Write to advisor',
        studentResponse: 'Dear Dr. Martinez...',
        rubricVersion: '2026.1',
      });

      expect(hash1).toBe(hash2);
      expect(hash1.startsWith('eval_hash_')).toBe(true);
    });
  });
});
