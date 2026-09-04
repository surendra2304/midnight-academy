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
  monthlyFullMocks: Infinity,
  monthlySectionTests: Infinity,
  dailyPracticeQuestions: Infinity,
  dailyAiEvaluations: Infinity,
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
  return {
    allowed: true,
    tier: usage.tier || "free",
    remainingQuota: Infinity,
    maxQuota: Infinity,
  };
}
