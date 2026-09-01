/**
 * Multistage Adaptive Router for TOEFL Reading & Listening
 * Reads data-driven routing_rule JSON from module definitions and computes stage-2 routing.
 */

import type { ToeflDifficultyBand } from '@/types/toefl';

export interface StagePerformanceMetrics {
  totalItems: number;
  correctItems: number;
  earnedPoints: number;
  maxPoints: number;
  percentageScore: number;
  timeSpentSeconds: number;
}

export interface AdaptiveRoutingRule {
  thresholds: {
    upperMinScorePercent: number; // e.g. 75 (%)
    lowerMaxScorePercent: number; // e.g. 50 (%)
  };
  targetModules: {
    upperModuleId?: string;
    middleModuleId?: string;
    lowerModuleId?: string;
  };
  fallbackBand?: ToeflDifficultyBand;
}

export interface RoutingDecisionResult {
  nextModuleId?: string;
  selectedBand: ToeflDifficultyBand;
  reason: string;
  metricsUsed: StagePerformanceMetrics;
  ruleEvaluated: AdaptiveRoutingRule;
  decidedAt: string;
}

export class AdaptiveRouter {
  /**
   * Evaluates stage-1 performance metrics against the module's routing rule.
   */
  evaluateRouting(
    metrics: StagePerformanceMetrics,
    rule: AdaptiveRoutingRule,
  ): RoutingDecisionResult {
    const score = metrics.percentageScore;
    const nowIso = new Date().toISOString();

    const upperThreshold = rule.thresholds?.upperMinScorePercent ?? 75;
    const lowerThreshold = rule.thresholds?.lowerMaxScorePercent ?? 50;

    // 1. High Performance -> Route to Upper Band
    if (score >= upperThreshold) {
      return {
        nextModuleId: rule.targetModules?.upperModuleId,
        selectedBand: 'upper',
        reason: `Performance (${score.toFixed(1)}%) met or exceeded upper threshold (${upperThreshold}%). Routed to Upper difficulty module.`,
        metricsUsed: metrics,
        ruleEvaluated: rule,
        decidedAt: nowIso,
      };
    }

    // 2. Weaker Performance -> Route to Lower Band
    if (score < lowerThreshold) {
      return {
        nextModuleId: rule.targetModules?.lowerModuleId,
        selectedBand: 'lower',
        reason: `Performance (${score.toFixed(1)}%) fell below lower threshold (${lowerThreshold}%). Routed to Lower difficulty module.`,
        metricsUsed: metrics,
        ruleEvaluated: rule,
        decidedAt: nowIso,
      };
    }

    // 3. Moderate Performance -> Route to Middle / Configured Fallback Band
    const fallback = rule.fallbackBand || 'middle';
    return {
      nextModuleId: rule.targetModules?.middleModuleId,
      selectedBand: fallback,
      reason: `Performance (${score.toFixed(1)}%) in middle band [${lowerThreshold}% - ${upperThreshold}%]. Routed to Middle difficulty module.`,
      metricsUsed: metrics,
      ruleEvaluated: rule,
      decidedAt: nowIso,
    };
  }
}

export const adaptiveRouter = new AdaptiveRouter();
