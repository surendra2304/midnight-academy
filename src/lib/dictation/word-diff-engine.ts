/**
 * Deterministic Word-Diff & Scoring Engine for Dictation Mode
 * Computes exact word-level differences between student input and reference transcript.
 * Supports case normalization, punctuation stripping, curly apostrophe normalization, and homophone tolerance.
 */

export interface DiffToken {
  type: "correct" | "missing" | "wrong" | "extra";
  expected?: string;
  actual?: string;
  isHomophone?: boolean;
}

export interface DictationScoreResult {
  accuracyPercent: number; // 0 to 100
  totalReferenceWords: number;
  correctWordCount: number;
  missingWordCount: number;
  wrongWordCount: number;
  extraWordCount: number;
  tokens: DiffToken[];
  isPerfectMatch: boolean;
}

// Common English Homophones & Phonetic Equivalents
const HOMOPHONES: Record<string, string[]> = {
  their: ["there", "they're"],
  there: ["their", "they're"],
  "they're": ["their", "there"],
  to: ["too", "two"],
  too: ["to", "two"],
  two: ["to", "too"],
  your: ["you're"],
  "you're": ["your"],
  its: ["it's"],
  "it's": ["its"],
  hear: ["here"],
  here: ["hear"],
  accept: ["except"],
  except: ["accept"],
  affect: ["effect"],
  effect: ["affect"],
  weather: ["whether"],
  whether: ["weather"],
  principal: ["principle"],
  principle: ["principal"],
  passed: ["past"],
  past: ["passed"],
  lead: ["led"],
  led: ["lead"],
  brake: ["break"],
  break: ["brake"],
  buy: ["by", "bye"],
  by: ["buy", "bye"],
  bye: ["buy", "by"],
  peace: ["piece"],
  piece: ["peace"],
  right: ["write", "rite"],
  write: ["right", "rite"],
  sight: ["site", "cite"],
  site: ["sight", "cite"],
  cite: ["sight", "site"],
  complement: ["compliment"],
  compliment: ["complement"],
};

/**
 * Normalizes a word: replaces curly quotes, strips trailing/leading punctuation, converts to lowercase.
 */
