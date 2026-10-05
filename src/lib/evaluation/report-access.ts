/** Legacy attempts store completion in their status column. */
export function isAttemptEvaluationFinished(attemptStatus: string | null | undefined): boolean {
  return attemptStatus === "evaluated";
}

/** Answer explanations are review-only: never expose them before scoring is complete. */
export function canRevealScoreReportAnswers(
  attemptStatus: string | null | undefined,
  evaluationStatus: string | null | undefined,
): boolean {
  return isAttemptEvaluationFinished(attemptStatus) && evaluationStatus === "completed";
}
