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
  const tier: MembershipTier = usage.tier || "free";

  if (tier === "member") {
    return {
      allowed: true,
      tier: "member",
      remainingQuota: Infinity,
      maxQuota: Infinity,
    };
  }

  let used = 0;
  let maxQuota = 0;
  let label = "";

  switch (actionType) {
    case "full_mock":
      used = Math.max(0, usage.fullMocksUsedThisMonth);
      maxQuota = FREE_TIER_LIMITS.monthlyFullMocks;
      label = "Monthly full mock test";
      break;
    case "section_test":
      used = Math.max(0, usage.sectionTestsUsedThisMonth);
      maxQuota = FREE_TIER_LIMITS.monthlySectionTests;
      label = "Monthly section test";
      break;
    case "practice_question":
      used = Math.max(0, usage.practiceQuestionsUsedToday);
      maxQuota = FREE_TIER_LIMITS.dailyPracticeQuestions;
      label = "Daily practice question";
      break;
    case "ai_evaluation":
      used = Math.max(0, usage.aiEvaluationsUsedToday);
      maxQuota = FREE_TIER_LIMITS.dailyAiEvaluations;
      label = "Daily AI evaluation";
      break;
  }

  const remainingQuota = Math.max(0, maxQuota - used);
  const allowed = remainingQuota > 0;

  return {
    allowed,
    tier,
    remainingQuota,
    maxQuota,
    reason: allowed
      ? undefined
      : `${label} limit reached (${maxQuota}/${maxQuota}). Upgrade to Member tier for unlimited access.`,
  };
}
