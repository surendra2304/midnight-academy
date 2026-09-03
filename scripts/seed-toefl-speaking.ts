/**
 * Admin Seed Script: TOEFL 2026 Original Speaking Item Bank & Rubrics
 * Seeds Listen and Repeat and Take an Interview tasks with audio assets and versioned rubrics.
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

export async function seedToeflSpeakingBank() {
  console.log("Seeding TOEFL 2026 Speaking item bank and rubrics...");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "admin@midnight.academy")
    .maybeSingle();

  const ownerId = adminProfile?.id || "25a1547b-07ce-450d-a31b-eaebbdeefc6a";

  // 1. Create Top-level Test
  const testId = "f1000000-0000-0000-0000-000000000004";
  await supabase.from("tests").upsert(
    {
      id: testId,
      owner_id: ownerId,
      name: "TOEFL iBT 2026: Speaking Section Test 1",
      category: "Speaking",
      difficulty: "Medium",
      question_count: 2,
      seconds_per_question: 120,
      response_seconds: 60,
      status: "active",
      code: "TOEFL-SP-01",
      is_practice: true,
    },
    { onConflict: "id" },
  );

  // 2. Create Test Version
  const versionId = "f2000000-0000-0000-0000-000000000004";
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

  // 3. Create Speaking Section (8 mins = 480s)
  const sectionId = "f3000000-0000-0000-0000-000000000004";
  await supabase.from("sections").upsert(
    {
      id: sectionId,
      test_version_id: versionId,
      section_type: "speaking",
      section_order: 0,
      timing_seconds: 480,
      instructions:
        "The Speaking section measures your ability to speak English effectively in academic and interview settings.",
    },
    { onConflict: "id" },
  );

  // 4. Create Module
  const moduleId = "f4000000-0000-0000-0000-000000000031";
  await supabase.from("modules").upsert({
    id: moduleId,
    section_id: sectionId,
    stage_index: 1,
    difficulty_band: "middle",
    routing_rule: {},
    module_order: 0,
  });

  // 5. Create Speaking Rubric
  await supabase.from("rubrics").upsert({
    id: "f6000000-0000-0000-0000-000000000003",
    rubric_version: "2026.1",
    task_type: "take_interview",
    title: "TOEFL 2026 Spoken Interview Rubric",
    traits: [
      {
        name: "task_fulfillment",
        weight: 0.25,
        description: "Directly addresses prompt with sufficient elaboration",
        maxScore: 6.0,
      },
      {
        name: "organization",
        weight: 0.2,
        description: "Coherent progression of ideas and clear transitions",
        maxScore: 6.0,
      },
      {
        name: "language_use",
        weight: 0.2,
        description: "Grammar control, syntactic complexity, vocabulary precision",
        maxScore: 6.0,
      },
      {
        name: "delivery",
        weight: 0.2,
        description: "Pacing, fluency, minimal unnatural pauses",
        maxScore: 6.0,
      },
      {
        name: "pronunciation",
        weight: 0.15,
        description: "Phonetic intelligibility and natural intonation",
        maxScore: 6.0,
      },
    ],
    band_descriptors: {
      "6.0":
        "Highly intelligible speech with natural pacing, sophisticated vocabulary, and well-developed supporting arguments.",
      "5.0":
        "Clear and fluent response with minor pauses or pronunciation lapses that do not hinder comprehension.",
      "4.0":
        "Generally understandable speech with noticeable hesitation and basic grammar structures.",
      "3.0": "Limited fluency with frequent pauses and fragmented sentence structures.",
      "2.0": "Very difficult to understand with pervasive phonological and grammatical errors.",
      "1.0": "No speech or completely unintelligible audio.",
    },
  });

  // 6. Content Items

  // Item 1: Listen and Repeat
  const item1Id = "f5000000-0000-0000-0000-000000000031";
  const audioSample = "https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg";

  await supabase.from("content_items").upsert({
    id: item1Id,
    module_id: moduleId,
    section_type: "speaking",
    item_type: "listen_repeat",
    difficulty: "Easy",
    skill_tags: ["Pronunciation", "Phonetics", "Intonation"],
    payload: {
      prompt:
        "Listen to the sentence spoken by the narrator, then repeat it as clearly and accurately as possible.",
      audioUrl: audioSample,
      targetSentence:
        "Renewable energy projects require significant initial capital investment but yield long-term environmental dividends.",
      modelAnswer:
        "Renewable energy projects require significant initial capital investment but yield long-term environmental dividends.",
    },
    item_order: 0,
  });

  // Item 2: Take an Interview
  const item2Id = "f5000000-0000-0000-0000-000000000032";
  await supabase.from("content_items").upsert({
    id: item2Id,
    module_id: moduleId,
    section_type: "speaking",
    item_type: "take_interview",
    difficulty: "Medium",
    skill_tags: ["Oral Communication", "Spoken Argumentation", "Interview"],
    payload: {
      prompt:
        "Some universities require all first-year undergraduate students to live in campus dormitories, while others allow students to live off campus immediately. Which policy do you prefer and why? Use specific reasons and examples to support your opinion.",
      preparationSeconds: 15,
      responseLimitSeconds: 45,
      modelAnswer:
        "I strongly prefer the policy requiring first-year students to live in campus dormitories. First, living on campus significantly eases the social transition to university life by placing students in close proximity to peers, study groups, and campus activities. For instance, when freshmen share residence halls, they can easily form collaborative study circles for introductory courses. Second, dormitory living eliminates the logistical stress of managing utility bills and navigating long commutes, allowing new students to focus entirely on their academic performance. Therefore, on-campus residency is much more advantageous for incoming undergraduates.",
    },
    item_order: 1,
  });

  console.log("Successfully seeded original TOEFL 2026 Speaking Item Bank & Rubrics!");
}

if (process.argv[1]?.includes("seed-toefl-speaking")) {
  seedToeflSpeakingBank().catch(console.error);
}
