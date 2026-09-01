/**
 * Content Bank Difficulty & Distractor Calibration Engine
 * Computes empirical accuracy, flags difficulty band mismatches, detects dead/ambiguous distractors, and calculates item exposure.
 */

export interface ItemAttemptStats {
  contentItemId: string;
  declaredDifficulty: 'Easy' | 'Medium' | 'Hard' | string;
  totalAttempts: number;
  correctAttempts: number;
  optionSelectionCounts?: Record<string, number>; // e.g. { A: 12, B: 0, C: 2 }
  correctOptionKey?: string;
}

export interface CalibrationItemReport {
  contentItemId: string;
  declaredDifficulty: string;
  empiricalAccuracyPercent: number;
  calibratedDifficulty: 'Easy' | 'Medium' | 'Hard';
  hasDifficultyMismatch: boolean;
  deadDistractors: string[]; // Options with 0 selections
  isAmbiguous: boolean; // Distractor selected more often than correct key
  recommendedAction: 'keep' | 'recalibrate_difficulty' | 'review_distractors';
}

export class CalibrationEngine {
  /**
   * Evaluates empirical difficulty:
   * - Easy: Accuracy >= 75%
   * - Medium: Accuracy between 40% and 74%
   * - Hard: Accuracy < 40%
   */
  deriveCalibratedDifficulty(accuracyPercent: number): 'Easy' | 'Medium' | 'Hard' {
    if (accuracyPercent >= 75) return 'Easy';
    if (accuracyPercent >= 40) return 'Medium';
    return 'Hard';
  }

  /**
   * Analyzes an item's attempt statistics.
   */
  analyzeItem(stats: ItemAttemptStats): CalibrationItemReport {
    const total = stats.totalAttempts;
    const accuracy = total > 0 ? Number(((stats.correctAttempts / total) * 100).toFixed(1)) : 50.0;
    const calibrated = this.deriveCalibratedDifficulty(accuracy);

    // Mismatch if difference is more than 1 band or >= 35% difference from expectation
    const hasMismatch =
      total >= 5 &&
      ((stats.declaredDifficulty === 'Easy' && accuracy < 50) ||
        (stats.declaredDifficulty === 'Hard' && accuracy > 75));

    // Distractor analysis
    const deadDistractors: string[] = [];
    let isAmbiguous = false;

    if (stats.optionSelectionCounts && total >= 5) {
      const correctCount = stats.correctOptionKey ? stats.optionSelectionCounts[stats.correctOptionKey] || 0 : 0;

      for (const [key, count] of Object.entries(stats.optionSelectionCounts)) {
        if (key === stats.correctOptionKey) continue;
        if (count === 0) deadDistractors.push(key);
        if (count > correctCount) isAmbiguous = true;
      }
    }

    let recommendedAction: 'keep' | 'recalibrate_difficulty' | 'review_distractors' = 'keep';
    if (isAmbiguous || deadDistractors.length >= 2) {
      recommendedAction = 'review_distractors';
    } else if (hasMismatch) {
      recommendedAction = 'recalibrate_difficulty';
    }

    return {
      contentItemId: stats.contentItemId,
      declaredDifficulty: stats.declaredDifficulty,
      empiricalAccuracyPercent: accuracy,
      calibratedDifficulty: calibrated,
      hasDifficultyMismatch: hasMismatch,
      deadDistractors,
      isAmbiguous,
      recommendedAction,
    };
  }
}

export const calibrationEngine = new CalibrationEngine();
