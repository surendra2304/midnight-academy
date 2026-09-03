/**
 * Deterministic Reading Scoring Service
 * Evaluates objective Reading item types using canonical server-side answer keys.
 * Supports exact match, case normalization, whitespace trimming, alternative keys, and multi-blank partial credit.
 */

import type { ToeflItemType } from "@/types/toefl";

export interface ScoringOption {
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  distractorRationale?: string | null;
}

export interface ItemScoringRule {
  itemType: ToeflItemType;
  difficulty?: string;
  skillTags?: string[];
  options?: ScoringOption[];
  acceptedAnswers?: string[];
  blanks?: Array<{
    blankIndex: number;
    acceptedAnswers: string[];
    weight?: number;
  }>;
  caseSensitive?: boolean;
}

export interface ReadingItemScoreResult {
  isCorrect: boolean;
  score: number; // 0.0 to 1.0 (or partial fraction)
  earnedPoints: number;
  maxPoints: number;
  matchedKey?: string;
  distractorRationale?: string | null;
  blankScores?: Array<{ blankIndex: number; isCorrect: boolean; score: number }>;
}

export class ReadingScoringService {
  /**
   * Evaluates a single Reading item deterministically against its rule/key.
   */
  scoreItem(rawAnswer: string | null | undefined, rule: ItemScoringRule): ReadingItemScoreResult {
    if (!rawAnswer || typeof rawAnswer !== "string" || !rawAnswer.trim()) {
      return {
        isCorrect: false,
        score: 0,
        earnedPoints: 0,
        maxPoints: 1,
        distractorRationale: "No answer was submitted for this question.",
      };
    }

    const trimmed = rawAnswer.trim();

    // 1. Multiple Choice Questions (Read in Daily Life / Read an Academic Passage)
    if (rule.options && rule.options.length > 0) {
      const selectedKey = trimmed.toUpperCase();
      const correctOpt = rule.options.find((o) => o.isCorrect);
      const selectedOpt = rule.options.find(
        (o) => o.optionKey.toUpperCase() === selectedKey || o.optionText.trim() === trimmed,
      );

      if (!correctOpt) {
        throw new Error("Scoring configuration error: Missing correct answer key");
      }

      const isCorrect =
        selectedOpt?.isCorrect === true || selectedKey === correctOpt.optionKey.toUpperCase();

      return {
        isCorrect,
        score: isCorrect ? 1.0 : 0.0,
        earnedPoints: isCorrect ? 1 : 0,
        maxPoints: 1,
        matchedKey: correctOpt.optionKey,
        distractorRationale: isCorrect
          ? null
          : selectedOpt?.distractorRationale || "Incorrect selection.",
      };
    }

    // 2. Multi-Blank Cloze / Complete the Words
    if (rule.blanks && rule.blanks.length > 0) {
      let parsedTokens: string[] = [];
      try {
        const parsedJson = JSON.parse(trimmed);
        parsedTokens = Array.isArray(parsedJson) ? parsedJson : [trimmed];
      } catch {
        parsedTokens = trimmed.split(/[,|\n\t]+/).map((s) => s.trim());
      }

      let totalEarned = 0;
      let totalMax = 0;
      const blankScores: Array<{ blankIndex: number; isCorrect: boolean; score: number }> = [];

      for (const blank of rule.blanks) {
        const weight = blank.weight ?? 1;
        totalMax += weight;

        const candidate = (parsedTokens[blank.blankIndex] || "").trim();
        const candidateNormalized = rule.caseSensitive ? candidate : candidate.toLowerCase();

        const acceptedList =
          blank.acceptedAnswers && blank.acceptedAnswers.length > 0
            ? blank.acceptedAnswers
            : (blank as any).hint
              ? [((blank as any).hint as string).replace(/\s*\(.*?\)/, "").trim()]
              : [];

        const isMatch = acceptedList.some((accepted) => {
          const acceptedNorm = rule.caseSensitive ? accepted.trim() : accepted.trim().toLowerCase();
          return acceptedNorm === candidateNormalized;
        });

        const blankScore = isMatch ? weight : 0;
        totalEarned += blankScore;
        blankScores.push({ blankIndex: blank.blankIndex, isCorrect: isMatch, score: blankScore });
      }

      const isAllCorrect = totalEarned === totalMax && totalMax > 0;
      const normalizedRatio = totalMax > 0 ? totalEarned / totalMax : 0;

      return {
        isCorrect: isAllCorrect,
        score: Number(normalizedRatio.toFixed(2)),
        earnedPoints: totalEarned,
        maxPoints: totalMax,
        blankScores,
      };
    }

    // 3. Single-Blank Accepted Answers Key (Fallback Cloze)
    if (rule.acceptedAnswers && rule.acceptedAnswers.length > 0) {
      const candidateNorm = rule.caseSensitive ? trimmed : trimmed.toLowerCase();
      const isCorrect = rule.acceptedAnswers.some((acc) => {
        const accNorm = rule.caseSensitive ? acc.trim() : acc.trim().toLowerCase();
        return accNorm === candidateNorm;
      });

      return {
        isCorrect,
        score: isCorrect ? 1.0 : 0.0,
        earnedPoints: isCorrect ? 1 : 0,
        maxPoints: 1,
      };
    }

    return {
      isCorrect: false,
      score: 0,
      earnedPoints: 0,
      maxPoints: 1,
      distractorRationale: "No scoring configuration available for this item.",
    };
  }
}

export const readingScoringService = new ReadingScoringService();
