/**
 * Spaced Repetition System (SRS) - SuperMemo SM-2 Algorithm Implementation
 * Calculates intervals, repetitions, and ease factors for vocabulary flashcard retention.
 */

export type SRSGrade = "again" | "hard" | "good" | "easy";

export interface SRSState {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
}

export interface SRSCalculationResult extends SRSState {
  grade: SRSGrade;
  quality: number; // 0 to 5
}

export const GRADE_QUALITY_MAP: Record<SRSGrade, number> = {
  again: 0, // Complete blackout
  hard: 3, // Correct response recalled with serious difficulty
  good: 4, // Correct response after a hesitation
  easy: 5, // Perfect recall
};

/**
 * Calculates the next SRS interval and ease factor based on SM-2 rules.
 */
export function calculateNextSRSState(
  currentState: Partial<SRSState>,
  grade: SRSGrade,
  now: Date = new Date(),
): SRSCalculationResult {
  const quality = GRADE_QUALITY_MAP[grade];
  let repetitions = currentState.repetitions || 0;
  let intervalDays = currentState.intervalDays || 0;
  let easeFactor = currentState.easeFactor || 2.5;

  if (quality >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = grade === "hard" ? 3 : 6;
    } else {
      const multiplier = grade === "hard" ? 1.2 : grade === "easy" ? 1.4 : 1.0;
      intervalDays = Math.round(intervalDays * easeFactor * multiplier);
    }
    repetitions += 1;
  } else {
    // Failed recall (again) -> Reset repetition cycle
    repetitions = 0;
    intervalDays = 1;
  }

  // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const nextReviewDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    repetitions,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReviewDate.toISOString(),
    grade,
    quality,
  };
}

/**
 * Checks if a word is due for review.
 */
export function isWordDue(nextReviewAt?: string, now: Date = new Date()): boolean {
  if (!nextReviewAt) return true;
  return new Date(nextReviewAt).getTime() <= now.getTime();
}
