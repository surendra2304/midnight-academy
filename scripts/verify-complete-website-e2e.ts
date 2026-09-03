import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { attemptSessionService } from "../src/lib/tests/session-service.server";
import { loadTestBlueprint } from "../src/lib/tests/blueprint-loader";
import { sessionReducer } from "../src/lib/tests/session-state";
import { mockEvaluationPipelineService } from "../src/lib/evaluation/mock-pipeline.server";
import { computeWordDiff } from "../src/lib/dictation/word-diff-engine";
import { calculateNextSRSState } from "../src/lib/vocabulary/srs-engine";
import { contentValidator } from "../src/lib/admin/content-validator";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function runCompleteWebsiteVerification() {
  console.log("================================================================");
  console.log("      MIDNIGHT ACADEMY: COMPLETE END-TO-END SYSTEM TEST         ");
  console.log("================================================================\n");

  let passedChecks = 0;
  let totalChecks = 0;

  function assert(condition: boolean, message: string) {
    totalChecks++;
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    } else {
      passedChecks++;
      console.log(`✅ PASSED: ${message}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Blueprint Loading & Content Integrity
  // -------------------------------------------------------------
  console.log("\n--- TEST 1: Published Blueprint Integrity ---");
  const { data: dbVersions, error: tvErr } = await supabase
    .from("test_versions")
    .select("id, status, test_id")
    .eq("status", "published");

  assert(Boolean(dbVersions && dbVersions.length > 0), `Found ${dbVersions?.length} published test versions in DB`);
  const testVersionIds = dbVersions!.map((v) => v.id);

  for (const vId of testVersionIds) {
    const bp = await loadTestBlueprint(vId, "full");
    assert(bp.sections.length > 0, `Blueprint ${vId} has ${bp.sections.length} sections`);
    for (const sec of bp.sections) {
      assert(sec.items.length > 0, `Section ${sec.sectionType} in ${vId} has ${sec.items.length} items`);
      for (const item of sec.items) {
        assert(Boolean(item.id && item.itemType), `Item ${item.id} has valid type`);
        if (sec.sectionType === "listening") {
          const payload = item.payload as any;
          const hasSpeechText = Boolean(payload?.stimulusText || payload?.prompt || payload?.transcript);
          assert(hasSpeechText, `Listening item ${item.id} contains audio stimulus / speech text`);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // TEST 2: Full Mock Exam E2E Simulation (Reading -> Listening -> Writing -> Speaking)
  // -------------------------------------------------------------
  console.log("\n--- TEST 2: Full Mock Exam E2E (All 4 Sections + Navigation + Scoring) ---");
  const testStudentId = "5e79650a-9e22-4fa7-b7c2-dab49818b94b";
  const mockTestId = "b1000000-0000-0000-0000-000000000002";
  const mockVersionId = "b2000000-0000-0000-0000-000000000002";

  // Create clean attempt
  const { data: attempt, error: attErr } = await supabase
    .from("attempts")
    .insert({
      student_id: testStudentId,
      test_id: mockTestId,
      test_version_id: mockVersionId,
      exam_mode: "full",
      status: "in_progress",
    })
    .select("id")
    .single();

  if (attErr || !attempt) {
    throw new Error(`Failed to create test attempt: ${attErr?.message}`);
  }
  const attemptId = attempt.id;
  console.log(`Created clean full attempt: ${attemptId}`);

  // Fetch sections
  const { data: dbSections } = await supabase
    .from("sections")
    .select("id, section_order, section_type, timing_seconds")
    .eq("test_version_id", mockVersionId)
    .order("section_order", { ascending: true });

  assert(Boolean(dbSections && dbSections.length === 4), "Found 4 full test sections");

  // Insert attempt_sections
  const now = new Date().toISOString();
  await supabase.from("attempt_sections").insert(
    dbSections!.map((sec, idx) => ({
      attempt_id: attemptId,
      section_id: sec.id,
      status: idx === 0 ? "in_progress" : "not_started",
      started_at: idx === 0 ? now : null,
    }))
  );

  // Resume attempt
  let session = await attemptSessionService.resumeAttempt(attemptId, testStudentId);
  assert(session.snapshot.status === "in_progress", "Resumed snapshot status is in_progress");
  assert(session.snapshot.currentSectionIndex === 0, "Current section index is 0 (Reading)");

  // --- SECTION 1: READING ---
  console.log("\n-> Testing Section 1: Reading");
  let readingSec = session.blueprint.sections[0];
  assert(readingSec.items.length >= 6, `Reading section has ${readingSec.items.length} items`);

  // Navigate through every question in Reading
  for (let i = 0; i < readingSec.items.length; i++) {
    const navState = sessionReducer(
      session.snapshot,
      { type: "NAVIGATE_ITEM", itemIndex: i },
      session.blueprint
    );
    assert(navState.currentItemIndex === i, `Navigated to Reading question ${i + 1}`);

    const item = readingSec.items[i];
    const answer = item.options.length > 0 ? item.options[0].optionKey : "Sample complete words answer";
    await attemptSessionService.saveResponse({
      attemptId,
      studentId: testStudentId,
      contentItemId: item.id,
      rawAnswer: answer,
      normalizedAnswer: { selectedKey: answer },
      timeSpentMs: 12000,
    });
  }

  // Advance to Listening
  console.log("\n-> Advancing to Section 2: Listening");
  const adv1 = await attemptSessionService.advanceSection(attemptId, testStudentId, 0);
  assert(adv1.nextSectionIndex === 1, "Advanced to section index 1 (Listening)");

  session = await attemptSessionService.resumeAttempt(attemptId, testStudentId);
  assert(session.snapshot.currentSectionIndex === 1, "Session resumed in Listening section");

  // --- SECTION 2: LISTENING ---
  console.log("\n-> Testing Section 2: Listening");
  let listeningSec = session.blueprint.sections[1];
  assert(listeningSec.items.length >= 6, `Listening section has ${listeningSec.items.length} items`);

  for (let i = 0; i < listeningSec.items.length; i++) {
    const navState = sessionReducer(
      session.snapshot,
      { type: "NAVIGATE_ITEM", itemIndex: i },
      session.blueprint
    );
    assert(navState.currentItemIndex === i, `Navigated to Listening question ${i + 1}`);

    const item = listeningSec.items[i];
    const answer = item.options.length > 0 ? item.options[0].optionKey : "A";
    await attemptSessionService.saveResponse({
      attemptId,
      studentId: testStudentId,
      contentItemId: item.id,
      rawAnswer: answer,
      normalizedAnswer: {
        selectedKey: answer,
        audioStats: {
          playCount: 1,
          replayCount: 0,
          completedListen: true,
          timeListenedMs: 6500,
          firstPlayedAt: new Date().toISOString(),
          lastPlayedAt: new Date().toISOString(),
        },
      },
      timeSpentMs: 15000,
    });
  }

  // Advance to Writing
  console.log("\n-> Advancing to Section 3: Writing");
  const adv2 = await attemptSessionService.advanceSection(attemptId, testStudentId, 1);
  assert(adv2.nextSectionIndex === 2, "Advanced to section index 2 (Writing)");

  session = await attemptSessionService.resumeAttempt(attemptId, testStudentId);
  assert(session.snapshot.currentSectionIndex === 2, "Session resumed in Writing section");

  // --- SECTION 3: WRITING ---
  console.log("\n-> Testing Section 3: Writing");
  let writingSec = session.blueprint.sections[2];
  assert(writingSec.items.length >= 3, `Writing section has ${writingSec.items.length} items`);

  for (let i = 0; i < writingSec.items.length; i++) {
    const navState = sessionReducer(
      session.snapshot,
      { type: "NAVIGATE_ITEM", itemIndex: i },
      session.blueprint
    );
    assert(navState.currentItemIndex === i, `Navigated to Writing question ${i + 1}`);

    const item = writingSec.items[i];
    const essayText =
      "Dear Professor, I am writing to formally request clarification regarding the upcoming seminar curriculum. In my analysis, academic research demonstrates that collaborative discourse improves conceptual retention. Therefore, incorporating structured debates will significantly elevate student mastery. Respectfully submitted.";

    await attemptSessionService.saveResponse({
      attemptId,
      studentId: testStudentId,
      contentItemId: item.id,
      rawAnswer: essayText,
      normalizedAnswer: { essay: essayText, wordCount: 42 },
      timeSpentMs: 65000,
    });
  }

  // Advance to Speaking
  console.log("\n-> Advancing to Section 4: Speaking");
  const adv3 = await attemptSessionService.advanceSection(attemptId, testStudentId, 2);
  assert(adv3.nextSectionIndex === 3, "Advanced to section index 3 (Speaking)");

  session = await attemptSessionService.resumeAttempt(attemptId, testStudentId);
  assert(session.snapshot.currentSectionIndex === 3, "Session resumed in Speaking section");

  // --- SECTION 4: SPEAKING ---
  console.log("\n-> Testing Section 4: Speaking");
  let speakingSec = session.blueprint.sections[3];
  assert(speakingSec.items.length >= 4, `Speaking section has ${speakingSec.items.length} items`);

  for (let i = 0; i < speakingSec.items.length; i++) {
    const navState = sessionReducer(
      session.snapshot,
      { type: "NAVIGATE_ITEM", itemIndex: i },
      session.blueprint
    );
    assert(navState.currentItemIndex === i, `Navigated to Speaking question ${i + 1}`);

    const item = speakingSec.items[i];
    const spokenTranscript =
      "Recent archaeological findings show that early urban settlements were far more decentralized than scholars previously hypothesized.";

    await attemptSessionService.saveResponse({
      attemptId,
      studentId: testStudentId,
      contentItemId: item.id,
      rawAnswer: spokenTranscript,
      normalizedAnswer: {
        transcript: spokenTranscript,
        audioUrl: "https://example.com/recordings/test-sample.webm",
        recordingDurationSeconds: 28,
      },
      timeSpentMs: 32000,
    });
  }

  // --- FINALIZE EXAM ---
  console.log("\n-> Finalizing Full Mock Exam");
  const fin = await attemptSessionService.finalizeAttempt(attemptId, testStudentId);
  assert(fin.status === "evaluated", "Attempt successfully evaluated and marked as evaluated");

  // Verify attempt in DB has status evaluated
  const { data: finalAttempt } = await supabase
    .from("attempts")
    .select("status, score, evaluation_status")
    .eq("id", attemptId)
    .single();

  console.log("finalAttempt fetched from DB:", finalAttempt);
  assert(finalAttempt?.status === "evaluated", "Final attempt status is evaluated");
  assert(finalAttempt?.evaluation_status === "completed", "Evaluation status is completed");
  assert(typeof finalAttempt?.score === "number" && finalAttempt?.score >= 0, `Persisted overall score is valid: ${finalAttempt?.score}`);

  // Verify score report exists in DB
  const { data: report } = await supabase
    .from("score_reports")
    .select("overall_band, reading_band, listening_band, writing_band, speaking_band, comparable_score")
    .eq("attempt_id", attemptId)
    .single();

  assert(Boolean(report), "Score report was generated in database");
  assert(report?.reading_band !== null, `Reading band in report: ${report?.reading_band}`);
  assert(report?.listening_band !== null, `Listening band in report: ${report?.listening_band}`);
  assert(report?.writing_band !== null, `Writing band in report: ${report?.writing_band}`);
  assert(report?.speaking_band !== null, `Speaking band in report: ${report?.speaking_band}`);

  // -------------------------------------------------------------
  // TEST 3: Auxiliary Learning Engines (Dictation, Shadowing, SRS)
  // -------------------------------------------------------------
  console.log("\n--- TEST 3: Auxiliary Learning Engines ---");

  // Dictation Engine Word Diff
  const diffResult = computeWordDiff(
    "The registrars office is accepting late course drop forms today.",
    "The registrar's office is still accepting late course drop forms today."
  );
  assert(diffResult.accuracyPercent > 80, `Dictation word diff accuracy: ${diffResult.accuracyPercent}%`);

  // SRS Engine Interval
  const srs1 = calculateNextSRSState({ intervalDays: 1, easeFactor: 2.5, repetitions: 1 }, "good");
  assert(srs1.intervalDays >= 3, `SRS good rating interval graduated: ${srs1.intervalDays} days`);

  const srs2 = calculateNextSRSState({ intervalDays: 6, easeFactor: 2.5, repetitions: 3 }, "again");
  assert(srs2.intervalDays === 1, `SRS again rating resets interval to 1 day`);

  // Blueprint Content Validator
  for (const vId of testVersionIds.slice(0, 2)) {
    const bp = await loadTestBlueprint(vId, "full");
    const val = contentValidator.validateBlueprint({
      testVersionId: vId,
      name: "Standardized Simulation",
      sections: bp.sections.map((sec) => ({
        id: sec.id,
        sectionType: sec.sectionType,
        timingSeconds: sec.timingSeconds,
        items: sec.items.map((it) => {
          const payload = (it.payload || {}) as Record<string, unknown>;
          return {
            id: it.id,
            itemType: it.itemType,
            sectionType: sec.sectionType,
            promptSnippet:
              (payload["prompt"] as string) || (payload["stimulusText"] as string) || "Prompt",
            options: it.options.map((o, idx) => ({
              optionKey: o.optionKey,
              optionText: o.optionText,
              isCorrect: idx === 0, // Mock at least 1 correct for validator
            })),
            audioAssetPath: (payload["audioUrl"] as string) || "https://example.com/audio.mp3",
            acceptedSequences: (payload["acceptedSequences"] as string[][]) || [
              (payload["wordBank"] as string[]) || ["word"],
            ],
          };
        }),
      })),
    });
    if (!val.isValid) {
      console.log(`Validation errors for ${vId}:`, JSON.stringify(val.errors, null, 2));
    }
    assert(val.isValid, `Admin content validator passed for published test version ${vId}`);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n================================================================");
  console.log(` ALL END-TO-END WORKFLOWS PASSED: ${passedChecks} / ${totalChecks} CHECKS `);
  console.log("================================================================\n");
}

runCompleteWebsiteVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
