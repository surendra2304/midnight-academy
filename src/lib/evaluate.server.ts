/** Server-only: the actual comprehension evaluator. */
import type { AxisKey } from "./mock-data";
import { chatJson } from "./ai.server";

export type EvaluationInput = {
  questionText: string;
  referenceAnswer: string;
  concepts: string[];
  constraints: string[];
  response: string;
};

export type EvaluationResult = {
  score: number;
  feedback: string;
  missedConcepts: string[];
  missedConstraints: string[];
  axisScores: Partial<Record<AxisKey, number>>;
};

const SYSTEM = `You evaluate how well a student UNDERSTOOD a technical question. You never grade whether they solved it.

The student read the question, it was then hidden, and they wrote — from memory — what the question was asking. Judge only their comprehension: the objective, the stated constraints, the inputs and outputs, the underlying concepts, and their interpretation of the scenario.

Rules:
- Be educational and non-judgmental. Never say "wrong", "bad" or "you failed". Describe what was captured and what was not, and how to read for it next time.
- Feedback must be 2-3 complete sentences.
- Only list a concept or constraint as missed if it appears in the provided lists and is genuinely absent or misstated in the student's writing. Copy the missed items verbatim from the lists.
- Empty or off-topic writing scores 0.

Return ONLY JSON of this exact shape:
{
  "score": <number 0-10, overall comprehension>,
  "feedback": "<2-3 sentences>",
  "missed_concepts": ["<verbatim from concepts>"],
  "missed_constraints": ["<verbatim from constraints>"],
  "axis_scores": {
    "objective": <0-10, did they state what the question asks for>,
    "constraint": <0-10, did they capture the stated limits>,
    "io": <0-10, did they capture inputs, outputs and return format>,
    "concept": <0-10, did they name the underlying ideas>,
    "interpretation": <0-10, does their restatement match the real scenario>
  }
}`;

type RawResult = {
  score?: number;
  feedback?: string;
  missed_concepts?: string[];
  missed_constraints?: string[];
  axis_scores?: Record<string, number>;
};

const clamp = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : fallback;

const pickFrom = (list: string[], reported: unknown): string[] => {
  if (!Array.isArray(reported)) return [];
  const lookup = new Map(list.map((item) => [item.toLowerCase().trim(), item]));
  const out: string[] = [];
  for (const item of reported) {
    if (typeof item !== "string") continue;
    const match = lookup.get(item.toLowerCase().trim());
    if (match && !out.includes(match)) out.push(match);
  }
  return out;
};

export async function evaluateAnswer(input: EvaluationInput): Promise<EvaluationResult> {
  if (!input.response.trim()) {
    return {
      score: 0,
      feedback:
        "Nothing was submitted for this question, so there is no understanding to assess. Next time, write even a single sentence naming what the question asks for — starting the sentence is usually what unlocks the rest.",
      missedConcepts: input.concepts,
      missedConstraints: input.constraints,
      axisScores: { objective: 0, constraint: 0, io: 0, concept: 0, interpretation: 0 },
    };
  }

  const raw = await chatJson<RawResult>([
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: [
        `QUESTION:\n${input.questionText}`,
        `REFERENCE ANSWER (for your reference only, the student never saw it):\n${input.referenceAnswer}`,
        `EXPECTED CONCEPTS:\n${input.concepts.map((c) => `- ${c}`).join("\n") || "- (none)"}`,
        `STATED CONSTRAINTS:\n${input.constraints.map((c) => `- ${c}`).join("\n") || "- (none)"}`,
        `STUDENT'S WRITTEN UNDERSTANDING:\n${input.response}`,
      ].join("\n\n"),
    },
  ]);

  const axes = raw.axis_scores ?? {};
  return {
    score: clamp(raw.score),
    feedback:
      typeof raw.feedback === "string" && raw.feedback.trim()
        ? raw.feedback.trim()
        : "Your writing was reviewed, but no detailed feedback could be generated for this question.",
    missedConcepts: pickFrom(input.concepts, raw.missed_concepts),
    missedConstraints: pickFrom(input.constraints, raw.missed_constraints),
    axisScores: {
      objective: clamp(axes["objective"]),
      constraint: clamp(axes["constraint"]),
      io: clamp(axes["io"]),
      concept: clamp(axes["concept"]),
      interpretation: clamp(axes["interpretation"]),
    },
  };
}

export type DraftedQuestion = {
  text: string;
  topic: string;
  difficulty: string;
  concepts: string[];
  constraints: string[];
  referenceAnswer: string;
};

const DRAFT_SYSTEM = `You prepare technical comprehension questions for instructor review.

For each question given to you, draft: the topic, a difficulty (Easy, Medium or Hard), the expected concepts a student should recognise, the constraints explicitly stated in the question, and a concise reference answer (3-5 sentences) describing the correct understanding and approach.

Never invent constraints that are not implied by the question text. Return ONLY JSON:
{ "questions": [ { "text": "<question text, cleaned up but not reworded>", "topic": "...", "difficulty": "Easy|Medium|Hard", "concepts": ["..."], "constraints": ["..."], "reference_answer": "..." } ] }`;

export async function draftQuestions(
  category: string,
  rawQuestions: string[],
): Promise<DraftedQuestion[]> {
  const raw = await chatJson<{
    questions?: {
      text?: string;
      topic?: string;
      difficulty?: string;
      concepts?: string[];
      constraints?: string[];
      reference_answer?: string;
    }[];
  }>([
    { role: "system", content: DRAFT_SYSTEM },
    {
      role: "user",
      content: `CATEGORY: ${category}\n\nQUESTIONS:\n${rawQuestions
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n\n")}`,
    },
  ]);

  return (raw.questions ?? []).map((q, index) => ({
    text: (q.text ?? rawQuestions[index] ?? "").trim(),
    topic: (q.topic ?? "").trim(),
    difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty ?? "")
      ? (q.difficulty as string)
      : "Medium",
    concepts: Array.isArray(q.concepts) ? q.concepts.filter((c) => typeof c === "string") : [],
    constraints: Array.isArray(q.constraints)
      ? q.constraints.filter((c) => typeof c === "string")
      : [],
    referenceAnswer: (q.reference_answer ?? "").trim(),
  }));
}
