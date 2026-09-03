import { describe, it, expect } from "vitest";
import { analyticsEngine, type RawAttemptMetricInput } from "../src/lib/analytics/analytics-engine";

describe("TOEFL Deterministic Analytics & Weakness Profiling Suite", () => {
  it("calculates weakness score accurately with volume weighting", () => {
    // 0% accuracy with 3+ attempts -> 100 max weakness
    expect(analyticsEngine.calculateWeaknessScore(0, 4)).toBe(100);

    // 50% accuracy with 3+ attempts -> 50 weakness
    expect(analyticsEngine.calculateWeaknessScore(50, 5)).toBe(50);

    // 100% accuracy -> 0 weakness
    expect(analyticsEngine.calculateWeaknessScore(100, 3)).toBe(0);

    // Lower confidence for single attempt
    expect(analyticsEngine.calculateWeaknessScore(0, 1)).toBe(60); // 100 * 0.6
  });

  it("aggregates raw attempt items into ranked skill profiles and error classifications", () => {
    const rawMetrics: RawAttemptMetricInput[] = [
      {
        attemptId: "att-1",
        completedAt: "2026-09-01T10:00:00Z",
        sectionType: "reading",
        itemType: "read_academic",
        difficulty: "Medium",
        skillTags: ["Inference", "Biology"],
        isCorrect: false,
        score: 0,
        timeSpentMs: 45000,
        distractorRationale: "Misread the Calvin cycle function.",
      },
      {
        attemptId: "att-1",
        completedAt: "2026-09-01T10:00:00Z",
        sectionType: "reading",
        itemType: "complete_words",
        difficulty: "Easy",
        skillTags: ["Vocabulary"],
        isCorrect: true,
        score: 1.0,
        timeSpentMs: 20000,
      },
      {
        attemptId: "att-1",
        completedAt: "2026-09-01T10:00:00Z",
        sectionType: "writing",
        itemType: "write_email",
        difficulty: "Medium",
        skillTags: ["Email Pragmatics"],
        isCorrect: false,
        score: 0.5,
        timeSpentMs: 120000,
      },
    ];

    const profile = analyticsEngine.computeStudentProfile("student-101", rawMetrics, [
      {
        attemptId: "att-1",
        generatedAt: "2026-09-01T10:30:00Z",
        overallBand: 4.5,
        readingBand: 4.0,
        listeningBand: 5.0,
        writingBand: 4.5,
        speakingBand: 4.5,
      },
    ]);

    expect(profile.studentId).toBe("student-101");
    expect(profile.totalTestsCompleted).toBe(1);
    expect(profile.latestOverallBand).toBe(4.5);
    expect(profile.bestOverallBand).toBe(4.5);

    // Top weak skill should be Inference or Email Pragmatics (0% accuracy)
    expect(profile.topWeakSkills.length).toBeGreaterThan(0);
    const topWeak = profile.topWeakSkills[0];
    expect(topWeak.accuracyPercent).toBeLessThan(100);

    // Error patterns identified
    expect(profile.errorPatterns.length).toBeGreaterThan(0);
  });
});
