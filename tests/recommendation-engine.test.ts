import { describe, it, expect } from "vitest";
import {
  recommendationEngine,
  type CandidateContentItem,
} from "../src/lib/recommendations/recommendation-engine";
import type { StudentWeaknessProfile } from "../src/lib/analytics/analytics-engine";

describe("TOEFL Weakness-Driven Recommendation Engine Suite", () => {
  const mockWeaknessProfile: StudentWeaknessProfile = {
    studentId: "student-99",
    calculatedAt: "2026-09-01T10:00:00Z",
    totalTestsCompleted: 2,
    bestOverallBand: 4.5,
    averageOverallBand: 4.0,
    latestOverallBand: 4.0,
    sectionAverages: { reading: 3.5, listening: 4.5, writing: 4.0, speaking: 4.0 },
    topWeakSkills: [
      {
        skillName: "Inference",
        sectionType: "reading",
        totalAttempts: 4,
        correctAttempts: 1,
        accuracyPercent: 25.0,
        averageTimeSpentSeconds: 45,
        weaknessScore: 75.0,
      },
      {
        skillName: "Email Pragmatics",
        sectionType: "writing",
        totalAttempts: 2,
        correctAttempts: 0,
        accuracyPercent: 0.0,
        averageTimeSpentSeconds: 110,
        weaknessScore: 80.0,
      },
    ],
    topStrongSkills: [],
    taskTypeBreakdown: [],
    errorPatterns: [],
    longitudinalTrends: [],
  };

  const mockContentPool: CandidateContentItem[] = [
    {
      id: "item-rd-inf-1",
      sectionType: "reading",
      itemType: "read_academic",
      difficulty: "Medium",
      skillTags: ["Inference", "Biology"],
    },
    {
      id: "item-wr-email-1",
      sectionType: "writing",
      itemType: "write_email",
      difficulty: "Medium",
      skillTags: ["Email Pragmatics", "Campus"],
    },
    {
      id: "item-ls-conv-1",
      sectionType: "listening",
      itemType: "listen_conversation",
      difficulty: "Easy",
      skillTags: ["Listening Comprehension"],
    },
  ];

  it("generates deterministic practice queue targeting top weakness skills", () => {
    const queue1 = recommendationEngine.generateQueue(mockWeaknessProfile, mockContentPool);
    const queue2 = recommendationEngine.generateQueue(mockWeaknessProfile, mockContentPool);

    expect(queue1.length).toBeGreaterThanOrEqual(2);
    expect(queue1[0].targetSkill).toBe("Email Pragmatics");
    expect(queue1[0].priority).toBe(1);
    expect(queue1[0].evidence.weaknessScore).toBe(80.0);

    // Verify queue generation is 100% reproducible
    expect(JSON.stringify(queue1)).toBe(JSON.stringify(queue2));
  });

  it("filters out recently attempted item IDs", () => {
    const queue = recommendationEngine.generateQueue(mockWeaknessProfile, mockContentPool, {
      recentAttemptedItemIds: ["item-rd-inf-1"],
    });

    const hasExcludedItem = queue.some((r) => r.contentItemId === "item-rd-inf-1");
    expect(hasExcludedItem).toBe(false);
  });
});
