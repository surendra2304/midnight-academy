/**
 * Autonomous Moon | Full Test Runner & Live Evaluation Verification
 * Simulates an actual student taking the complete "Moon | Full Test" (f2000000-0000-0000-0000-000000000000)
 * from start to finish against real Supabase PostgreSQL and real Gemini AI evaluation.
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

async function runAutonomousMoonExam() {
  console.log("========================================================================");
  console.log("     MIDNIGHT ACADEMY: AUTONOMOUS FULL TEST RUNNER (MOON FULL TEST)     ");
  console.log("========================================================================\n");

  // 1. Resolve Student User (surendrabtech12321@gmail.com or first profile)
  console.log("Step 1: Resolving student account...");
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .order("created_at", { ascending: true })
    .limit(5);

  if (pErr || !profiles || profiles.length === 0) {
    throw new Error(`Failed to resolve student profile: ${pErr?.message}`);
  }

  const student = profiles.find((p) => p.email?.includes("surendra")) || profiles[0];
  console.log(`-> Taking exam as Student: ${student.full_name || "Surendra"} (${student.email}) [ID: ${student.id}]\n`);

  // 2. Verify Blueprint
  console.log("Step 2: Loading 'Moon | Full Test' Blueprint...");
  const blueprint = await loadTestBlueprint(MOON_VERSION_ID, "full");
  console.log(`-> Blueprint Loaded: '${blueprint.name}' | Sections: ${blueprint.sections.length} | Mode: ${blueprint.examMode}`);
  
  for (const sec of blueprint.sections) {
    console.log(`   - Section ${sec.sectionOrder}: ${sec.sectionType.toUpperCase()} (${sec.items.length} questions, ${Math.round(sec.timingSeconds / 60)} mins)`);
  }

  // 3. Initialize Live Attempt in PostgreSQL
  console.log("\nStep 3: Initializing live exam attempt session...");
  const session = await attemptSessionService.startAttempt({
    testVersionId: MOON_VERSION_ID,
    studentId: student.id,
    examMode: "full",
    allowRetake: true,
  });

  const attemptId = session.snapshot.attemptId;
  console.log(`-> Live Attempt Initialized in PostgreSQL! Attempt ID: ${attemptId}`);
  console.log(`-> Snapshot Status: ${session.snapshot.status} | Section Index: ${session.snapshot.currentSectionIndex}\n`);

  // 4. SECTION 1: READING
  console.log("========================================================================");
  console.log("                   SECTION 1: READING (TAKING TEST)                     ");
  console.log("========================================================================");
  const readingSec = blueprint.sections[0];

  for (let i = 0; i < readingSec.items.length; i++) {
    const item = readingSec.items[i];
    const payload = item.payload as Record<string, unknown>;
    const title = (payload.title as string) || "Reading Item";
    const prompt = (payload.prompt as string) || "Choose the best answer";

    console.log(`\n[Reading Q${i + 1}/${readingSec.items.length}] ${title}: "${prompt.slice(0, 60)}..."`);

    let rawAnswer = "A";
    let normalizedAnswer: Record<string, unknown> = {};

    if (item.options.length > 0) {
      // Pick the correct option or first option
      const correctOpt = item.options.find((o) => (o as any).isCorrect) || item.options[0];
      rawAnswer = correctOpt.optionKey;
      normalizedAnswer = { selectedKey: correctOpt.optionKey };
      console.log(`   -> Selected Answer: [${correctOpt.optionKey}] ${correctOpt.optionText}`);
    } else if (item.itemType === "complete_words") {
      const tokens = (payload.correctTokens as string[]) || ["eld", "ining", "ains", "nisms", "n", "o", "ow", "fe", "lved", "pted"];
      rawAnswer = JSON.stringify(tokens);
      normalizedAnswer = { tokens, blanks: tokens };
      console.log(`   -> Filled Authentic Cloze Tokens: ${rawAnswer}`);
    }

    await attemptSessionService.saveResponse({
      attemptId,
      studentId: student.id,
      contentItemId: item.id,
      rawAnswer,
      normalizedAnswer,
      timeSpentMs: 14000,
    });
    console.log("   -> Response persisted to Supabase attempt_responses ✓");
  }

  // Advance to Listening
  console.log("\n-> Advancing from Reading to Listening...");
  const advToListening = await attemptSessionService.advanceSection(attemptId, student.id, 0);
  console.log(`-> Advanced! Current Section Index: ${advToListening.nextSectionIndex} (Listening) ✓`);

  // 5. SECTION 2: LISTENING
  console.log("\n========================================================================");
  console.log("                  SECTION 2: LISTENING (TAKING TEST)                    ");
  console.log("========================================================================");
  const listeningSec = blueprint.sections[1];

  for (let i = 0; i < listeningSec.items.length; i++) {
    const item = listeningSec.items[i];
    const payload = item.payload as Record<string, unknown>;
    const prompt = (payload.prompt as string) || (payload.title as string) || "Listen carefully";

    console.log(`\n[Listening Q${i + 1}/${listeningSec.items.length}] "${prompt.slice(0, 60)}..."`);

    let rawAnswer = "A";
    let normalizedAnswer: Record<string, unknown> = {};

    if (item.options.length > 0) {
      const correctOpt = item.options.find((o) => (o as any).isCorrect) || item.options[0];
      rawAnswer = correctOpt.optionKey;
      normalizedAnswer = {
        selectedKey: correctOpt.optionKey,
        audioStats: {
          playCount: 1,
          replayCount: 0,
          completedListen: true,
          timeListenedMs: 8500,
          firstPlayedAt: new Date().toISOString(),
          lastPlayedAt: new Date().toISOString(),
        },
      };
      console.log(`   -> Selected Answer: [${correctOpt.optionKey}] ${correctOpt.optionText}`);
    }

    await attemptSessionService.saveResponse({
      attemptId,
      studentId: student.id,
      contentItemId: item.id,
      rawAnswer,
      normalizedAnswer,
      timeSpentMs: 16000,
    });
    console.log("   -> Response & audio listening stats persisted to Supabase ✓");
  }

  // Advance to Writing
  console.log("\n-> Advancing from Listening to Writing...");
  const advToWriting = await attemptSessionService.advanceSection(attemptId, student.id, 1);
  console.log(`-> Advanced! Current Section Index: ${advToWriting.nextSectionIndex} (Writing) ✓`);

  // 6. SECTION 3: WRITING
  console.log("\n========================================================================");
  console.log("                   SECTION 3: WRITING (TAKING TEST)                     ");
  console.log("========================================================================");
  const writingSec = blueprint.sections[2];

  for (let i = 0; i < writingSec.items.length; i++) {
    const item = writingSec.items[i];
    const payload = item.payload as Record<string, unknown>;
    const title = (payload.title as string) || "Writing Task";

    console.log(`\n[Writing Q${i + 1}/${writingSec.items.length}] ${title} (${item.itemType})`);

    let essayText = "";
    let rawAnswer = "";
    let normalizedAnswer: Record<string, unknown> = {};

    if (item.itemType === "build_sentence") {
      const target = (payload.targetSentence as string) || "Unfortunately, I did not meet the deadline.";
      const prefix = (payload.sentencePrefix as string) || "";
      const remainder = target.replace(prefix, "").replace(/[.]+$/, "").trim();
      const words = remainder.split(/\s+/).filter(Boolean);
      rawAnswer = JSON.stringify(words);
      essayText = target;
      normalizedAnswer = { words, assembledSentence: target };
      console.log(`   -> Built Authentic Sentence: ${target}`);
    } else if (item.itemType === "write_email") {
      essayText =
        (payload.modelAnswer as string) ||
        "Dear Jake,\n\nI hope you are doing well. I am writing regarding our group project, which is critical for our final grade. You have missed several project meetings and your section remains unfinished. This has placed unexpected burdens on the rest of the team. Please attend our upcoming coordination call and complete your allocated research so we can submit on schedule.\n\nBest regards,\nSurendra";
      rawAnswer = essayText;
      normalizedAnswer = { essay: essayText, wordCount: essayText.trim().split(/\s+/).length };
      console.log(`   -> Authored Email Response:\n   "${essayText.slice(0, 100)}..."`);
    } else {
      essayText =
        "In response to the discussion on social mobility, I strongly agree with Kelly that educational access and merit-based career opportunities are fundamental pillars for upward mobility in contemporary societies. While socioeconomic background presents initial hurdles, systemic investments in public universities, need-based scholarships, and equitable hiring practices empower diligent individuals to overcome generational disadvantages. By providing equal educational opportunities, societies ensure talent and determination dictate life outcomes rather than inherited wealth.";
      rawAnswer = essayText;
      normalizedAnswer = { essay: essayText, wordCount: essayText.trim().split(/\s+/).length };
      console.log(`   -> Authored Academic Discussion Response:\n   "${essayText.slice(0, 100)}..."`);
    }

    await attemptSessionService.saveResponse({
      attemptId,
      studentId: student.id,
      contentItemId: item.id,
      rawAnswer,
      normalizedAnswer,
      timeSpentMs: 60000,
    });
    console.log("   -> Writing response persisted to Supabase ✓");
  }

  // Advance to Speaking
  console.log("\n-> Advancing from Writing to Speaking...");
  const advToSpeaking = await attemptSessionService.advanceSection(attemptId, student.id, 2);
  console.log(`-> Advanced! Current Section Index: ${advToSpeaking.nextSectionIndex} (Speaking) ✓`);

  // 7. SECTION 4: SPEAKING
  console.log("\n========================================================================");
  console.log("                  SECTION 4: SPEAKING (TAKING TEST)                     ");
  console.log("========================================================================");
  const speakingSec = blueprint.sections[3];

  for (let i = 0; i < speakingSec.items.length; i++) {
    const item = speakingSec.items[i];
    const payload = item.payload as Record<string, unknown>;
    const title = (payload.title as string) || "Speaking Task";

    console.log(`\n[Speaking Q${i + 1}/${speakingSec.items.length}] ${title} (${item.itemType})`);

    let spokenTranscript = "";
    if (item.itemType === "listen_repeat") {
      spokenTranscript =
        "You are training to assist visitors to a natural history museum. The museum exhibits are arranged chronologically to showcase prehistoric eras.";
    } else {
      // Restaurant interview
      spokenTranscript =
        "In my weekly routine, I dine at local restaurants approximately twice a week, usually during weekends with university colleagues. When selecting a dining venue, I prioritize nutritional ingredient quality, prompt service, and an atmosphere conducive to meaningful academic conversation. I believe communal dining strengthens social bonds while providing necessary relaxation outside rigorous study schedules.";
    }

    console.log(`   -> Recorded Spoken Audio Transcript:\n   "${spokenTranscript}"`);

    await attemptSessionService.saveResponse({
      attemptId,
      studentId: student.id,
      contentItemId: item.id,
      rawAnswer: spokenTranscript,
      normalizedAnswer: {
        transcript: spokenTranscript,
        audioUrl: "https://actions.google.com/sounds/v1/speech/human_voice_sample.mp3",
        recordingDurationSeconds: 32,
      },
      timeSpentMs: 45000,
    });
    console.log("   -> Spoken audio recording & transcript persisted to Supabase ✓");
  }

  // 8. FINALIZE & TRIGGER REAL AI EVALUATION (GEMINI)
  console.log("\n========================================================================");
  console.log("        STEP 8: SUBMITTING EXAM & RUNNING GEMINI AI SCORING PIPELINE    ");
  console.log("========================================================================");
  console.log("-> Calling finalizeAttempt (evaluating Reading, Listening, Writing, Speaking)...");
  
  const startTime = Date.now();
  const finalized = await attemptSessionService.finalizeAttempt(attemptId, student.id);
  const evalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`-> AI Evaluation Pipeline Finished in ${evalDuration}s! Final Status: ${finalized.status} ✓\n`);

  // 9. FETCH & DISPLAY FINAL SCORE REPORT FROM DATABASE
  console.log("========================================================================");
  console.log("                    OFFICIAL SCORE REPORT IN SUPABASE                   ");
  console.log("========================================================================");

  const { data: dbAttempt, error: aErr } = await supabase
    .from("attempts")
    .select("id, status, score, evaluation_status, completed_at")
    .eq("id", attemptId)
    .single();

  if (aErr || !dbAttempt) {
    throw new Error(`Failed to fetch completed attempt: ${aErr?.message}`);
  }

  const { data: report, error: rErr } = await supabase
    .from("score_reports")
    .select("overall_band, reading_band, listening_band, writing_band, speaking_band, comparable_score, summary")
    .eq("attempt_id", attemptId)
    .single();

  if (rErr || !report) {
    throw new Error(`Failed to fetch score report: ${rErr?.message}`);
  }

  console.log(`Student:         ${student.full_name || "Surendra"} (${student.email})`);
  console.log(`Test:            Moon | Full Test (${MOON_VERSION_ID})`);
  console.log(`Attempt ID:      ${attemptId}`);
  console.log(`Completed At:    ${dbAttempt.completed_at}`);
  console.log(`Status:          ${dbAttempt.status.toUpperCase()} (Evaluation: ${dbAttempt.evaluation_status})`);
  console.log("------------------------------------------------------------------------");
  console.log(`OVERALL BAND:    ${report.overall_band.toFixed(1)} / 6.0  (Equivalent: ${report.comparable_score}/120)`);
  console.log(`  - Reading:     ${report.reading_band.toFixed(1)} / 6.0`);
  console.log(`  - Listening:   ${report.listening_band.toFixed(1)} / 6.0`);
  console.log(`  - Writing:     ${report.writing_band.toFixed(1)} / 6.0`);
  console.log(`  - Speaking:    ${report.speaking_band.toFixed(1)} / 6.0`);
  console.log("------------------------------------------------------------------------");
  console.log(`AI Summary:      ${report.summary || "Complete adaptive assessment with multi-trait AI grading."}`);
  console.log(`URL:             /result/${attemptId}`);
  console.log("========================================================================\n");

  console.log("🎉 SUCCESS: All 4 sections completed and verified with real database persistence and AI evaluation!");
}

runAutonomousMoonExam().catch((err) => {
  console.error("❌ Autonomous exam failure:", err);
  process.exit(1);
});
