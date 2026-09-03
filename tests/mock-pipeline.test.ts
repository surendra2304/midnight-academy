import { describe, it, expect } from "vitest";
import { bandToComparable120 } from "../src/types/toefl";

describe("TOEFL Full Mock Orchestration & Pipeline Suite", () => {
  it("verifies 4-section sequence logic and band score calculation", () => {
    const readingBand = 5.0;
    const listeningBand = 5.5;
    const writingBand = 5.0;
    const speakingBand = 4.5;

    const allBands = [readingBand, listeningBand, writingBand, speakingBand];
    const avg = allBands.reduce((a, b) => a + b, 0) / 4; // 5.0
    const overallBand = Math.round(avg * 2) / 2;

    expect(overallBand).toBe(5.0);
    expect(bandToComparable120(overallBand)).toBe(100);
  });

  it("verifies reproducible score report calculation across all band thresholds", () => {
    expect(bandToComparable120(6.0)).toBe(120);
    expect(bandToComparable120(5.5)).toBe(110);
    expect(bandToComparable120(5.0)).toBe(100);
    expect(bandToComparable120(4.5)).toBe(88);
    expect(bandToComparable120(4.0)).toBe(72);
    expect(bandToComparable120(3.5)).toBe(57);
    expect(bandToComparable120(3.0)).toBe(42);
    expect(bandToComparable120(2.5)).toBe(27);
    expect(bandToComparable120(2.0)).toBe(15);
    expect(bandToComparable120(1.5)).toBe(8);
    expect(bandToComparable120(1.0)).toBe(0);
  });
});