export function cleanWord(raw: string): string {
  return (raw || "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\w']/g, "")
    .trim();
}

export interface WordDiffOptions {
  allowHomophones?: boolean;
}

/**
 * Checks if two words are phonetic homophones or exact matches.
 */
export function areHomophones(w1: string, w2: string): boolean {
  const c1 = cleanWord(w1);
  const c2 = cleanWord(w2);
  if (c1 === c2) return true;
  const list = HOMOPHONES[c1];
  return Boolean(list && list.includes(c2));
}

/**
 * Checks if two words should be considered equivalent under current options.
 */
export function areWordsEquivalent(w1: string, w2: string, allowHomophones = true): boolean {
  const c1 = cleanWord(w1);
  const c2 = cleanWord(w2);
  if (c1 === c2) return true;
  // Normalized apostrophe-less match (e.g. fridays vs friday's)
  if (c1.replace(/'/g, "") === c2.replace(/'/g, "")) return true;
  if (allowHomophones && areHomophones(c1, c2)) return true;
  return false;
}

/**
 * Computes aligned token diff and metrics using dynamic programming LCS.
 */
export function computeWordDiff(
  studentInput: string,
  referenceTranscript: string,
  options: WordDiffOptions = { allowHomophones: true },
): DictationScoreResult {
  const studentWords = (studentInput || "").trim().split(/\s+/).filter(Boolean);
  const refWords = (referenceTranscript || "").trim().split(/\s+/).filter(Boolean);

  const n = refWords.length;
  const m = studentWords.length;

  if (n === 0) {
    return {
      accuracyPercent: m === 0 ? 100 : 0,
      totalReferenceWords: 0,
      correctWordCount: 0,
      missingWordCount: 0,
      wrongWordCount: 0,
      extraWordCount: m,
      tokens: studentWords.map((w) => ({ type: "extra", actual: w })),
      isPerfectMatch: m === 0,
    };
  }

  if (m === 0) {
    return {
      accuracyPercent: 0,
      totalReferenceWords: n,
      correctWordCount: 0,
      missingWordCount: n,
      wrongWordCount: 0,
      extraWordCount: 0,
      tokens: refWords.map((w) => ({ type: "missing", expected: w })),
      isPerfectMatch: false,
    };
  }

  // 1. Build LCS Dynamic Programming Matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const refW = refWords[i - 1] || "";
      const stuW = studentWords[j - 1] || "";
      const matches = areWordsEquivalent(refW, stuW, options.allowHomophones);

      const prevRow = dp[i - 1];
      const curRow = dp[i];
      if (curRow && prevRow) {
        if (matches) {
          curRow[j] = (prevRow[j - 1] ?? 0) + 1;
        } else {
          curRow[j] = Math.max(prevRow[j] ?? 0, curRow[j - 1] ?? 0);
        }
      }
    }
  }

  // 2. Backtrack to construct aligned tokens
  let i = n;
  let j = m;
  const rawTokens: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const refW = refWords[i - 1] || "";
      const stuW = studentWords[j - 1] || "";
      const exactMatch = cleanWord(refW) === cleanWord(stuW);
      const isEq = areWordsEquivalent(refW, stuW, options.allowHomophones);

      if (isEq) {
        rawTokens.unshift({
          type: "correct",
          expected: refW,
          actual: stuW,
          isHomophone: !exactMatch && areHomophones(refW, stuW),
        });
        i--;
        j--;
        continue;
      }
    }

    const prevRow = dp[i - 1];
    const curRow = dp[i];
    const leftVal = curRow?.[j - 1] ?? 0;
    const upVal = prevRow?.[j] ?? 0;

    if (i > 0 && (j === 0 || upVal >= leftVal)) {
      // Missing word from reference
      rawTokens.unshift({
        type: "missing",
        expected: refWords[i - 1] || "",
      });
      i--;
    } else if (j > 0) {
      // Extra word from student
      rawTokens.unshift({
        type: "extra",
        actual: studentWords[j - 1] || "",
      });
      j--;
    }
  }

  // 3. Consolidate adjacent missing + extra into 'wrong' replacements for better UX
  const tokens: DiffToken[] = [];
  let k = 0;
  while (k < rawTokens.length) {
    const cur = rawTokens[k];
    if (!cur) {
      k += 1;
      continue;
    }
    const next = rawTokens[k + 1];

    if (cur.type === "missing" && next && next.type === "extra") {
      tokens.push({
        type: "wrong",
        expected: cur.expected || "",
        actual: next.actual || "",
      });
      k += 2;
    } else if (cur.type === "extra" && next && next.type === "missing") {
      tokens.push({
        type: "wrong",
        expected: next.expected || "",
        actual: cur.actual || "",
      });
      k += 2;
    } else {
      tokens.push(cur);
      k += 1;
    }
  }

  // 4. Calculate final metrics
  let correctWordCount = 0;
  let missingWordCount = 0;
  let wrongWordCount = 0;
  let extraWordCount = 0;

  for (const t of tokens) {
    if (t.type === "correct") correctWordCount++;
    else if (t.type === "missing") missingWordCount++;
    else if (t.type === "wrong") wrongWordCount++;
    else if (t.type === "extra") extraWordCount++;
  }

  // Scoring formula: (Correct - 0.2 * Extra) / TotalReferenceWords
  const rawScore = (correctWordCount - extraWordCount * 0.2) / n;
  const accuracyPercent = Math.max(0, Math.min(100, Math.round(rawScore * 100)));
  const isPerfectMatch = correctWordCount === n && extraWordCount === 0 && wrongWordCount === 0;

  return {
    accuracyPercent,
    totalReferenceWords: n,
    correctWordCount,
    missingWordCount,
    wrongWordCount,
    extraWordCount,
    tokens,
    isPerfectMatch,
  };
}
