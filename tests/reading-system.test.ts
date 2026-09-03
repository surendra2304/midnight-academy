import { describe, it, expect } from "vitest";
import { readingScoringService } from "../src/lib/scoring/reading-scoring";
import { adaptiveRouter } from "../src/lib/adaptive/adaptive-router";

describe("TOEFL Reading System & Scoring Suite", () => {
  describe("Deterministic Reading Scoring", () => {
    const mcqRule = {
      itemType: "read_daily_life" as const,
      difficulty: "Easy",
      options: [
        {
          optionKey: "A",
          optionText: "Pay cash",
          isCorrect: false,
          distractorRationale: "No cash needed.",
        },
        { optionKey: "B", optionText: "Tap active ID card", isCorrect: true },
        {
          optionKey: "C",
          optionText: "Reserve 24h ahead",
          isCorrect: false,
          distractorRationale: "No reservation required.",
        },
      ],
    };

    it("scores exact match multiple choice correctly", () => {
      const res = readingScoringService.scoreItem("B", mcqRule);
      expect(res.isCorrect).toBe(true);
      expect(res.score).toBe(1.0);
      expect(res.earnedPoints).toBe(1);
    });

    it("handles case-insensitivity and whitespace trimming for options", () => {
      const res = readingScoringService.scoreItem("  b  ", mcqRule);
      expect(res.isCorrect).toBe(true);
      expect(res.score).toBe(1.0);
    });

    it("scores wrong selection with distractor rationale", () => {
      const res = readingScoringService.scoreItem("A", mcqRule);
      expect(res.isCorrect).toBe(false);
      expect(res.score).toBe(0.0);
      expect(res.distractorRationale).toBe("No cash needed.");
    });

    it("scores multi-blank Complete the Words with partial credit", () => {
      const clozeRule = {
        itemType: "complete_words" as const,
        blanks: [
          { blankIndex: 0, acceptedAnswers: ["abundant", "plentiful"], weight: 1 },
          { blankIndex: 1, acceptedAnswers: ["grow", "cultivate"], weight: 1 },
        ],
      };

      // Full credit
      const fullRes = readingScoringService.scoreItem(
        JSON.stringify(["abundant", "grow"]),
        clozeRule,
      );
      expect(fullRes.isCorrect).toBe(true);
      expect(fullRes.score).toBe(1.0);
      expect(fullRes.earnedPoints).toBe(2);

      // Partial credit (1 out of 2 correct)
      const partialRes = readingScoringService.scoreItem(
        JSON.stringify(["abundant", "wrong_word"]),
        clozeRule,
      );
      expect(partialRes.isCorrect).toBe(false);
      expect(partialRes.score).toBe(0.5);
      expect(partialRes.earnedPoints).toBe(1);

      // Alternative accepted answer with case variant
      const altRes = readingScoringService.scoreItem(
        JSON.stringify(["PLENTIFUL", "Cultivate"]),
        clozeRule,
      );
      expect(altRes.isCorrect).toBe(true);
      expect(altRes.score).toBe(1.0);
    });

    it("throws error when correct answer key is missing from rule", () => {
      const brokenRule = {
        itemType: "read_daily_life" as const,
        options: [
          { optionKey: "A", optionText: "Option 1", isCorrect: false },
          { optionKey: "B", optionText: "Option 2", isCorrect: false },
        ],
      };

      expect(() => {
        readingScoringService.scoreItem("A", brokenRule);
      }).toThrow("Missing correct answer key");
    });
  });

  describe("Multistage Adaptive Router", () => {
    const testRoutingRule = {
      thresholds: {
        upperMinScorePercent: 75,
        lowerMaxScorePercent: 50,
      },
      targetModules: {
        upperModuleId: "mod-upper-id",
        middleModuleId: "mod-mid-id",
        lowerModuleId: "mod-lower-id",
      },
    };

    it("routes high performance (>= 75%) to Upper module", () => {
      const decision = adaptiveRouter.evaluateRouting(
        {
          totalItems: 4,
          correctItems: 4,
          earnedPoints: 4,
          maxPoints: 4,
          percentageScore: 100,
          timeSpentSeconds: 120,
        },
        testRoutingRule,
      );

      expect(decision.selectedBand).toBe("upper");
      expect(decision.nextModuleId).toBe("mod-upper-id");
    });

    it("routes low performance (< 50%) to Lower module", () => {
      const decision = adaptiveRouter.evaluateRouting(
        {
          totalItems: 4,
          correctItems: 1,
          earnedPoints: 1,
          maxPoints: 4,
          percentageScore: 25,
          timeSpentSeconds: 150,
        },
        testRoutingRule,
      );

      expect(decision.selectedBand).toBe("lower");
      expect(decision.nextModuleId).toBe("mod-lower-id");
    });

    it("routes boundary threshold score (e.g. exactly 50% or 60%) to Middle module", () => {
      const decision = adaptiveRouter.evaluateRouting(
        {
          totalItems: 4,
          correctItems: 2,
          earnedPoints: 2,
          maxPoints: 4,
          percentageScore: 50,
          timeSpentSeconds: 140,
        },
        testRoutingRule,
      );

      expect(decision.selectedBand).toBe("middle");
      expect(decision.nextModuleId).toBe("mod-mid-id");
    });
  });
});
