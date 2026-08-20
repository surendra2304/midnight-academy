import { describe, it, expect } from "vitest";
import { computeAxes, classifyTag, weakestAxis, strongestAxis } from "../src/lib/axes";
import { evaluateAnswer } from "../src/lib/evaluate.server";
import { normalizeCode, generateCode } from "../src/lib/attempts.server";
import { splitQuestions, average } from "../src/lib/admin.server";

describe("Axes & Evaluation Engine", () => {
  it("classifies tags correctly based on keywords and kind", () => {
    expect(classifyTag("return format as array", "concept")).toBe("io");
    expect(classifyTag("1-based index", "constraint")).toBe("io");
    expect(classifyTag("O(n) time limit", "constraint")).toBe("constraint");
    expect(classifyTag("two pointers technique", "concept")).toBe("concept");
  });

  it("calculates axes accurately blending direct score and tag coverage", () => {
    const answers = [
      {
        concepts: ["Two Pointers", "Sorted Array"],
        constraints: ["O(N) Time", "Distinct Elements"],
        missedConcepts: ["Sorted Array"],
        missedConstraints: [],
        axisScores: {
          objective: 9,
          constraint: 10,
          io: 8,
          concept: 7,
          interpretation: 9,
        },
      },
    ];

    const axes = computeAxes(answers);
    expect(axes.objective).toBe(90);
    // Direct score 10 (100%) * 0.7 + coverage 100% * 0.3 = 100
    expect(axes.constraint).toBeGreaterThanOrEqual(90);
    expect(axes.concept).toBeLessThan(90);
    expect(weakestAxis(axes)).toBeDefined();
    expect(strongestAxis(axes)).toBeDefined();
  });

  it("handles empty student answers with zero score and all missed tags", async () => {
    const result = await evaluateAnswer({
      questionText: "Given an array, return two sums.",
      referenceAnswer: "Use a hash map to find complement.",
      concepts: ["Hash Map", "Complement"],
      constraints: ["O(N) Time"],
      response: "   ",
    });

    expect(result.score).toBe(0);
    expect(result.missedConcepts).toEqual(["Hash Map", "Complement"]);
    expect(result.missedConstraints).toEqual(["O(N) Time"]);
    expect(result.axisScores.objective).toBe(0);
  });
});

describe("Admin & Utility Functions", () => {
  it("normalizes test codes consistently", () => {
    expect(normalizeCode(" dsa-x7k29 ")).toBe("DSA-X7K29");
    expect(normalizeCode("cn_t2l88")).toBe("CN_T2L88");
  });

  it("generates unique category-prefixed codes", () => {
    const code = generateCode("Data Structures");
    expect(code).toMatch(/^DS-[A-Z0-9]{5}$/);
  });

  it("splits pasted questions reliably by numbers or blank lines", () => {
    const doc = `1. Explain Dijkstra's shortest path algorithm.\n\n2. Describe the Bellman-Ford algorithm and its edge cases.`;
    const questions = splitQuestions(doc);
    expect(questions.length).toBe(2);
    expect(questions[0]).toContain("Dijkstra");
    expect(questions[1]).toContain("Bellman-Ford");
  });

  it("computes averages correctly without NaN", () => {
    expect(average([80, 90, 100])).toBe(90);
    expect(average([])).toBe(0);
  });
});
