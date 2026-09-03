/**
 * Deterministic Sentence Building Scoring Service
 * Evaluates Build a Sentence task types (token/word ordering).
 */

export interface SentenceScoringRule {
  acceptedSequences: string[][]; // Array of acceptable token index or word arrays
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
      tokens = response.trim().split(/\s+/).filter(Boolean);
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

    const studentStr = studentOrder.map((s) => s.trim().toLowerCase()).join(" ");

    const isMatch = rule.acceptedSequences.some((seq) => {
      const targetStr = seq.map((s) => s.trim().toLowerCase()).join(" ");
      return targetStr === studentStr;
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
      for (let i = 0; i < studentOrder.length - 1; i++) {
        const first = studentOrder[i]?.toLowerCase() || "";
        const second = studentOrder[i + 1]?.toLowerCase() || "";
        const pair = `${first} ${second}`;
        const seqStr = seq.map((s) => s.toLowerCase()).join(" ");
        if (seqStr.includes(pair)) {
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
