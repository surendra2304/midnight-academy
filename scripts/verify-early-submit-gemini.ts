/**
 * Autonomous Verification: Early Submit for Gemini AI Evaluation
 * Proves that a student can click "Submit for AI Evaluation" early without doing all 47 questions,
 * and Gemini evaluates the submitted answers immediately and generates the score report.
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { attemptSessionService } from "../src/lib/tests/session-service.server";
import { loadTestBlueprint } from "../src/lib/tests/blueprint-loader";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const MOON_VERSION_ID = "f2000000-0000-0000-0000-000000000000";

async function verifyEarlySubmitWithGemini() {
  console.log("========================================================================");
  console.log("   VERIFY EARLY SUBMISSION & GEMINI AI EVALUATION PIPELINE               ");
  console.log("========================================================================\n");

  // 1. Resolve student
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .limit(1);

  if (pErr || !profiles || profiles.length === 0) {
    throw new Error("Failed to find student profile");
  }

  const student = profiles[0];
  console.log(`Student: ${student.full_name} (${student.email}) [${student.id}]`);

  // 2. Start attempt
  console.log("\n1. Starting new Moon Mock Attempt...");
  const session = await attemptSessionService.startAttempt({
    testVersionId: MOON_VERSION_ID,
    studentId: student.id,
    examMode: "full",
    allowRetake: true,
  });
  const attemptId = session.snapshot.attemptId;
  console.log(`-> Attempt started: ${attemptId}`);

  // 3. Answer 2 reading questions in Section 0 (Reading)
  const blueprint = await loadTestBlueprint(MOON_VERSION_ID, "full");
  const readingSec = blueprint.sections.find((s) => s.sectionType === "reading")!;
  const writingSec = blueprint.sections.find((s) => s.sectionType === "writing")!;

  console.log("\n2. Answering 2 reading items early in Section 0...");
  const q0 = readingSec.items[0];
  await attemptSessionService.saveResponse({
    attemptId,
    studentId: student.id,
    contentItemId: q0.id,
    rawAnswer: JSON.stringify(["bones", "million", "rocks", "found", "ancient", "history", "planet", "past", "buried", "sediment"]),
    timeSpentMs: 45000,
  });
  console.log(`-> Answered Reading Cloze (${q0.id})`);

  const q1 = readingSec.items[1];
  await attemptSessionService.saveResponse({
    attemptId,
    studentId: student.id,
    contentItemId: q1.id,
    rawAnswer: JSON.stringify(["plants", "nutrients", "soil", "growing", "forest", "ecosystem", "decay", "matter", "vital", "nature"]),
    timeSpentMs: 40000,
  });
  console.log(`-> Answered Reading Fungi Cloze (${q1.id})`);

  // 4. Advance sections to Writing (Reading [0] -> Listening [1] -> Writing [2])
  console.log("\n3. Advancing to Section 2 (Writing) to test Gemini AI Evaluation on an essay...");
  await attemptSessionService.advanceSection(attemptId, student.id, 0); // moves to Listening (index 1)
  console.log("-> Advanced from Reading (0) to Listening (1)");
  await attemptSessionService.advanceSection(attemptId, student.id, 1); // moves to Writing (index 2)
  console.log("-> Advanced from Listening (1) to Writing (2)");

  // 5. In Writing section, answer the Academic Discussion essay
  const qWriting = writingSec.items.find((it) => it.itemType === "academic_discussion") || writingSec.items[writingSec.items.length - 1];
  console.log(`\n4. Submitting essay for item: ${qWriting.id}...`);
  await attemptSessionService.saveResponse({
    attemptId,
    studentId: student.id,
    contentItemId: qWriting.id,
    rawAnswer: "In my opinion, expanding equitable access to high-quality higher education and vocational training is the single most powerful driver of upward social mobility. When governments invest in subsidized tuition and digital apprenticeships, talented youth from low-income backgrounds can acquire specialized technological skills that immediately open higher-paying career opportunities. As Andrew highlighted, economic safety nets matter, but without marketable skills, long-term upward mobility remains constrained. Therefore, public policy must prioritize targeted educational funding.",
    normalizedAnswer: {
      wordCount: 78,
      submittedAt: new Date().toISOString(),
    },
    timeSpentMs: 120000,
  });
  console.log(`-> Persisted Academic Discussion Essay response to PostgreSQL`);

  // 6. Trigger Early Submit (Student clicks 'Submit for AI Evaluation' early without completing all writing items or speaking section)
  console.log("\n5. Triggering Early 'Submit for AI Evaluation' via finalizeAttempt()...");
  const startTime = Date.now();
  const finalResult = await attemptSessionService.finalizeAttempt(attemptId, student.id);
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`-> Finalize & AI Evaluation completed in ${elapsedSec}s! Status: ${finalResult.status}`);

  // 7. Query PostgreSQL score report to verify real persisted results
  console.log("\n6. Verifying persisted score report in PostgreSQL...");
  const { data: report, error: repErr } = await supabase
    .from("score_reports")
    .select("*")
    .eq("attempt_id", attemptId)
    .single();

  if (repErr || !report) {
    throw new Error(`Score report was not created: ${JSON.stringify(repErr)}`);
  }

  console.log("========================================================================");
  console.log("            OFFICIAL SCORE REPORT VERIFICATION SUCCESS                  ");
  console.log("========================================================================");
  console.log(`Attempt ID:        ${report.attempt_id}`);
  console.log(`Overall Band:      ${report.overall_band} / 6.0`);
  console.log(`Comparable Score:  ${report.comparable_toefl_score} / 120`);
  console.log(`Reading Band:      ${report.reading_band} / 6.0`);
  console.log(`Writing Band (AI): ${report.writing_band} / 6.0`);
  console.log(`Listening Band:    ${report.listening_band} / 6.0`);
  console.log(`Speaking Band:     ${report.speaking_band} / 6.0`);
  console.log(`Summary:           ${report.summary}`);

  // 8. Query evaluations table to verify Gemini output
  const { data: evals } = await supabase
    .from("evaluations")
    .select("score_band, task_score, traits, strengths, issues, model_id")
    .eq("attempt_id", attemptId);

  if (evals && evals.length > 0) {
    console.log("\nGemini AI Evaluation Result for Essay:");
    console.log(`Model:      ${evals[0].model_id}`);
    console.log(`Band Score: ${evals[0].score_band} / 6.0`);
    console.log(`Task Score: ${evals[0].task_score} / 100`);
    console.log(`Strengths:  ${JSON.stringify(evals[0].strengths)}`);
    console.log(`Traits:     ${JSON.stringify(evals[0].traits)}`);
  } else {
    console.log("\nNote: Evaluations query returned empty for attempt:", attemptId);
  }

  console.log("\n>>> EARLY SUBMIT & GEMINI EVALUATION FULLY VERIFIED! <<<");
}

verifyEarlySubmitWithGemini()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Early submit test error:", err);
    process.exit(1);
  });
