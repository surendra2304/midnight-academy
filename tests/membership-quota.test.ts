import { describe, it, expect } from 'vitest';
import {
  checkActionQuota,
  FREE_TIER_LIMITS,
  type UserUsageRecord,
} from '../src/lib/membership/quota-engine';

describe('Server-Side Membership & Quota Engine', () => {
  it('allows unlimited access for Member tier users', () => {
    const memberUsage: UserUsageRecord = {
      userId: 'user-member-1',
      tier: 'member',
      fullMocksUsedThisMonth: 10,
      sectionTestsUsedThisMonth: 50,
      practiceQuestionsUsedToday: 200,
      aiEvaluationsUsedToday: 100,
    };

    const res = checkActionQuota(memberUsage, 'full_mock');
    expect(res.allowed).toBe(true);
    expect(res.tier).toBe('member');
    expect(res.remainingQuota).toBe(Infinity);
  });

  it('permits free tier users within monthly limits', () => {
    const freeUsage: UserUsageRecord = {
      userId: 'user-free-1',
      tier: 'free',
      fullMocksUsedThisMonth: 0,
      sectionTestsUsedThisMonth: 1,
      practiceQuestionsUsedToday: 5,
      aiEvaluationsUsedToday: 2,
    };

    const mockCheck = checkActionQuota(freeUsage, 'full_mock');
    expect(mockCheck.allowed).toBe(true);
    expect(mockCheck.remainingQuota).toBe(1);

    const sectionCheck = checkActionQuota(freeUsage, 'section_test');
    expect(sectionCheck.allowed).toBe(true);
    expect(sectionCheck.remainingQuota).toBe(2);
  });

  it('blocks free tier users who have exhausted their quotas with clear reasons', () => {
    const exhaustedUsage: UserUsageRecord = {
      userId: 'user-free-exhausted',
      tier: 'free',
      fullMocksUsedThisMonth: 1, // Max is 1
      sectionTestsUsedThisMonth: 3, // Max is 3
      practiceQuestionsUsedToday: 10, // Max is 10
      aiEvaluationsUsedToday: 5, // Max is 5
    };

    const mockCheck = checkActionQuota(exhaustedUsage, 'full_mock');
    expect(mockCheck.allowed).toBe(false);
    expect(mockCheck.remainingQuota).toBe(0);
    expect(mockCheck.reason).toContain('limit reached');

    const aiCheck = checkActionQuota(exhaustedUsage, 'ai_evaluation');
    expect(aiCheck.allowed).toBe(false);
    expect(aiCheck.remainingQuota).toBe(0);
  });
});
