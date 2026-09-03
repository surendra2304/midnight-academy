/**
 * Admin Seed Script: TOEFL 2026 Original Listening Item Bank
 * Seeds audio tracks, spoken transcripts, modules across difficulty bands, options, and distractor rationales.
 */

import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

export async function seedToeflListeningBank() {
  console.log("Seeding TOEFL 2026 Listening item bank...");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "admin@midnight.academy")
    .maybeSingle();

  const ownerId = adminProfile?.id || "25a1547b-07ce-450d-a31b-eaebbdeefc6a";

  // 1. Create Top-level Test
  const testId = "f1000000-0000-0000-0000-000000000002";
  await supabase.from("tests").upsert(
    {
      id: testId,
      owner_id: ownerId,
      name: "TOEFL iBT 2026: Listening Section Test 1",
      category: "Listening",
      difficulty: "Medium",
      question_count: 4,
      seconds_per_question: 60,
      response_seconds: 60,
      status: "active",
      code: "TOEFL-LS-01",
      is_practice: true,
    },
    { onConflict: "id" },
  );

  // 2. Create Test Version
  const versionId = "f2000000-0000-0000-0000-000000000002";
  await supabase.from("test_versions").upsert(
    {
      id: versionId,
      test_id: testId,
      blueprint_version: "2026.1",
      scoring_version: "2026.1",
      status: "published",
      published_at: new Date().toISOString(),
      created_by: ownerId,
    },
    { onConflict: "id" },
  );

  // 3. Create Listening Section (29 mins = 1740s)
  const sectionId = "f3000000-0000-0000-0000-000000000002";
  await supabase.from("sections").upsert(
    {
      id: sectionId,
      test_version_id: versionId,
      section_type: "listening",
      section_order: 0,
      timing_seconds: 1740,
      instructions:
        "The Listening section measures your ability to understand spoken English in academic and campus contexts.",
    },
    { onConflict: "id" },
  );

  // 4. Create Modules: Stage 1, Stage 2 Upper, Stage 2 Lower
  const stage1ModuleId = "f4000000-0000-0000-0000-000000000011";
  const stage2UpperModuleId = "f4000000-0000-0000-0000-000000000012";
  const stage2LowerModuleId = "f4000000-0000-0000-0000-000000000013";

  await supabase.from("modules").upsert([
    {
      id: stage1ModuleId,
      section_id: sectionId,
      stage_index: 1,
      difficulty_band: "middle",
      routing_rule: {
        thresholds: { upperMinScorePercent: 75, lowerMaxScorePercent: 50 },
        targetModules: { upperModuleId: stage2UpperModuleId, lowerModuleId: stage2LowerModuleId },
      },
      module_order: 0,
    },
    {
      id: stage2UpperModuleId,
      section_id: sectionId,
      stage_index: 2,
      difficulty_band: "upper",
      routing_rule: {},
      module_order: 1,
    },
    {
      id: stage2LowerModuleId,
      section_id: sectionId,
      stage_index: 2,
      difficulty_band: "lower",
      routing_rule: {},
      module_order: 2,
    },
  ]);

  // 5. Content Items & Options

  // Item 1: Listen and Choose a Response
  const item1Id = "f5000000-0000-0000-0000-000000000011";
  const audioSample1 = "https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg";

  await supabase.from("content_items").upsert({
    id: item1Id,
    module_id: stage1ModuleId,
    section_type: "listening",
    item_type: "listen_choose_response",
    difficulty: "Easy",
    skill_tags: ["Pragmatic Understanding", "Campus Interaction"],
    payload: {
      title: "Lab Registration Inquiry",
      audioUrl: audioSample1,
      prompt: "What is the speaker most likely asking the listener to do?",
    },
    item_order: 0,
  });

  await supabase.from("content_assets").upsert({
    content_item_id: item1Id,
    asset_type: "audio",
    storage_path: audioSample1,
    mime_type: "audio/ogg",
    duration_ms: 12000,
    metadata: {
      transcript:
        "Speaker A: Excuse me, professor! Are there still open spots for the Tuesday evening chemistry lab, or has registration already closed for the term?",
    },
  });

  await supabase.from("question_options").upsert([
    {
      content_item_id: item1Id,
      option_key: "A",
      option_text: "Clarify whether enrollment is still open for a specific lab section",
      is_correct: true,
      distractor_rationale: null,
      option_order: 0,
    },
    {
      content_item_id: item1Id,
      option_key: "B",
      option_text: "Request an extension on a chemistry assignment",
      is_correct: false,
      distractor_rationale:
        "The speaker is asking about registration availability, not an assignment extension.",
      option_order: 1,
    },
    {
      content_item_id: item1Id,
      option_key: "C",
      option_text: "Inquire about changing their academic major",
      is_correct: false,
      distractor_rationale: "No academic major change is mentioned.",
      option_order: 2,
    },
    {
      content_item_id: item1Id,
      option_key: "D",
      option_text: "Submit a grade appeal for a previous exam",
      is_correct: false,
      distractor_rationale: "Grade appeals are not discussed.",
      option_order: 3,
    },
  ]);

  // Item 2: Listen to an Academic Talk
  const item2Id = "f5000000-0000-0000-0000-000000000012";
  const audioSample2 = "https://actions.google.com/sounds/v1/science/radiation_monitor.ogg";

  await supabase.from("content_items").upsert({
    id: item2Id,
    module_id: stage1ModuleId,
    section_type: "listening",
    item_type: "listen_academic_talk",
    difficulty: "Medium",
    skill_tags: ["Main Idea", "Academic Geology"],
    payload: {
      title: "Geothermal Energy Extraction Methods",
      audioUrl: audioSample2,
      prompt:
        "According to the lecture, what is one major limitation of enhanced geothermal systems (EGS)?",
    },
    item_order: 1,
  });

  await supabase.from("content_assets").upsert({
    content_item_id: item2Id,
    asset_type: "audio",
    storage_path: audioSample2,
    mime_type: "audio/ogg",
    duration_ms: 28000,
    metadata: {
      transcript:
        "Professor: While conventional geothermal plants require natural underground aquifers, Enhanced Geothermal Systems—or EGS—inject pressurized fluid to fracture impermeable hot rock. While this vastly expands suitable geographic locations, the high pressures involved can occasionally induce minor micro-seismic activity, which remains a primary engineering and public concern.",
    },
  });

  await supabase.from("question_options").upsert([
    {
      content_item_id: item2Id,
      option_key: "A",
      option_text: "They can only function near active coastal volcanic vents",
      is_correct: false,
      distractor_rationale:
        "EGS actually expands locations beyond natural hydrothermal reservoirs.",
      option_order: 0,
    },
    {
      content_item_id: item2Id,
      option_key: "B",
      option_text: "High-pressure fluid injection can induce micro-seismic activity",
      is_correct: true,
      distractor_rationale: null,
      option_order: 1,
    },
    {
      content_item_id: item2Id,
      option_key: "C",
      option_text: "They emit large quantities of atmospheric carbon dioxide",
      is_correct: false,
      distractor_rationale: "Geothermal systems produce minimal greenhouse gas emissions.",
      option_order: 2,
    },
    {
      content_item_id: item2Id,
      option_key: "D",
      option_text: "Water cannot be recycled through the subterranean fracture loop",
      is_correct: false,
      distractor_rationale: "Fluid is continually circulated in closed loops.",
      option_order: 3,
    },
  ]);

  console.log("Successfully seeded original TOEFL 2026 Listening Item Bank!");
}

if (process.argv[1]?.includes("seed-toefl-listening")) {
  seedToeflListeningBank().catch(console.error);
}
