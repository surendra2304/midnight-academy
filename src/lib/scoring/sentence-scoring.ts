/**
 * Deterministic Sentence Building Scoring Service
 * Evaluates Build a Sentence task types (token/word/phrase ordering).
 */

export interface SentenceScoringRule {
  acceptedSequences: string[][]; // Array of acceptable token index or word/phrase arrays
  tokenList: string[];
}

export interface SentenceScoreResult {
  isCorrect: boolean;
  score: number;
  earnedPoints: number;
  maxPoints: number;
  matchedSequence?: string[];
  feedback?: string;
}

function normalizeSentenceComparisonString(tokensOrText: string | string[]): string {
  const joined = Array.isArray(tokensOrText) ? tokensOrText.join(" ") : tokensOrText;
  return joined
    .trim()
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export class SentenceScoringService {
  /**
   * Scores raw student answer string or token array against accepted sequences.
   */
  scoreResponse(
    response: string | string[] | null | undefined,
    rule: { acceptedSequences: string[][]; wordBank?: string[]; tokenList?: string[] },
  ): SentenceScoreResult {
    let tokens: string[] = [];
    if (Array.isArray(response)) {
      tokens = response;
    } else if (typeof response === "string") {
      const trimmed = response.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            tokens = parsed.map((item) => String(item));
          } else {
            tokens = trimmed.split(/\s+/).filter(Boolean);
          }
        } catch {
          tokens = trimmed.split(/\s+/).filter(Boolean);
        }
      } else {
        tokens = trimmed.split(/\s+/).filter(Boolean);
      }
    }
    return this.scoreSentence(tokens, {
      acceptedSequences: rule.acceptedSequences,
      tokenList: rule.wordBank ?? rule.tokenList ?? [],
    });
  }

  /**
   * Scores a student's ordered tokens against accepted syntactic sequences.
   */
  scoreSentence(studentOrder: string[], rule: SentenceScoringRule): SentenceScoreResult {
    if (!studentOrder || studentOrder.length === 0) {
      return {
        isCorrect: false,
        score: 0,
        earnedPoints: 0,
        maxPoints: 1,
        feedback: "No sentence words were selected or ordered.",
      };
    }

    const studentStr = normalizeSentenceComparisonString(studentOrder);
    if (!studentStr) {
      return {
        isCorrect: false,
        score: 0,
        earnedPoints: 0,
        maxPoints: 1,
        feedback: "No sentence words were selected or ordered.",
      };
    }

    const isMatch = rule.acceptedSequences.some((seq) => {
      const targetStr = normalizeSentenceComparisonString(seq);
      return Boolean(targetStr) && targetStr === studentStr;
    });

    if (isMatch) {
      return {
        isCorrect: true,
        score: 1.0,
        earnedPoints: 1,
        maxPoints: 1,
        matchedSequence: studentOrder,
        feedback: "Correct sentence syntax and structure.",
      };
    }

    // Partial ordering credit calculation (how many adjacent pairs are in correct relative order)
    let bestAdjacentPairsMatch = 0;
    for (const seq of rule.acceptedSequences) {
      let pairsCount = 0;
      const seqStr = normalizeSentenceComparisonString(seq);
      for (let i = 0; i < studentOrder.length - 1; i++) {
        const first = normalizeSentenceComparisonString(studentOrder[i] || "");
        const second = normalizeSentenceComparisonString(studentOrder[i + 1] || "");
        const pair = `${first} ${second}`;
        if (first && second && seqStr.includes(pair)) {
          pairsCount += 1;
        }
      }
      bestAdjacentPairsMatch = Math.max(bestAdjacentPairsMatch, pairsCount);
    }

    const totalPairs = Math.max(1, rule.tokenList.length - 1);
    const partialScore = Number((bestAdjacentPairsMatch / totalPairs).toFixed(2));

    return {
      isCorrect: false,
      score: partialScore >= 0.75 ? 0.5 : 0.0, // Partial credit threshold
      earnedPoints: partialScore >= 0.75 ? 0.5 : 0,
      maxPoints: 1,
      feedback: "The word order contains grammatical or syntactic errors.",
    };
  }
}

export const sentenceScoringService = new SentenceScoringService();
