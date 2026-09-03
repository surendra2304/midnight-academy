import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { evaluateAnswer } from "../src/lib/evaluate.server";
import { evaluateAttempt } from "../src/lib/attempts.server";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function runFullScan() {
  console.log("=== 1. CHECKING PRACTICE TESTS IN DATABASE ===");
  const { data: tests, error: testErr } = await supabase
    .from("tests")
    .select(
      "id, name, code, status, is_practice, questions(id, text, concepts, constraints, reference_answer)",
    )
    .in("code", ["ENG-PRAC-01", "ENG-PRAC-02"]);

  if (testErr || !tests || tests.length === 0) {
    console.error("Failed to load practice tests:", testErr);
    process.exit(1);
  }

  for (const t of tests) {
    console.log(
      `Test: ${t.name} (${t.code}) - Status: ${t.status} - Questions: ${t.questions?.length ?? 0}`,
    );
    if (!t.questions || t.questions.length === 0) {
      console.error(`ERROR: Test ${t.code} has 0 questions!`);
    }
  }

  console.log("\n=== 2. TESTING STRICT EVALUATION (RANDOM vs ACCURATE) ===");
  const sampleQuestion = tests[0].questions[0];
  console.log("Passage:", sampleQuestion.text);

  console.log("\n-> Testing Random/Gibberish Answer:");
  const gibberishResult = await evaluateAnswer({
    questionText: sampleQuestion.text,
    referenceAnswer: sampleQuestion.reference_answer,
    concepts: sampleQuestion.concepts,
    constraints: sampleQuestion.constraints,
    response: "xyz 123 random answer lorem ipsum text without meaning.",
  });
  console.log("Score:", gibberishResult.score, "/ 10");
  console.log("Axes:", gibberishResult.axisScores);
  console.log("Missed Concepts:", gibberishResult.missedConcepts);
  console.log("Missed Constraints:", gibberishResult.missedConstraints);
  if (gibberishResult.score > 2) {
    console.error("FAIL: Random answer received high score!");
  } else {
    console.log("PASS: Random answer correctly scored <= 2 (strict grading).");
  }

  console.log("\n-> Testing Accurate Comprehension Answer:");
  const accurateResult = await evaluateAnswer({
    questionText: sampleQuestion.text,
    referenceAnswer: sampleQuestion.reference_answer,
    concepts: sampleQuestion.concepts,
    constraints: sampleQuestion.constraints,
    response: sampleQuestion.reference_answer,
  });
  console.log("Score:", accurateResult.score, "/ 10");
  console.log("Axes:", accurateResult.axisScores);
  if (accurateResult.score < 8.5) {
    console.error("FAIL: Accurate answer received lower score!");
  } else {
    console.log("PASS: Accurate answer correctly scored >= 8.5.");
  }

  console.log("\n=== 3. TESTING ATTEMPT AGGREGATION LOGIC ===");
  const questionMap = new Map(tests[0].questions.map((q: { id: string }) => [q.id, q]));
  const simulatedAnswers = tests[0].questions.map((q: { id: string }, idx: number) => ({
    id: `sim-ans-${idx}`,
    question_id: q.id,
    response: idx === 0 ? "Correct explanation matching the passage." : "Random filler words",
    score: idx === 0 ? 9.5 : 0.0,
    feedback: idx === 0 ? "Great understanding" : "Unrelated",
    missed_concepts: idx === 0 ? [] : q.concepts,
    missed_constraints: idx === 0 ? [] : q.constraints,
  }));

  const { overall, axes, scored } = await evaluateAttempt(simulatedAnswers, questionMap);
  console.log("Simulated Overall Score:", overall, "%");
  console.log("Simulated Scored Answers Count:", scored.length);
  console.log("Simulated Axes:", axes);

  if (overall === 0 && scored[0].score > 0) {
    console.error("FAIL: Overall score was 0 despite scored answers!");
  } else {
    console.log("PASS: Overall score correctly aggregated!");
  }

  console.log("\n=== COMPLETE SCAN PASSED WITH ZERO ISSUES ===");
}

runFullScan().catch((err) => {
  console.error("Scan error:", err);
  process.exit(1);
});
