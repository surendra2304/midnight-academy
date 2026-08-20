/** Server-only helpers backing the student test flow. */
import { computeAxes, type EvaluatedAnswer } from "./axes";
import { evaluateAnswer } from "./evaluate.server";
import type { AxisScores } from "./mock-data";

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(category: string): string {
  const prefix =
    category
      .split(/[^A-Za-z]/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 4) || "MID";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const body = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${prefix}-${body}`;
}

export type AnswerRow = {
  id: string;
  question_id: string;
  position: number;
  response: string;
};

export type QuestionRow = {
  id: string;
  text: string;
  concepts: string[];
  constraints: string[];
  reference_answer: string;
};

export type ScoredAnswer = {
  id: string;
  score: number;
  feedback: string;
  missedConcepts: string[];
  missedConstraints: string[];
};

/** Evaluates every answer in an attempt and rolls the results into the five axes. */
export async function evaluateAttempt(
  answers: AnswerRow[],
  questions: Map<string, QuestionRow>,
): Promise<{ scored: ScoredAnswer[]; axes: AxisScores; overall: number }> {
  const results = await Promise.all(
    answers.map(async (answer) => {
      const question = questions.get(answer.question_id);
      if (!question) return null;
      const evaluation = await evaluateAnswer({
        questionText: question.text,
        referenceAnswer: question.reference_answer,
        concepts: question.concepts,
        constraints: question.constraints,
        response: answer.response,
      });
      return { answer, question, evaluation };
    }),
  );

  const usable = results.filter((r): r is NonNullable<typeof r> => r !== null);

  const forAxes: EvaluatedAnswer[] = usable.map(({ question, evaluation }) => ({
    concepts: question.concepts,
    constraints: question.constraints,
    missedConcepts: evaluation.missedConcepts,
    missedConstraints: evaluation.missedConstraints,
    axisScores: evaluation.axisScores,
  }));

  const axes = computeAxes(forAxes);
  const overall = usable.length
    ? Math.round((usable.reduce((sum, r) => sum + r.evaluation.score, 0) / usable.length) * 10)
    : 0;

  return {
    scored: usable.map(({ answer, evaluation }) => ({
      id: answer.id,
      score: evaluation.score,
      feedback: evaluation.feedback,
      missedConcepts: evaluation.missedConcepts,
      missedConstraints: evaluation.missedConstraints,
    })),
    axes,
    overall,
  };
}
