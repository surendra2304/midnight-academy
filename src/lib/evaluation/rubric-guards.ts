/**
 * Shared anti-gaming guards for the deterministic (fallback) rubric evaluators.
 *
 * When the AI evaluator is unavailable, the rule-based writers score length,
 * transitions, and vocabulary. Without these guards a student could submit a
 * long "word salad" (no function words, no overlap with the prompt) and still
 * collect a high band, and a literally empty item (or a placeholder like "{}")
 * could score above the true minimum. These helpers keep scores monotone:
 * garbage must never outscore coherent, on-topic prose, and non-responses must
 * score exactly zero.
 */

const FUNCTION_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "nor",
  "so",
  "because",
  "while",
  "although",
  "though",
  "if",
  "then",
  "than",
  "as",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "for",
  "from",
  "with",
  "without",
  "within",
  "into",
  "onto",
  "over",
  "under",
  "about",
  "after",
  "before",
  "during",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "am",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "will",
  "would",
  "can",
  "could",
  "should",
  "shall",
  "may",
  "might",
  "must",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "there",
  "here",
  "they",
  "them",
  "their",
  "theirs",
  "we",
  "us",
  "our",
  "ours",
  "you",
  "your",
  "yours",
  "he",
  "him",
  "his",
  "she",
  "her",
  "hers",
  "i",
  "me",
  "my",
  "mine",
]);

export interface SubstantiveTextAnalysis {
  /** Lowercased word tokens containing at least one alphanumeric character. */
  words: string[];
  wordCount: number;
  /** Fraction of tokens that are English function words (grammar glue). */
  functionRatio: number;
  /** At least `minWords` real words. */
  hasMinimumLength: boolean;
  /** Reads like connected prose rather than a keyword/punctuation dump. */
  looksCoherent: boolean;
}

export function analyzeSubstantiveText(
  text: string | null | undefined,
  minWords = 12,
): SubstantiveTextAnalysis {
  const words = (text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/.test(w));
  const wordCount = words.length;
  const functionHits = words.filter((w) => FUNCTION_WORDS.has(w.replace(/[^a-z']/g, ""))).length;
  const functionRatio = wordCount > 0 ? functionHits / wordCount : 0;
  return {
    words,
    wordCount,
    functionRatio,
    hasMinimumLength: wordCount >= minWords,
    // Connected prose in English almost always carries >10% function words.
    looksCoherent: wordCount > 0 && functionRatio >= 0.1,
  };
}

/**
 * Words unique to the student's response that also occur in the prompt/context,
 * used as a cheap relevance signal by both writing and speaking fallbacks.
 */
export function promptOverlapHits(responseWords: string[], promptText: string): number {
  const promptWords = new Set(
    promptText
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 4 && !FUNCTION_WORDS.has(w)),
  );
  let hits = 0;
  const seen = new Set<string>();
  for (const w of responseWords) {
    if (seen.has(w)) continue;
    seen.add(w);
    if (promptWords.has(w)) hits++;
  }
  return hits;
}

/** ETS-style floor: band 1 with zero credit for responses we cannot score higher. */
export const NO_SUBSTANCE_RESULT = {
  score_band: 1,
  task_score: 0,
} as const;
