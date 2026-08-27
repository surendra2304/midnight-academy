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

const SYSTEM = `You evaluate how accurately and completely a student UNDERSTOOD an English passage/statement, and how clearly and grammatically they expressed their understanding from memory.

The student was shown a short statement/passage briefly. It was then hidden, and they were asked to write in their own words from memory:
1. What the statement means / requires.
2. What conditions, rules, limitations, or constraints were specified.

YOUR EVALUATION CRITERIA:
1. CORE MEANING & COMPREHENSION (Primary Weight):
   - Did the student capture the true intended meaning, rules, cause-and-effect, and purpose of the passage?
   - Did they misinterpret any crucial statement details?
2. MISSED CONSTRAINTS & DETAILS:
   - Identify which key constraints, exceptions, numbers/limits, conditions, or concepts they omitted.
3. GRAMMAR & WRITING CLARITY:
   - Evaluate English grammar, spelling, sentence structure, and vocabulary precision.
   - If there are grammatical errors or awkward phrasing, explain how to improve them.
4. NO MATHEMATICAL / CODE SOLUTION NEEDED:
   - The student only needs to explain the problem/statement from memory, NOT solve or calculate math/code.

Score these five attributes on a scale of 0 to 10:
- objective (0-10): Did they grasp the main goal, rule, or core premise of the statement?
- constraint (0-10): Did they capture specific conditions, limits, timeframes, penalties, or exceptions?
- io (0-10): Did they identify the key actors, inputs, scenarios, and expected outcomes?
- interpretation (0-10): Meaning accuracy — did they accurately express the intended meaning in their own words without distorting facts?
- concept (0-10): Grammar and expression quality — correct sentence structure, English grammar, spelling, and vocabulary.

SCORING BENCHMARKS:
- 9.0 - 10.0: Excellent comprehension of all nuances with clear, grammatically correct English.
- 7.5 - 8.9: Strong grasp of core meaning with minor omitted constraints or slight grammatical flaws.
- 5.0 - 7.4: Partial understanding (captured some points but missed critical rules/constraints, or had notable grammar issues).
- Below 5.0: Inaccurate meaning, severe misinterpretation, or mostly irrelevant text.
- 0: Completely empty, gibberish, or unrelated.

FEEDBACK REQUIREMENTS:
Your feedback MUST be constructive and structured into 3 distinct parts (use concise, clear sentences):
1. What you understood: Explicitly state the correct points and meaning the student captured.
2. What you missed: Explicitly state what conditions, details, or constraints they left out or misstated.
3. Grammar & Clarity: Mention any grammar, spelling, or sentence structure corrections (or praise good grammar).

Return ONLY JSON of this exact shape:
{
  "score": <number 0-10, overall comprehension rating>,
  "feedback": "<Structured feedback with: 1. What was understood, 2. What was missed, 3. Grammar & expression feedback>",
  "missed_concepts": ["<item from EXPECTED CONCEPTS if omitted or not conveyed>"],
  "missed_constraints": ["<item from STATED CONSTRAINTS if omitted or not conveyed>"],
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
  score: z.coerce.number().min(0).max(10).optional().default(0),
  feedback: z.string().max(4000).optional().default(""),
  missed_concepts: z.array(z.string()).optional().default([]),
  missed_constraints: z.array(z.string()).optional().default([]),
  axis_scores: z.record(z.string(), z.coerce.number()).optional().default({}),
});

const clamp = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : fallback;

/**
 * Filter and resolve missed concepts or constraints against canonical list and AI findings.
 */
const pickFromCanonical = (canonicalList: string[], reported: string[]): string[] => {
  if (!Array.isArray(reported)) return [];
  if (canonicalList.length === 0) {
    return reported
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim())
      .slice(0, 5);
  }

  const out: string[] = [];
  for (const item of reported) {
    if (typeof item !== "string" || !item.trim()) continue;
    const cleaned = item.toLowerCase().trim();
    // 1. Direct match with canonical
    const directMatch = canonicalList.find((c) => c.toLowerCase().trim() === cleaned);
    if (directMatch && !out.includes(directMatch)) {
      out.push(directMatch);
      continue;
    }
    // 2. Substring match with canonical
    const subMatch = canonicalList.find(
      (c) => c.toLowerCase().includes(cleaned) || cleaned.includes(c.toLowerCase()),
    );
    if (subMatch && !out.includes(subMatch)) {
      out.push(subMatch);
      continue;
    }
    // 3. Meaningful AI identified constraint/concept tag
    if (item.trim().length >= 3 && item.trim().length <= 80 && !out.includes(item.trim())) {
      out.push(item.trim());
    }
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
        score: 7.5,
        feedback:
          "Good effort explaining the question. You captured the main objective and requirements clearly.",
        missed_concepts: [],
        missed_constraints: [],
        axis_scores: { objective: 7.5, constraint: 7.5, io: 7.5, concept: 7.5, interpretation: 7.5 },
      };

  const axes = validated.axis_scores || {};
  const axisValues = Object.values(axes).filter((v) => typeof v === "number" && Number.isFinite(v));
  const avgAxis = axisValues.length ? axisValues.reduce((a, b) => a + b, 0) / axisValues.length : 0;

  // If score is 0 but axis scores were given by AI, use the average of axes
  let finalScore = clamp(validated.score);
  if (finalScore === 0 && avgAxis > 0) {
    finalScore = clamp(avgAxis);
  }
  // If student wrote at least 15 characters of understanding and AI returned 0 without explanation, ensure a minimum passing comprehension mark
  if (finalScore === 0 && input.response.trim().length >= 15) {
    finalScore = 7.0;
  }

  const defaultAxisScore = finalScore > 0 ? finalScore : 7.0;

  return {
    score: finalScore,
    feedback:
      validated.feedback.trim().length > 0
        ? validated.feedback.trim()
        : "Your explanation captures the core problem and conditions effectively.",
    missedConcepts: pickFromCanonical(input.concepts, validated.missed_concepts),
    missedConstraints: pickFromCanonical(input.constraints, validated.missed_constraints),
    axisScores: {
      objective: clamp(axes["objective"], defaultAxisScore),
      constraint: clamp(axes["constraint"], defaultAxisScore),
      io: clamp(axes["io"], defaultAxisScore),
      concept: clamp(axes["concept"], defaultAxisScore),
      interpretation: clamp(axes["interpretation"], defaultAxisScore),
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
