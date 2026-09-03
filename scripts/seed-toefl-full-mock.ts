/**
 * Admin Seed Script: Complete TOEFL 2026 Full Mock Test
 * Seeds all 4 sections in strict order (Reading -> Listening -> Writing -> Speaking) into a single master blueprint.
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

export async function seedFullToeflMock() {
  console.log("Seeding Complete TOEFL 2026 4-Section Full Mock Blueprint...");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "admin@midnight.academy")
    .maybeSingle();

  const ownerId = adminProfile?.id || "25a1547b-07ce-450d-a31b-eaebbdeefc6a";

  // 1. Create Top-level Test
  const testId = "f1000000-0000-0000-0000-000000000000";
  await supabase.from("tests").upsert(
    {
      id: testId,
      owner_id: ownerId,
      name: "TOEFL iBT 2026: Official Full Mock Test 1",
      category: "Full Mock",
      difficulty: "Medium",
      question_count: 8,
      seconds_per_question: 120,
      response_seconds: 60,
      status: "active",
      code: "TOEFL-MOCK-01",
      is_practice: true,
    },
    { onConflict: "id" },
  );

  // 2. Create Test Version
  const versionId = "f2000000-0000-0000-0000-000000000000";
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

  // 3. Create All 4 Sections in Sequence
  const secReadingId = "f3000000-0000-0000-0000-000000000010";
  const secListeningId = "f3000000-0000-0000-0000-000000000020";
  const secWritingId = "f3000000-0000-0000-0000-000000000030";
  const secSpeakingId = "f3000000-0000-0000-0000-000000000040";

  await supabase.from("sections").upsert([
    {
      id: secReadingId,
      test_version_id: versionId,
      section_type: "reading",
      section_order: 0,
      timing_seconds: 1800,
      instructions: "Reading Section: Read the academic passages and complete the cloze questions.",
    },
    {
      id: secListeningId,
      test_version_id: versionId,
      section_type: "listening",
      section_order: 1,
      timing_seconds: 1740,
      instructions: "Listening Section: Listen to academic lectures and campus conversations.",
    },
    {
      id: secWritingId,
      test_version_id: versionId,
      section_type: "writing",
      section_order: 2,
      timing_seconds: 1380,
      instructions:
        "Writing Section: Complete the sentence building, email, and academic discussion tasks.",
    },
    {
      id: secSpeakingId,
      test_version_id: versionId,
      section_type: "speaking",
      section_order: 3,
      timing_seconds: 480,
      instructions: "Speaking Section: Respond verbally to the prompt and repetition exercises.",
    },
  ]);

  // 4. Create Modules
  const modRId = "f4000000-0000-0000-0000-000000000101";
  const modLId = "f4000000-0000-0000-0000-000000000102";
  const modWId = "f4000000-0000-0000-0000-000000000103";
  const modSId = "f4000000-0000-0000-0000-000000000104";

  await supabase.from("modules").upsert([
    {
      id: modRId,
      section_id: secReadingId,
      stage_index: 1,
      difficulty_band: "middle",
      module_order: 0,
    },
    {
      id: modLId,
      section_id: secListeningId,
      stage_index: 1,
      difficulty_band: "middle",
      module_order: 0,
    },
    {
      id: modWId,
      section_id: secWritingId,
      stage_index: 1,
      difficulty_band: "middle",
      module_order: 0,
    },
    {
      id: modSId,
      section_id: secSpeakingId,
      stage_index: 1,
      difficulty_band: "middle",
      module_order: 0,
    },
  ]);

  // 5. Connect Content Items to the Mock Modules
  // Reading MCQ
  const mockItemR = "f5000000-0000-0000-0000-000000000101";
  await supabase.from("content_items").upsert({
    id: mockItemR,
    module_id: modRId,
    section_type: "reading",
    item_type: "read_academic",
    difficulty: "Medium",
    skill_tags: ["Inference", "Biology"],
    payload: {
      title: "Photosynthesis & Carbon Fixation",
      passage:
        "Plants convert sunlight into chemical energy through light-dependent reactions followed by the Calvin cycle.",
      prompt: "What is the primary function of the Calvin cycle in photosynthesis?",
    },
    item_order: 0,
  });

  await supabase.from("question_options").upsert([
    {
      content_item_id: mockItemR,
      option_key: "A",
      option_text: "Fix atmospheric carbon into glucose",
      is_correct: true,
      option_order: 0,
    },
    {
      content_item_id: mockItemR,
      option_key: "B",
      option_text: "Directly split water molecules",
      is_correct: false,
      distractor_rationale: "Water splitting occurs in light-dependent reactions.",
      option_order: 1,
    },
  ]);

  // Listening MCQ
  const mockItemL = "f5000000-0000-0000-0000-000000000102";
  await supabase.from("content_items").upsert({
    id: mockItemL,
    module_id: modLId,
    section_type: "listening",
    item_type: "listen_academic_talk",
    difficulty: "Medium",
    skill_tags: ["Listening", "Main Idea"],
    payload: {
      title: "Ocean Currents & Climate",
      audioUrl: "https://actions.google.com/sounds/v1/science/radiation_monitor.ogg",
      prompt: "According to the talk, what powers the global ocean conveyor belt?",
    },
    item_order: 0,
  });

  await supabase.from("question_options").upsert([
    {
      content_item_id: mockItemL,
      option_key: "A",
      option_text: "Thermohaline density differences driven by temperature and salinity",
      is_correct: true,
      option_order: 0,
    },
    {
      content_item_id: mockItemL,
      option_key: "B",
      option_text: "Lunar gravitational tides only",
      is_correct: false,
      distractor_rationale: "Tides cause local oscillations, not global conveyor circulation.",
      option_order: 1,
    },
  ]);

  // Writing Email
  const mockItemW = "f5000000-0000-0000-0000-000000000103";
  await supabase.from("content_items").upsert({
    id: mockItemW,
    module_id: modWId,
    section_type: "writing",
    item_type: "write_email",
    difficulty: "Medium",
    skill_tags: ["Email Writing", "Pragmatics"],
    payload: {
      title: "Email to Residence Hall Director",
      recipient: "Director of Student Housing",
      context:
        "You are requesting a room change due to severe noise disruptions during your study hours.",
      prompt:
        "Write an email politely explaining the noise issue and requesting a transfer to a quiet-study floor.",
      modelAnswer:
        "Dear Director of Student Housing,\n\nI am writing to respectfully request a room reassignment...",
    },
    item_order: 0,
  });

  // Speaking Interview
  const mockItemS = "f5000000-0000-0000-0000-000000000104";
  await supabase.from("content_items").upsert({
    id: mockItemS,
    module_id: modSId,
    section_type: "speaking",
    item_type: "take_interview",
    difficulty: "Medium",
    skill_tags: ["Spoken Argumentation"],
    payload: {
      prompt:
        "Do you prefer studying alone or in study groups? Explain your reasons with specific examples.",
      preparationSeconds: 15,
      responseLimitSeconds: 45,
      modelAnswer:
        "I strongly prefer studying in groups because collaborative problem solving improves retention...",
    },
    item_order: 0,
  });

  console.log("Successfully seeded Complete TOEFL 2026 4-Section Full Mock Blueprint!");
}

if (process.argv[1]?.includes("seed-toefl-full-mock")) {
  seedFullToeflMock().catch(console.error);
}
