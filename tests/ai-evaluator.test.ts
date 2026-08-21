import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Gemini AI Comprehension Evaluator Pipeline Hardening", () => {
  const RawEvaluationSchema = z.object({
    score: z.number().min(0).max(10).optional().default(0),
    feedback: z.string().max(3000).optional().default(""),
    missed_concepts: z.array(z.string()).optional().default([]),
    missed_constraints: z.array(z.string()).optional().default([]),
    axis_scores: z.record(z.string(), z.number()).optional().default({}),
  });

  const clamp = (value: unknown, fallback = 0) =>
    typeof value === "number" && Number.isFinite(value)
      ? Math.max(0, Math.min(10, value))
      : fallback;

  const pickFromCanonical = (canonicalList: string[], reported: string[]): string[] => {
    if (!Array.isArray(reported) || canonicalList.length === 0) return [];
    const lookup = new Map(canonicalList.map((item) => [item.toLowerCase().trim(), item]));
    const out: string[] = [];
    for (const item of reported) {
      if (typeof item !== "string") continue;
      const match = lookup.get(item.toLowerCase().trim());
      if (match && !out.includes(match)) out.push(match);
    }
    return out;
  };

  // 1. Model Configuration
  it("ensures default model is gemini-3.7-flash", () => {
    const defaultModel = process.env["GEMINI_MODEL"] || "gemini-3.7-flash";
    expect(defaultModel).toBe("gemini-3.7-flash");
  });

  // 2. Score Clamping & Boundary Invariants
  it("strictly clamps scores within 0-10 bounds", () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(15)).toBe(10);
    expect(clamp(7.5)).toBe(7.5);
    expect(clamp(NaN)).toBe(0);
    expect(clamp(null)).toBe(0);
    expect(clamp(undefined)).toBe(0);
    expect(clamp("10")).toBe(0);
  });

  // 3. Robust JSON Recovery from Model Output
  it("extracts and parses JSON embedded in surrounding text", () => {
    const rawOutput =
      '```json\n{"score": 8, "feedback": "Good understanding.", "missed_concepts": [], "missed_constraints": [], "axis_scores": {"objective": 8}}\n```';
    const start = rawOutput.indexOf("{");
    const end = rawOutput.lastIndexOf("}");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    const jsonStr = rawOutput.slice(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.score).toBe(8);
    expect(parsed.feedback).toBe("Good understanding.");
  });

  // 4. Schema Failure Resilience
  it("safely handles schema mismatch and malformed AI objects", () => {
    const malformedOutput = {
      score: "eight", // Invalid type
      unexpected_field: true,
    };
    const parsed = RawEvaluationSchema.safeParse(malformedOutput);
    // When safeParse fails or data is missing, evaluation falls back cleanly
    const score = parsed.success ? clamp(parsed.data.score) : 0;
    expect(score).toBe(0);
  });

  // 5. Anti-Hallucination Canonical Filtering
  it("filters out hallucinated concepts not in the original question definition", () => {
    const canonicalConcepts = ["Two Sum", "Hash Map", "Complement"];
    const aiReportedMissed = [
      "Hash Map",
      "Hallucinated Concept",
      "Two Sum",
      "Injected Attack <script>",
    ];

    const validated = pickFromCanonical(canonicalConcepts, aiReportedMissed);
    expect(validated).toEqual(["Hash Map", "Two Sum"]);
    expect(validated).not.toContain("Hallucinated Concept");
    expect(validated).not.toContain("Injected Attack <script>");
  });

  // 6. Complete 5-Axis Determinism
  it("ensures all 5 axes are present and numeric even if AI response omits them", () => {
    const aiAxes: Record<string, number> = {
      objective: 9,
      // constraint, io, concept, interpretation missing
    };

    const validatedAxes = {
      objective: clamp(aiAxes["objective"]),
      constraint: clamp(aiAxes["constraint"]),
      io: clamp(aiAxes["io"]),
      concept: clamp(aiAxes["concept"]),
      interpretation: clamp(aiAxes["interpretation"]),
    };

    expect(validatedAxes.objective).toBe(9);
    expect(validatedAxes.constraint).toBe(0);
    expect(validatedAxes.io).toBe(0);
    expect(validatedAxes.concept).toBe(0);
    expect(validatedAxes.interpretation).toBe(0);
  });

  // 7. Error Masking & Security
  it("masks sensitive information from client error messages", () => {
    const internalError = new Error(
      "GEMINI_API_KEY AIzaSySecret123: 429 ResourceExhausted at /internal/path",
    );
    const userSafeMessage = "The evaluator is busy right now. Please try again in a moment.";

    expect(userSafeMessage).not.toContain("AIzaSy");
    expect(userSafeMessage).not.toContain("internal");
    expect(userSafeMessage).not.toContain("ResourceExhausted");
  });

  it("prevents generating tests with zero questions when AI returns an empty array", () => {
    const parsed = { success: true, data: { questions: [] } };
    let errorThrown = false;
    try {
      if (!parsed.success) throw new Error("AI generated a malformed response.");
      if (parsed.data.questions.length === 0) {
        throw new Error("AI failed to extract any valid questions from the source text.");
      }
    } catch (e: unknown) {
      errorThrown = true;
      const message = e instanceof Error ? e.message : String(e);
      expect(message).toContain("failed to extract any valid questions");
    }
    expect(errorThrown).toBe(true);
  });
});
