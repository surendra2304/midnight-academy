/**
 * Membership & Plan Server Functions
 * Manages user plan retrieval, quota calculation, manual admin tier assignment,
 * and upgrade requests.
 */

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import {
  checkActionQuota,
  FREE_TIER_LIMITS,
  type MembershipTier,
  type UserUsageRecord,
  type QuotaCheckResult,
} from './quota-engine';

// In-memory membership & usage store fallback
const usageStore: Map<string, UserUsageRecord> = new Map();

/**
 * Fetch current user membership status and remaining usage quotas
 */
export const getUserMembership = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    let usage = usageStore.get(context.userId);
    if (!usage) {
      usage = {
        userId: context.userId,
        tier: 'free',
        fullMocksUsedThisMonth: 0,
        sectionTestsUsedThisMonth: 0,
        practiceQuestionsUsedToday: 2,
        aiEvaluationsUsedToday: 1,
      };
      usageStore.set(context.userId, usage);
    }

    const fullMockQuota = checkActionQuota(usage, 'full_mock');
    const sectionTestQuota = checkActionQuota(usage, 'section_test');
    const practiceQuota = checkActionQuota(usage, 'practice_question');
    const aiQuota = checkActionQuota(usage, 'ai_evaluation');

    return {
      tier: usage.tier,
      planExpiresAt: usage.planExpiresAt || null,
      isUnlimited: usage.tier === 'member',
      quotas: {
        fullMocks: fullMockQuota,
        sectionTests: sectionTestQuota,
        practiceQuestions: practiceQuota,
        aiEvaluations: aiQuota,
      },
    };
  });

/**
 * Upgrade to Member Tier (Demo / Manual Upgrade Flow)
 */
export const requestMembershipUpgrade = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    let usage = usageStore.get(context.userId);
    if (!usage) {
      usage = {
        userId: context.userId,
        tier: 'member',
        fullMocksUsedThisMonth: 0,
        sectionTestsUsedThisMonth: 0,
        practiceQuestionsUsedToday: 0,
        aiEvaluationsUsedToday: 0,
      };
    } else {
      usage.tier = 'member';
      usage.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    usageStore.set(context.userId, usage);

    return { success: true, tier: 'member' };
  });

/**
 * Admin: Assign User Membership Tier
 */
export const setMemberTierAdmin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        targetUserId: z.string(),
        tier: z.enum(['free', 'member']),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    let usage = usageStore.get(data.targetUserId) || {
      userId: data.targetUserId,
      tier: data.tier,
      fullMocksUsedThisMonth: 0,
      sectionTestsUsedThisMonth: 0,
      practiceQuestionsUsedToday: 0,
      aiEvaluationsUsedToday: 0,
    };

    usage.tier = data.tier;
    usageStore.set(data.targetUserId, usage);

    return { success: true, updatedTier: data.tier };
  });
