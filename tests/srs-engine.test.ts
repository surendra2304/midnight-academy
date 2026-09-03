import { describe, it, expect } from "vitest";
import { calculateNextSRSState, isWordDue } from "../src/lib/vocabulary/srs-engine";

describe("SRS SuperMemo-2 Spaced Repetition Engine", () => {
  it("initializes a fresh word with 1 day interval on first good review", () => {
    const now = new Date("2026-09-01T12:00:00Z");
    const result = calculateNextSRSState({}, "good", now);

    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBe(2.5);
    expect(result.nextReviewAt).toBe(new Date("2026-09-02T12:00:00Z").toISOString());
  });

  it("progresses interval from 1 to 6 days on second successful review", () => {
    const now = new Date("2026-09-02T12:00:00Z");
    const result = calculateNextSRSState(
      { repetitions: 1, intervalDays: 1, easeFactor: 2.5 },
      "good",
      now,
    );

    expect(result.repetitions).toBe(2);
    expect(result.intervalDays).toBe(6);
  });

  it('resets repetitions and interval on "again" failure', () => {
    const now = new Date("2026-09-10T12:00:00Z");
    const result = calculateNextSRSState(
      { repetitions: 4, intervalDays: 25, easeFactor: 2.6 },
      "again",
      now,
    );

    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBeLessThan(2.6);
  });

  it("enforces a minimum ease factor of 1.3", () => {
    let state = { repetitions: 0, intervalDays: 0, easeFactor: 1.35 };
    for (let i = 0; i < 5; i++) {
      state = calculateNextSRSState(state, "again");
    }

    expect(state.easeFactor).toBe(1.3);
  });

  it("correctly determines due words", () => {
    const past = new Date("2026-08-30T12:00:00Z").toISOString();
    const future = new Date("2026-09-05T12:00:00Z").toISOString();
    const current = new Date("2026-09-01T12:00:00Z");

    expect(isWordDue(past, current)).toBe(true);
    expect(isWordDue(future, current)).toBe(false);
    expect(isWordDue(undefined, current)).toBe(true);
  });
});
