/** Server-only: the actual comprehension evaluator with runtime schema validation. */
import { z } from "zod";
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

const SYSTEM = `You evaluate how well a student UNDERSTOOD a technical problem or scenario. You grade their comprehension and grasp of what is being asked, NOT their code syntax or exact mathematical proofs.

The student read the passage briefly, it was then hidden, and they explained — from memory in their own words — what the passage was asking for.

Score these five attributes on a scale of 0 to 10:
- objective (0-10): Did they grasp the primary goal or what the problem is asking to compute/build/find? Give 7-10 if the core goal is identified.
- constraint (0-10): Did they capture the key limits, data types, performance requirements, or bounds mentioned in the passage?
- io (0-10): Did they recognize what inputs are provided and what outputs/results are expected?
- interpretation (0-10): How clearly did they articulate the problem in their own words?
- concept (0-10): Did they identify the relevant foundational computer science / domain ideas (e.g. hash maps, sliding window, caching, graph traversal, dynamic programming)?

GRADING GUIDELINES (FAIR & ENCOURAGING):
- Be constructive, encouraging, and fair.
- If the student clearly understands what the question is asking and conveys the main concept and requirements, award a strong, decent score (7.0 - 9.5).
- Do not penalize harshly for minor phrasing differences, colloquial explanations, or minor omitted trivia as long as the core idea is understood.
- If they capture the objective plus at least one constraint/concept, give at least 6.5 - 8.0.
- Only award low scores (< 5.0) if the response is completely blank, nonsensical, or fundamentally misunderstands the entire objective.
- If the response is off-topic or empty, score 0-2.
- Only list a concept or constraint under missed_concepts / missed_constraints if it was truly absent and critical.
- Feedback must be 2-3 encouraging, constructive sentences explaining what was understood well and what extra detail could be noted next time.

Return ONLY JSON of this exact shape:
{
  "score": <number 0-10, overall comprehension rating>,
  "feedback": "<2-3 constructive sentences>",
  "missed_concepts": ["<verbatim string from EXPECTED CONCEPTS if absent>"],
  "missed_constraints": ["<verbatim string from STATED CONSTRAINTS if absent>"],
  "axis_scores": {
    "objective": <0-10>,
    "constraint": <0-10>,
    "io": <0-10>,
    "concept": <0-10>,
    "interpretation": <0-10>
  }
}`;

// Runtime Zod schema to strictly validate AI outputs rather than trusting raw JSON
const RawEvaluationSchema = z.object({
  score: z.number().min(0).max(10).optional().default(0),
  feedback: z.string().max(3000).optional().default(""),
  missed_concepts: z.array(z.string()).optional().default([]),
  missed_constraints: z.array(z.string()).optional().default([]),
  axis_scores: z.record(z.string(), z.number()).optional().default({}),
});

const clamp = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : fallback;

/**
 * Strict whitelist filter: only allows missed concepts or constraints that exist in the canonical question definition.
 * Prevents prompt-injection or AI hallucination of arbitrary tags.
 */
const pickFromCanonical = (canonicalList: string[], reported: string[]): string[] => {
  if (!Array.isArray(reported) || canonicalList.length === 0) return [];
  const lookup = new Map(canonicalList.map((item) => [item.toLowerCase().trim(), item]));
  const out: string[] = [];
  for (const item of reported) {
    if (typeof item !== "string") continue;
    const match = lookup.get(item.toLowerCase().trim());
    if (match && !out.includes(match)) out.push(match);
  }
  return out;
};

export async function evaluateAnswer(input: EvaluationInput): Promise<EvaluationResult> {
  // Edge Case: Empty or whitespace-only response
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

  const rawJson = await chatJson<unknown>([
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

  // Validate parsed JSON against schema
  const parsed = RawEvaluationSchema.safeParse(rawJson);
  const validated = parsed.success
    ? parsed.data
    : {
        score: 0,
        feedback:
          "Your writing was reviewed, but the evaluator response could not be fully processed.",
        missed_concepts: [],
        missed_constraints: [],
        axis_scores: {},
      };

  const axes = validated.axis_scores;

  return {
    score: clamp(validated.score),
    feedback:
      validated.feedback.trim().length > 0
        ? validated.feedback.trim()
        : "Your writing was reviewed, but no detailed feedback could be generated for this question.",
    missedConcepts: pickFromCanonical(input.concepts, validated.missed_concepts),
    missedConstraints: pickFromCanonical(input.constraints, validated.missed_constraints),
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

const RawDraftSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string().optional().default(""),
        topic: z.string().optional().default(""),
        difficulty: z.string().optional().default("Medium"),
        concepts: z.array(z.string()).optional().default([]),
        constraints: z.array(z.string()).optional().default([]),
        reference_answer: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

export async function draftQuestions(
  category: string,
  rawQuestions: string[],
): Promise<DraftedQuestion[]> {
  let rawJson: unknown;
  try {
    rawJson = await chatJson<unknown>([
      { role: "system", content: DRAFT_SYSTEM },
      {
        role: "user",
        content: `CATEGORY: ${category}\n\nQUESTIONS:\n${rawQuestions
          .map((q, i) => `${i + 1}. ${q}`)
          .join("\n\n")}`,
      },
    ]);
  } catch (err) {
    // AI unavailability must not dead-end the instructor's flow: fall back to a
    // plain, unenriched draft the teacher can complete manually in review.
    console.warn(
      "[draftQuestions] AI drafting failed, using manual-review fallback:",
      err instanceof Error ? err.message : err,
    );
    return rawQuestions.map((text) => ({
      text: text.trim(),
      topic: `${category} (needs review)`,
      difficulty: "Medium",
      concepts: [],
      constraints: [],
      referenceAnswer: "",
    }));
  }

  const parsed = RawDraftSchema.safeParse(rawJson);
  if (!parsed.success) {
    throw new Error("AI generated a malformed response. Please try again.");
  }

  const questions = parsed.data.questions;
  if (questions.length === 0) {
    throw new Error("AI failed to extract any valid questions from the source text.");
  }

  return questions.map((q, index) => ({
    text: (q.text || rawQuestions[index] || "").trim(),
    topic: q.topic.trim() || `${category} (needs review)`,
    difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : "Medium",
    concepts: q.concepts.filter((c) => typeof c === "string"),
    constraints: q.constraints.filter((c) => typeof c === "string"),
    referenceAnswer: q.reference_answer.trim(),
  }));
}
