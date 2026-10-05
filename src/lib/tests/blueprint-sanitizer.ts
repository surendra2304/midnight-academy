const PRIVATE_CONTENT_KEYS = new Set([
  "answer",
  "answers",
  "answerkey",
  "answerkeyjson",
  "correctanswer",
  "correctanswers",
  "correctoption",
  "correctoptionid",
  "correcttokens",
  "acceptedanswers",
  "acceptedsequences",
  "distractorrationale",
  "explanation",
  "expectedkeyphrases",
  "fullwords",
  "hint",
  "iscorrect",
  "keypointstocover",
  "modelanswer",
  "sampleanswer",
  "samplehighscoringresponse",
  "targetsentence",
]);

function normalizeKey(key: string) {
  return key.replace(/[_-]/g, "").toLowerCase();
}

/** Strip scoring keys and model responses before an assessment item reaches the browser. */
export function sanitizeStudentPayload(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const safe: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (PRIVATE_CONTENT_KEYS.has(normalizeKey(key))) continue;
    if (Array.isArray(child)) {
      safe[key] = child.map((entry) => sanitizeNestedValue(entry));
    } else if (child && typeof child === "object") {
      safe[key] = sanitizeStudentPayload(child);
    } else {
      safe[key] = child;
    }
  }
  return safe;
}

function sanitizeNestedValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((entry) => sanitizeNestedValue(entry));
  if (value && typeof value === "object") return sanitizeStudentPayload(value);
  return value;
}
