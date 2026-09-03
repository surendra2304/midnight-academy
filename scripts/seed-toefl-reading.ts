/**
 * Admin Seed Script: TOEFL 2026 Original Reading Item Bank
 * Creates structured original reading passages, items across Lower & Upper difficulty bands, options, and distractor rationales.
 */

import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

export async function seedToeflReadingBank() {
  console.log("Seeding TOEFL 2026 Reading item bank...");

  // 1. Get an admin / instructor profile ID as owner
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "admin@midnight.academy")
    .maybeSingle();

  const ownerId = adminProfile?.id || "25a1547b-07ce-450d-a31b-eaebbdeefc6a";

  // 2. Create Top-level Test
  const testId = "f1000000-0000-0000-0000-000000000001";
  await supabase.from("tests").upsert(
    {
      id: testId,
      owner_id: ownerId,
      name: "TOEFL iBT 2026: Reading Section Test 1",
      category: "Reading",
      difficulty: "Medium",
      question_count: 6,
      seconds_per_question: 60,
      response_seconds: 60,
      status: "active",
      code: "TOEFL-RD-01",
      is_practice: true,
    },
    { onConflict: "id" },
  );

  // 3. Create Test Version
  const versionId = "f2000000-0000-0000-0000-000000000001";
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

  // 4. Create Reading Section (30 mins = 1800s)
  const sectionId = "f3000000-0000-0000-0000-000000000001";
  await supabase.from("sections").upsert(
    {
      id: sectionId,
      test_version_id: versionId,
      section_type: "reading",
      section_order: 0,
      timing_seconds: 1800,
      instructions:
        "The Reading section measures your ability to understand academic and practical English texts.",
    },
    { onConflict: "id" },
  );

  // 5. Create Modules: Stage 1 (Initial), Stage 2 Upper, Stage 2 Lower
  const stage1ModuleId = "f4000000-0000-0000-0000-000000000001";
  const stage2UpperModuleId = "f4000000-0000-0000-0000-000000000002";
  const stage2LowerModuleId = "f4000000-0000-0000-0000-000000000003";

  await supabase.from("modules").upsert([
    {
      id: stage1ModuleId,
      section_id: sectionId,
      stage_index: 1,
      difficulty_band: "middle",
      routing_rule: {
        thresholds: { upperMinScorePercent: 70, lowerMaxScorePercent: 50 },
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

  // 6. Content Items & Options
  // Item 1: Complete the Words (Stage 1)
  const item1Id = "f5000000-0000-0000-0000-000000000001";
  await supabase.from("content_items").upsert({
    id: item1Id,
    module_id: stage1ModuleId,
    section_type: "reading",
    item_type: "complete_words",
    difficulty: "Easy",
    skill_tags: ["Vocabulary", "Cloze Context"],
    payload: {
      passage:
        "Urban gardens provide [0] fresh produce and foster community cooperation. Residents can [1] their own vegetables while learning sustainable agricultural practices.",
      blanks: [
        { blankIndex: 0, hint: "adjective (e.g. abundant)" },
        { blankIndex: 1, hint: "verb (e.g. grow)" },
      ],
    },
    item_order: 0,
  });

  // Item 2: Read in Daily Life (Stage 1)
  const item2Id = "f5000000-0000-0000-0000-000000000002";
  await supabase.from("content_items").upsert({
    id: item2Id,
    module_id: stage1ModuleId,
    section_type: "reading",
    item_type: "read_daily_life",
    difficulty: "Easy",
    skill_tags: ["Factual Information", "Daily Life"],
    payload: {
      title: "Campus Transit Schedule Update",
      passage:
        "Starting October 1st, the campus shuttle will operate every 15 minutes during peak hours (7:30 AM - 10:00 AM) and every 30 minutes during off-peak times. Students must tap their active university ID cards upon boarding. Weekend service remains suspended until further notice.",
      prompt: "According to the notice, what is required of students boarding the shuttle?",
    },
    item_order: 1,
  });

  // Options for Item 2
  await supabase.from("question_options").upsert([
    {
      content_item_id: item2Id,
      option_key: "A",
      option_text: "Pay a cash fare to the driver",
      is_correct: false,
      distractor_rationale: "The text states students must tap their ID card, not pay cash.",
      option_order: 0,
    },
    {
      content_item_id: item2Id,
      option_key: "B",
      option_text: "Tap their active university ID card",
      is_correct: true,
      distractor_rationale: null,
      option_order: 1,
    },
    {
      content_item_id: item2Id,
      option_key: "C",
      option_text: "Reserve a seat 24 hours in advance",
      is_correct: false,
      distractor_rationale: "No reservation system is mentioned.",
      option_order: 2,
    },
    {
      content_item_id: item2Id,
      option_key: "D",
      option_text: "Wear an official transit badge",
      is_correct: false,
      distractor_rationale: "Transit badges are not referenced in the policy.",
      option_order: 3,
    },
  ]);

  // Item 3: Read an Academic Passage (Stage 1)
  const item3Id = "f5000000-0000-0000-0000-000000000003";
  await supabase.from("content_items").upsert({
    id: item3Id,
    module_id: stage1ModuleId,
    section_type: "reading",
    item_type: "read_academic",
    difficulty: "Medium",
    skill_tags: ["Inference", "Academic Biology"],
    payload: {
      title: "Symbiotic Relationships in Coral Reefs",
      passage:
        "Coral reefs rely on an obligate mutualistic relationship between scleractinian corals and photosynthetic dinoflagellates known as zooxanthellae. In exchange for shelter and metabolic byproducts like carbon dioxide and nitrogen, these algae supply up to 90% of the coral host's nutritional requirements through photosynthesis. However, elevated sea temperatures induce thermal stress, causing the coral host to expel the symbionts—a phenomenon known as coral bleaching.",
      prompt: "What primarily triggers the expulsion of zooxanthellae from the coral host?",
    },
    item_order: 2,
  });

  // Options for Item 3
  await supabase.from("question_options").upsert([
    {
      content_item_id: item3Id,
      option_key: "A",
      option_text: "Depletion of nitrogen and carbon dioxide by the host",
      is_correct: false,
      distractor_rationale:
        "Corals provide these byproducts; their depletion is not cited as the expulsion trigger.",
      option_order: 0,
    },
    {
      content_item_id: item3Id,
      option_key: "B",
      option_text: "Excessive algae population overwhelming the coral",
      is_correct: false,
      distractor_rationale: "Algae overpopulation is not the cause described in the text.",
      option_order: 1,
    },
    {
      content_item_id: item3Id,
      option_key: "C",
      option_text: "Elevated sea temperatures causing thermal stress",
      is_correct: true,
      distractor_rationale: null,
      option_order: 2,
    },
    {
      content_item_id: item3Id,
      option_key: "D",
      option_text: "Physical wave disturbance along shallow reefs",
      is_correct: false,
      distractor_rationale: "Wave disturbance is not mentioned.",
      option_order: 3,
    },
  ]);

  console.log("Successfully seeded original TOEFL 2026 Reading Item Bank!");
}

if (process.argv[1]?.includes("seed-toefl-reading")) {
  seedToeflReadingBank().catch(console.error);
}
