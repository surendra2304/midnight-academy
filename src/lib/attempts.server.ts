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
  score?: number | null;
  feedback?: string | null;
  missed_concepts?: string[] | null;
  missed_constraints?: string[] | null;
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
  axisScores?: Partial<Record<import("./mock-data").AxisKey, number>>;
};

/** Evaluates every answer in an attempt (reusing already evaluated answers) and rolls the results into the five axes. */
export async function evaluateAttempt(
  answers: AnswerRow[],
  questions: Map<string, QuestionRow>,
): Promise<{ scored: ScoredAnswer[]; axes: AxisScores; overall: number }> {
  const queue = answers.filter((answer) => questions.has(answer.question_id));
  const results: Array<{
    answer: AnswerRow;
    question: QuestionRow;
    evaluation: {
      score: number;
      feedback: string;
      missedConcepts: string[];
      missedConstraints: string[];
      axisScores: Partial<Record<import("./mock-data").AxisKey, number>>;
    };
  }> = [];

  const unScored: AnswerRow[] = [];

  for (const answer of queue) {
    const question = questions.get(answer.question_id)!;
    if (typeof answer.score === "number") {
      // Re-use already evaluated answer from submit-time
      results.push({
        answer,
        question,
        evaluation: {
          score: answer.score,
          feedback: answer.feedback || "",
          missedConcepts: answer.missed_concepts || [],
          missedConstraints: answer.missed_constraints || [],
          axisScores: {
            objective: answer.score,
            constraint: answer.score,
            io: answer.score,
            concept: answer.score,
            interpretation: answer.score,
          },
        },
      });
    } else {
      unScored.push(answer);
    }
  }

  // Only evaluate answers that were not yet scored
  const EVAL_CONCURRENCY = 3;
  for (let i = 0; i < unScored.length; i += EVAL_CONCURRENCY) {
    const batch = unScored.slice(i, i + EVAL_CONCURRENCY);
    const evaluated = await Promise.all(
      batch.map(async (answer) => {
        const question = questions.get(answer.question_id)!;
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
    results.push(...evaluated);
  }

  const usable = results;

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
