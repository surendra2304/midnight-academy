/**
 * Weakness-Driven Personalized Recommendation Engine
 * Generates explainable, reproducible practice queues based on deterministic skill weakness profiles and content banks.
 */

import type { StudentWeaknessProfile, SkillPerformanceMetric } from '@/lib/analytics/analytics-engine';
import type { ToeflSectionType, ToeflItemType } from '@/types/toefl';

export interface CandidateContentItem {
  id: string;
  sectionType: ToeflSectionType;
  itemType: ToeflItemType;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  skillTags: string[];
  title?: string;
  promptSnippet?: string;
}

export interface RecommendationItem {
  id: string;
  contentItemId: string;
  itemType: ToeflItemType;
  sectionType: ToeflSectionType;
  difficulty: string;
  targetSkill: string;
  priority: number; // 1 (Highest) to 5 (Lowest)
  reason: string;
  evidence: {
    skillAccuracyPercent: number;
    skillAttempts: number;
    weaknessScore: number;
  };
  ruleVersion: string;
}

export interface RecommendationEngineConfig {
  ruleVersion?: string;
  maxQueueSize?: number;
  recentAttemptedItemIds?: string[];
}

export class RecommendationEngine {
  /**
   * Generates a deterministic, explainable practice queue.
   */
  generateQueue(
    profile: StudentWeaknessProfile,
    contentPool: CandidateContentItem[],
    config: RecommendationEngineConfig = {},
  ): RecommendationItem[] {
    const ruleVersion = config.ruleVersion || '2026.1';
    const maxQueueSize = config.maxQueueSize || 6;
    const recentIds = new Set(config.recentAttemptedItemIds || []);

    const recommendations: RecommendationItem[] = [];

    // 1. If profile has identified weak skills, match content pool against them
    const weakSkills = profile.topWeakSkills || [];

    for (const weak of weakSkills) {
      if (recommendations.length >= maxQueueSize) break;

      // Find matching items from content pool that target this weak skill and haven't been recently attempted
      const matchingItems = contentPool.filter(
        (item) =>
          !recentIds.has(item.id) &&
          item.sectionType === weak.sectionType &&
          item.skillTags.some((tag) => tag.toLowerCase() === weak.skillName.toLowerCase()),
      );

      for (const matchedItem of matchingItems) {
        if (recommendations.length >= maxQueueSize) break;
        if (recommendations.some((r) => r.contentItemId === matchedItem.id)) continue;

        const priority = weak.weaknessScore >= 70 ? 1 : weak.weaknessScore >= 40 ? 2 : 3;

        recommendations.push({
          id: `rec_${matchedItem.id.slice(0, 8)}`,
          contentItemId: matchedItem.id,
          itemType: matchedItem.itemType,
          sectionType: matchedItem.sectionType,
          difficulty: matchedItem.difficulty,
          targetSkill: weak.skillName,
          priority,
          reason: `Recommended to strengthen '${weak.skillName}' where your demonstrated accuracy is ${weak.accuracyPercent}% across ${weak.totalAttempts} attempts.`,
          evidence: {
            skillAccuracyPercent: weak.accuracyPercent,
            skillAttempts: weak.totalAttempts,
            weaknessScore: weak.weaknessScore,
          },
          ruleVersion,
        });
      }
    }

    // 2. Fallback / Cold Start: If pool is empty or user has no weak items yet, provide balanced starter items
    if (recommendations.length < maxQueueSize) {
      const remainingItems = contentPool.filter(
        (item) => !recentIds.has(item.id) && !recommendations.some((r) => r.contentItemId === item.id),
      );

      for (const item of remainingItems) {
        if (recommendations.length >= maxQueueSize) break;

        const fallbackSkill = item.skillTags[0] || 'General Proficiency';
        recommendations.push({
          id: `rec_fallback_${item.id.slice(0, 8)}`,
          contentItemId: item.id,
          itemType: item.itemType,
          sectionType: item.sectionType,
          difficulty: item.difficulty,
          targetSkill: fallbackSkill,
          priority: 3,
          reason: `Recommended practice item for ${item.sectionType} (${item.itemType.replace(/_/g, ' ')}) to build foundational competency.`,
          evidence: {
            skillAccuracyPercent: 100,
            skillAttempts: 0,
            weaknessScore: 0,
          },
          ruleVersion,
        });
      }
    }

    // Sort deterministically by priority (1 to 5) then by weakness score descending
    return recommendations.sort((a, b) => a.priority - b.priority || b.evidence.weaknessScore - a.evidence.weaknessScore);
  }
}

export const recommendationEngine = new RecommendationEngine();
