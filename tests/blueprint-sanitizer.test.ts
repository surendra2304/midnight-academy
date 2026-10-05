import { describe, expect, it } from "vitest";
import { sanitizeStudentPayload } from "../src/lib/tests/blueprint-sanitizer";
import {
  canRevealScoreReportAnswers,
  isAttemptEvaluationFinished,
} from "../src/lib/evaluation/report-access";
import { hasFullToeflSectionCoverage } from "../src/lib/evaluation/score-coverage";

describe("sanitizeStudentPayload", () => {
  it("removes answer keys, explanations, and model responses recursively", () => {
    const safe = sanitizeStudentPayload({
      prompt: "Choose the best answer.",
      answerKey: {
        correctOptionId: "B",
        explanation: "The second option is correct.",
        sampleHighScoringResponse: "A model response.",
      },
      blanks: [
        {
          blankIndex: 0,
          prefix: "ca",
          answer: "t",
          hint: "t",
          acceptedAnswers: ["t", "cat"],
          charCount: 1,
        },
      ],
      modelAnswer: "Do not send this to the test client.",
    });

    expect(safe).toEqual({
      prompt: "Choose the best answer.",
      blanks: [{ blankIndex: 0, prefix: "ca", charCount: 1 }],
    });
  });

  it("preserves question content needed to render and play the prompt", () => {
    const safe = sanitizeStudentPayload({
      questionText: "Why did the student visit the library?",
      stimulusText: "The librarian asks whether the student needs a quiet study room.",
      transcript: "The librarian asks whether the student needs a quiet study room.",
      options: [
        { id: "A", text: "To borrow a book" },
        { id: "B", text: "To reserve a room", is_correct: true },
      ],
    });

    expect(safe.questionText).toBe("Why did the student visit the library?");
    expect(safe.stimulusText).toContain("quiet study room");
    expect(safe.transcript).toContain("quiet study room");
    expect(safe.options).toEqual([
      { id: "A", text: "To borrow a book" },
      { id: "B", text: "To reserve a room" },
    ]);
  });
});

describe("TOEFL full-score coverage", () => {
  it("requires an evaluated score for each of the four sections", () => {
    expect(hasFullToeflSectionCoverage(["reading", "listening", "writing"])).toBe(false);
    expect(hasFullToeflSectionCoverage(["reading", "listening", "writing", "speaking"])).toBe(true);
    expect(hasFullToeflSectionCoverage(["speaking", "writing", "reading", "listening"])).toBe(true);
  });
});

describe("attempt result answer access", () => {
  it("keeps the legacy result endpoint private until the attempt is evaluated", () => {
    expect(isAttemptEvaluationFinished("in_progress")).toBe(false);
    expect(isAttemptEvaluationFinished("evaluating")).toBe(false);
    expect(isAttemptEvaluationFinished("evaluated")).toBe(true);
  });
});

describe("score report answer access", () => {
  it("keeps keys hidden for active, processing, and failed attempts", () => {
    expect(canRevealScoreReportAnswers("in_progress", "not_started")).toBe(false);
    expect(canRevealScoreReportAnswers("evaluating", "pending")).toBe(false);
    expect(canRevealScoreReportAnswers("evaluating", "failed")).toBe(false);
  });

  it("reveals keys only after scoring completes", () => {
    expect(canRevealScoreReportAnswers("evaluated", "completed")).toBe(true);
  });
});
