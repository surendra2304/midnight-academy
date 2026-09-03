import { describe, it, expect } from "vitest";
import { SEEDED_SHADOWING_BANK } from "../src/lib/shadowing/shadowing.functions";
import { computeWordDiff } from "../src/lib/dictation/word-diff-engine";

describe("Shadowing Practice & Rubric Suite", () => {
  it("contains at least 40 original seeded shadowing sentences", () => {
    expect(SEEDED_SHADOWING_BANK.length).toBeGreaterThanOrEqual(40);
  });

  it("covers lower, middle, and upper difficulty bands", () => {
    const lower = SEEDED_SHADOWING_BANK.filter((i) => i.difficulty === "lower");
    const middle = SEEDED_SHADOWING_BANK.filter((i) => i.difficulty === "middle");
    const upper = SEEDED_SHADOWING_BANK.filter((i) => i.difficulty === "upper");

    expect(lower.length).toBeGreaterThanOrEqual(10);
    expect(middle.length).toBeGreaterThanOrEqual(10);
    expect(upper.length).toBeGreaterThanOrEqual(10);
  });

  it("correctly maps repetition accuracy to word diff", () => {
    const item = SEEDED_SHADOWING_BANK[0];
    const perfectRepeat = item.sentence;
    const diff = computeWordDiff(perfectRepeat, item.sentence);

    expect(diff.isPerfectMatch).toBe(true);
    expect(diff.accuracyPercent).toBe(100);
  });

  it("detects missing words and omissions in speech transcript", () => {
    const item = SEEDED_SHADOWING_BANK[1]; // 'I would like to make an appointment with the academic advisor.'
    const partialRepeat = "I would like to make an appointment.";
    const diff = computeWordDiff(partialRepeat, item.sentence);

    expect(diff.isPerfectMatch).toBe(false);
    expect(diff.missingWordCount).toBeGreaterThan(0);
    expect(diff.accuracyPercent).toBeLessThan(100);
  });
});
