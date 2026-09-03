import { describe, it, expect } from "vitest";
import { calibrationEngine, type ItemAttemptStats } from "../src/lib/admin/calibration-engine";

describe("Content Bank Calibration & Distractor Quality Suite", () => {
  it("correctly derives calibrated difficulty from empirical accuracy", () => {
    expect(calibrationEngine.deriveCalibratedDifficulty(85)).toBe("Easy");
    expect(calibrationEngine.deriveCalibratedDifficulty(60)).toBe("Medium");
    expect(calibrationEngine.deriveCalibratedDifficulty(25)).toBe("Hard");
  });

  it("flags difficulty mismatches and dead/ambiguous distractors", () => {
    const statsWithDeadDistractor: ItemAttemptStats = {
      contentItemId: "item-cal-1",
      declaredDifficulty: "Hard",
      totalAttempts: 10,
      correctAttempts: 9, // 90% accuracy -> mismatch with "Hard"
      correctOptionKey: "A",
      optionSelectionCounts: { A: 9, B: 0, C: 0, D: 1 }, // B & C are dead distractors
    };

    const report = calibrationEngine.analyzeItem(statsWithDeadDistractor);

    expect(report.empiricalAccuracyPercent).toBe(90.0);
    expect(report.calibratedDifficulty).toBe("Easy");
    expect(report.hasDifficultyMismatch).toBe(true);
    expect(report.deadDistractors).toContain("B");
    expect(report.deadDistractors).toContain("C");
    expect(report.recommendedAction).toBe("review_distractors");
  });

  it("detects ambiguous distractors chosen more often than the correct key", () => {
    const ambiguousStats: ItemAttemptStats = {
      contentItemId: "item-cal-2",
      declaredDifficulty: "Medium",
      totalAttempts: 10,
      correctAttempts: 3,
      correctOptionKey: "A",
      optionSelectionCounts: { A: 3, B: 6, C: 1, D: 0 }, // B is chosen 6 times > A (3 times)
    };

    const report = calibrationEngine.analyzeItem(ambiguousStats);
    expect(report.isAmbiguous).toBe(true);
    expect(report.recommendedAction).toBe("review_distractors");
  });
});
