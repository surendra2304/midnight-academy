/**
 * Tag → comprehension-axis mapping.
 *
 * Every question carries two tag arrays: `concepts` (what ideas the question is
 * really about) and `constraints` (the stated limits a correct reading must
 * respect). The evaluator reports which of those tags a student's written
 * understanding missed. This module turns those misses into the five axes shown
 * everywhere in the product.
 *
 * Mapping rules (deliberate and documented — no hand-waving):
 *
 * 1. A missed CONSTRAINT tag always damages `constraint`, EXCEPT when the tag is
 *    about the shape of the input or the required output/return format, which is
 *    an `io` failure instead (e.g. "1-based indices returned", "input bounds").
 * 2. A missed CONCEPT tag always damages `concept`, EXCEPT when the tag names an
 *    input/output notion ("index vs value distinction") which maps to `io`.
 * 3. `objective` reflects whether the student stated what the question asks for
 *    at all — the evaluator scores this directly per question.
 * 4. `interpretation` reflects whether the student's restatement matches the
 *    question's actual scenario — also scored directly per question.
 *
 * Axis value = 70% of the evaluator's direct per-axis score (0-10, averaged over
 * questions, scaled to 0-100) + 30% of a tag-coverage score derived from rule 1
 * and 2 (share of that axis's tags the student did NOT miss). When a question
 * contributes no tags to an axis, the direct score carries the full weight.
 */
import { AXIS_KEYS, type AxisKey, type AxisScores } from "./mock-data";

const IO_KEYWORDS = [
  "input",
  "output",
  "return",
  "returned",
  "index",
  "indices",
  "1-based",
  "0-based",
  "format",
  "bounds",
  "bound",
  "range",
  "signature",
  "print",
  "value vs",
  "vs value",
];

const CONSTRAINT_KEYWORDS = [
  "o(",
  "time",
  "space",
  "memory",
  "limit",
  "must",
  "may not",
  "cannot",
  "without",
  "at most",
  "at least",
  "exactly",
  "only",
  "distinct",
  "sorted",
  "in-place",
];

/** Which axis a single tag belongs to, given the array it came from. */
export function classifyTag(tag: string, kind: "concept" | "constraint"): AxisKey {
  const t = tag.toLowerCase();
  if (IO_KEYWORDS.some((k) => t.includes(k))) return "io";
  if (kind === "constraint") return "constraint";
  if (CONSTRAINT_KEYWORDS.some((k) => t.includes(k))) return "constraint";
  return "concept";
}

export type EvaluatedAnswer = {
  concepts: string[];
  constraints: string[];
  missedConcepts: string[];
  missedConstraints: string[];
  /** Direct per-axis 0-10 scores from the evaluator. */
  axisScores: Partial<Record<AxisKey, number>>;
};

type Bucket = { total: number; missed: number };

function emptyBuckets(): Record<AxisKey, Bucket> {
  return AXIS_KEYS.reduce(
    (acc, key) => {
      acc[key] = { total: 0, missed: 0 };
      return acc;
    },
    {} as Record<AxisKey, Bucket>,
  );
}

export function computeAxes(answers: EvaluatedAnswer[]): AxisScores {
  const direct = AXIS_KEYS.reduce(
    (acc, key) => {
      acc[key] = [];
      return acc;
    },
    {} as Record<AxisKey, number[]>,
  );
  const buckets = emptyBuckets();

  for (const answer of answers) {
    for (const key of AXIS_KEYS) {
      const raw = answer.axisScores[key];
      if (typeof raw === "number" && Number.isFinite(raw)) {
        direct[key].push(Math.max(0, Math.min(10, raw)));
      }
    }

    const tag = (list: string[], kind: "concept" | "constraint", missed: string[]) => {
      const missedSet = new Set(missed.map((m) => m.toLowerCase().trim()));
      for (const item of list) {
        const axis = classifyTag(item, kind);
        buckets[axis].total += 1;
        if (missedSet.has(item.toLowerCase().trim())) buckets[axis].missed += 1;
      }
    };

    tag(answer.concepts, "concept", answer.missedConcepts);
    tag(answer.constraints, "constraint", answer.missedConstraints);
  }

  return AXIS_KEYS.reduce((acc, key) => {
    const scores = direct[key];
    const directPct = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 10 : 0;
    const bucket = buckets[key];
    if (!scores.length && bucket.total === 0) {
      acc[key] = 0;
      return acc;
    }
    if (bucket.total === 0) {
      acc[key] = Math.round(directPct);
      return acc;
    }
    const coveragePct = ((bucket.total - bucket.missed) / bucket.total) * 100;
    acc[key] = Math.round(scores.length ? directPct * 0.7 + coveragePct * 0.3 : coveragePct);
    return acc;
  }, {} as AxisScores);
}

export function weakestAxis(axes: AxisScores): AxisKey {
  return AXIS_KEYS.reduce((worst, key) => (axes[key] < axes[worst] ? key : worst), AXIS_KEYS[0]);
}

export function strongestAxis(axes: AxisScores): AxisKey {
  return AXIS_KEYS.reduce((best, key) => (axes[key] > axes[best] ? key : best), AXIS_KEYS[0]);
}
