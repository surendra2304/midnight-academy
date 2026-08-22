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

const SYSTEM = `You evaluate how well a student UNDERSTOOD a technical passage. You never grade whether they solved it.

The student read the passage, it was then hidden, and they wrote — from memory — what the passage was asking. Score these five attributes:

- objective: did they state the main point of what the passage asks?
- constraint: did they lock onto the crucial data points, keywords, limits and factual relationships?
- io: did they retrieve the concrete inputs, outputs, values and formats correctly?
- interpretation: how clearly and grammatically correctly did they restate it IN THEIR OWN WORDS?
- concept: did they name the underlying technical ideas?

Rules:
- VERBATIM COPYING: if long stretches of the student's writing are copied word-for-word from the passage instead of being restated, lower the interpretation score significantly (5 or below) and mention it in the feedback — this assessment rewards summarising in your own words, not retyping the text.
- Favour clean, grammatically accurate sentences over complex vocabulary.
- Be educational and non-judgmental. Never say "wrong", "bad" or "you failed". Describe what was captured and what was not, and how to read for it next time.
- Feedback must be 2-3 complete sentences.
- Only list a concept or constraint as missed if it appears in the provided lists and is genuinely absent or misstated in the student's writing. Copy the missed items verbatim from the lists.
- Empty or off-topic writing scores 0.
- IRRELEVANT RESPONSES: if the student's response is completely irrelevant to the passage or the reference answer — fluent but factually disconnected, hallucinated content — cap ALL five axis scores at 1 (out of 10) and append this exact note at the start of the feedback: "The response appears to be off-topic or completely irrelevant to the passage."

Return ONLY JSON of this exact shape:
{
  "score": <number 0-10, overall comprehension>,
  "feedback": "<2-3 sentences>",
  "missed_concepts": ["<verbatim from concepts>"],
  "missed_constraints": ["<verbatim from constraints>"],
  "axis_scores": {
    "objective": <0-10, the main objective>,
    "constraint": <0-10, stated limits and data points>,
    "io": <0-10, inputs, outputs, values and formats>,
    "concept": <0-10, underlying technical ideas>,
    "interpretation": <0-10, clarity, grammar and own-words restatement>
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
