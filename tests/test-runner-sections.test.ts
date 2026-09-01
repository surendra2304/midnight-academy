import { describe, it, expect } from 'vitest';
import { calculateRemainingSeconds } from '../src/lib/tests/session-state';
import { hashEvaluationInput } from '../src/lib/evaluation/evaluation-service.server';

describe('Test Runner 4-Section End-to-End Resilience Suite', () => {
  it('correctly calculates server-authoritative remaining time across refreshes', () => {
    const now = new Date();
    const startedAt = new Date(now.getTime() - 30 * 1000).toISOString(); // 30 seconds ago
    const totalTimingSeconds = 1800; // 30 mins

    const { remainingSeconds, isExpired } = calculateRemainingSeconds(startedAt, totalTimingSeconds, true);
    expect(isExpired).toBe(false);
    expect(remainingSeconds).toBeLessThanOrEqual(1775);
    expect(remainingSeconds).toBeGreaterThan(1765);
  });

  it('generates consistent deterministic hashes for AI open response caching', () => {
    const input = {
      taskType: 'write_email' as const,
      promptText: 'Write an email to your professor requesting an extension.',
      studentResponse: 'Dear Professor, I am writing to politely request a short extension on my lab assignment.',
      rubricVersion: '2026.1',
    };

    const hash1 = hashEvaluationInput(input);
    const hash2 = hashEvaluationInput(input);
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
  });

  it('handles empty or whitespace responses safely without throwing', () => {
    const input = {
      taskType: 'academic_discussion' as const,
      promptText: 'Discuss whether universities should mandate attendance.',
      studentResponse: '   ',
      rubricVersion: '2026.1',
    };

    const hash = hashEvaluationInput(input);
    expect(typeof hash).toBe('string');
  });
});
