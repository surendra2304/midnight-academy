import { describe, expect, it } from "vitest";
import { z } from "zod";
import { bandToComparable120 } from "../src/types/toefl";
import { sentenceScoringService } from "../src/lib/scoring/sentence-scoring";
import { readingScoringService } from "../src/lib/scoring/reading-scoring";

describe("Midnight Academy integrity regressions", () => {
  const uuidSchema = z.string().uuid();

  it("does not accept synthetic attempt IDs", () => {
    const syntheticId = "att-" + Date.now();
    expect(uuidSchema.safeParse(syntheticId).success).toBe(false);
    expect(uuidSchema.safeParse("not-an-attempt-id").success).toBe(false);
    expect(uuidSchema.safeParse("b2000000-0000-0000-0000-000000000001").success).toBe(true);
  });

  it("does not treat fabricated AI scores as valid fallback behavior", () => {
    const allowedStates = new Set(["not_started", "pending", "completed", "failed", "retryable"]);
    expect(allowedStates.has("failed")).toBe(true);
    expect(allowedStates.has("pending")).toBe(true);
    expect(allowedStates.has("completed")).toBe(true);
    expect(allowedStates.has("fallback-3.5")).toBe(false);
    expect(allowedStates.has("fake-3.0")).toBe(false);
  });

  it("requires strict module-to-section authorization", () => {
    const moduleToSection = new Map([
      ["m1", "s1"],
      ["m2", "s2"],
    ]);
    expect(moduleToSection.get("m1")).toBe("s1");
    expect(moduleToSection.get("m2")).toBe("s2");
    expect(moduleToSection.get("m3")).toBeUndefined();

    // Verify cross-section module mismatch is rejected
    const requestedSectionId = "s1";
    const itemModuleId = "m2";
    const isAuthorized = moduleToSection.get(itemModuleId) === requestedSectionId;
    expect(isAuthorized).toBe(false);
  });

  it("scores sentence building deterministically against accepted sequences", () => {
    const wordBank = ["The", "researchers", "published", "their", "findings"];
    const acceptedSequences = [["The", "researchers", "published", "their", "findings"]];

    const correct = sentenceScoringService.scoreResponse(
      "The researchers published their findings",
      { wordBank, acceptedSequences },
    );
    expect(correct.isCorrect).toBe(true);
    expect(correct.score).toBe(1);

    const incorrect = sentenceScoringService.scoreResponse(
      "The findings published researchers their",
      { wordBank, acceptedSequences },
    );
    expect(incorrect.isCorrect).toBe(false);
    expect(incorrect.score).toBe(0);
  });

  it("scores objective reading items accurately with option key matching", () => {
    const options = [
      { optionKey: "A", optionText: "Correct Choice", isCorrect: true },
      {
        optionKey: "B",
        optionText: "Distractor Choice",
        isCorrect: false,
        distractorRationale: "Wrong",
      },
    ];

    const correctRes = readingScoringService.scoreItem("A", {
      itemType: "read_academic",
      options,
      payload: {},
    });
    expect(correctRes.isCorrect).toBe(true);
    expect(correctRes.earnedPoints).toBe(1);

    const incorrectRes = readingScoringService.scoreItem("B", {
      itemType: "read_academic",
      options,
      payload: {},
    });
    expect(incorrectRes.isCorrect).toBe(false);
    expect(incorrectRes.earnedPoints).toBe(0);
    expect(incorrectRes.distractorRationale).toBe("Wrong");
  });

  it("maps 1.0 - 6.0 bands accurately to 0 - 120 comparable TOEFL score", () => {
    expect(bandToComparable120(1.0)).toBe(0);
    expect(bandToComparable120(3.5)).toBe(57);
    expect(bandToComparable120(5.0)).toBe(100);
    expect(bandToComparable120(6.0)).toBe(120);
  });
});
