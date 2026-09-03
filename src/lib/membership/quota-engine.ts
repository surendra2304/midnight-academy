/**
 * Server-Side Membership & Quota Enforcement Engine
 * Defines Free Tier vs. Unlimited Member Tier limits, tracks quota consumption,
 * and enforces server-side gatekeeping before test/evaluation initiation.
 */

export type MembershipTier = "free" | "member";

export interface PlanLimits {
  monthlyFullMocks: number;
  monthlySectionTests: number;
  dailyPracticeQuestions: number;
  dailyAiEvaluations: number;
}

export const FREE_TIER_LIMITS: PlanLimits = {
  monthlyFullMocks: 1,
  monthlySectionTests: 3,
  dailyPracticeQuestions: 10,
  dailyAiEvaluations: 5,
};

export const MEMBER_TIER_LIMITS: PlanLimits = {
  monthlyFullMocks: Infinity,
  monthlySectionTests: Infinity,
  dailyPracticeQuestions: Infinity,
  dailyAiEvaluations: Infinity,
};

export interface UserUsageRecord {
  userId: string;
  tier: MembershipTier;
  planExpiresAt?: string;
  fullMocksUsedThisMonth: number;
  sectionTestsUsedThisMonth: number;
  practiceQuestionsUsedToday: number;
  aiEvaluationsUsedToday: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  tier: MembershipTier;
  reason?: string | undefined;
  remainingQuota: number;
  maxQuota: number;
}

/**
 * Checks if a user has sufficient quota for a specific action.
 */
export function checkActionQuota(
  usage: UserUsageRecord,
  actionType: "full_mock" | "section_test" | "practice_question" | "ai_evaluation",
): QuotaCheckResult {
  if (usage.tier === "member") {
    return {
      allowed: true,
      tier: "member",
      remainingQuota: Infinity,
      maxQuota: Infinity,
    };
  }

  const limits = FREE_TIER_LIMITS;

  switch (actionType) {
    case "full_mock": {
      const remaining = Math.max(0, limits.monthlyFullMocks - usage.fullMocksUsedThisMonth);
      return {
        allowed: remaining > 0,
        tier: "free",
        reason:
          remaining <= 0
            ? "Free tier monthly full mock exam limit reached (1/month). Upgrade to Member for unlimited tests."
            : undefined,
        remainingQuota: remaining,
        maxQuota: limits.monthlyFullMocks,
      };
    }
    case "section_test": {
      const remaining = Math.max(0, limits.monthlySectionTests - usage.sectionTestsUsedThisMonth);
      return {
        allowed: remaining > 0,
        tier: "free",
        reason:
          remaining <= 0
            ? "Free tier monthly section test limit reached (3/month). Upgrade to Member for unlimited practice."
            : undefined,
        remainingQuota: remaining,
        maxQuota: limits.monthlySectionTests,
      };
    }
    case "practice_question": {
      const remaining = Math.max(
        0,
        limits.dailyPracticeQuestions - usage.practiceQuestionsUsedToday,
      );
      return {
        allowed: remaining > 0,
        tier: "free",
        reason:
          remaining <= 0
            ? "Free tier daily practice question limit reached (10/day). Upgrade to Member for unlimited access."
            : undefined,
        remainingQuota: remaining,
        maxQuota: limits.dailyPracticeQuestions,
      };
    }
    case "ai_evaluation": {
      const remaining = Math.max(0, limits.dailyAiEvaluations - usage.aiEvaluationsUsedToday);
      return {
        allowed: remaining > 0,
        tier: "free",
        reason:
          remaining <= 0
            ? "Free tier daily AI detailed feedback limit reached (5/day). Upgrade to Member for unlimited scoring."
            : undefined,
        remainingQuota: remaining,
        maxQuota: limits.dailyAiEvaluations,
      };
    }
  }
}
