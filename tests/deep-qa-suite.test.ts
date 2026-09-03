import { describe, it, expect } from "vitest";
import {
  calculateRemainingSeconds,
  sessionReducer,
  type SessionSnapshot,
  type ClientTestBlueprint,
} from "../src/lib/tests/session-state";
import { checkActionQuota } from "../src/lib/membership/quota-engine";
import { computeWordDiff } from "../src/lib/dictation/word-diff-engine";
import { calculateNextSRSState } from "../src/lib/vocabulary/srs-engine";

describe("Deep QA & Error-Resistance Regression Suite", () => {
  const dummyBlueprint: ClientTestBlueprint = {
    testVersionId: "ver-1",
    testId: "test-1",
    name: "Mock Test 1",
    examMode: "full",
    blueprintVersion: "2026.1",
    sections: [
      {
        id: "sec-1",
        sectionType: "reading",
        sectionOrder: 0,
        timingSeconds: 1800,
        instructions: "Read passages",
        isTimed: true,
        items: [],
      },
    ],
  };

  it("protects against race condition transitions on finished sessions by throwing state guard error", () => {
    const finalizedState: SessionSnapshot = {
      attemptId: "att-1",
      studentId: "stud-1",
      status: "finalized",
      currentSectionIndex: 0,
      currentItemIndex: 0,
      sectionRemainingSeconds: 0,
      isSectionLocked: true,
      responses: {},
      error: null,
      serverTimestampMs: Date.now(),
    };

    expect(() => {
      sessionReducer(
        finalizedState,
        { type: "ADVANCE_SECTION", nextSectionIndex: 1, sectionDurationSeconds: 1800 },
        dummyBlueprint,
      );
    }).toThrow("Cannot advance section from status 'finalized'");
  });

  it("guarantees null-safe response handling in word diff engine", () => {
    const diff = computeWordDiff("", "The lecture begins at noon.");
    expect(diff.accuracyPercent).toBe(0);
    expect(diff.missingWordCount).toBeGreaterThan(0);
  });

  it("handles negative or overflow ratings safely in SuperMemo SM-2", () => {
    const schedule = calculateNextSRSState(
      { repetitions: 0, intervalDays: 1, easeFactor: 2.5 },
      "again",
    );
    expect(schedule.intervalDays).toBe(1);
    expect(schedule.repetitions).toBe(0);
    expect(schedule.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("enforces server-side quota boundaries without integer underflow", () => {
    const exhaustedUsage = {
      userId: "stud-test",
      tier: "free" as const,
      fullMocksUsedThisMonth: 10,
      sectionTestsUsedThisMonth: 10,
      practiceQuestionsUsedToday: 50,
      aiEvaluationsUsedToday: 50,
    };

    const quota = checkActionQuota(exhaustedUsage, "full_mock");
    expect(quota.allowed).toBe(false);
    expect(quota.remainingQuota).toBe(0);
  });
});
