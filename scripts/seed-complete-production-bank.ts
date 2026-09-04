/**
 * Midnight Academy — Master Production Seeder
 * Populates complete, rich database-backed content for all 12 TOEFL 2026 task types:
 * Reading: Complete the Words, Read in Daily Life, Read an Academic Passage
 * Listening: Listen and Choose a Response, Conversation, Announcement, Academic Talk
 * Writing: Build a Sentence, Write an Email, Academic Discussion
 * Speaking: Listen and Repeat, Take an Interview
 *
 * Sets up 2 complete 4-section Full Mock Exams (20 items each) and 4 individual section tests.
 * All items strictly linked: test -> version -> section -> module -> content_item -> question_options / rubrics.
 * Checks EVERY Supabase call error.
 */

import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

function assertNoError(err: unknown, context: string) {
  if (err) {
    console.error(`[SEED ERROR] ${context}:`, err);
    const msg = (err as { message?: string })?.message || JSON.stringify(err);
    throw new Error(`[SEED ERROR] ${context}: ${msg}`);
  }
}

export async function seedCompleteProductionBank() {
  console.log("=== Starting Midnight Academy Complete Production Bank Seeder ===");

  // 1. Resolve Admin / Instructor Owner Profile
  const { data: adminProfiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, email")
    .limit(5);

  assertNoError(profErr, "Fetch profiles");
  const ownerId = adminProfiles?.[0]?.id || "25a1547b-07ce-450d-a31b-eaebbdeefc6a";
  console.log(`Using owner profile: ${ownerId}`);

  // 2. Seed Machine-Readable Rubrics
  console.log("1. Seeding 2026 Aligned Rubrics...");
  const rubrics = [
    {
      id: "a1000000-0000-0000-0000-000000000001",
      rubric_version: "2026.1",
      task_type: "write_email",
      title: "Midnight Academy 2026 Email Writing Rubric",
      traits: [
        {
          name: "task_fulfillment",
          weight: 0.35,
          description: "Directly addresses prompt requirements and recipient register",
          maxScore: 6.0,
        },
        {
          name: "organization",
          weight: 0.3,
          description: "Clear opening, body paragraphs, and courteous sign-off",
          maxScore: 6.0,
        },
        {
          name: "language_use",
          weight: 0.35,
          description: "Grammatical accuracy, syntactic variety, academic vocabulary",
          maxScore: 6.0,
        },
      ],
      band_descriptors: {
        "6.0": "Exemplary task fulfillment with natural, fluent, and precise vocabulary.",
        "5.0": "Clear and well-organized with minor syntactic slips that do not obscure meaning.",
        "4.0": "Adequate response with basic sentence structures.",
        "3.0": "Frequent grammatical and vocabulary errors.",
        "2.0": "Incomplete or severely limited response.",
        "1.0": "Off-topic or unintelligible text.",
      },
    },
    {
      id: "a1000000-0000-0000-0000-000000000002",
      rubric_version: "2026.1",
      task_type: "academic_discussion",
      title: "Midnight Academy 2026 Academic Discussion Rubric",
      traits: [
        {
          name: "task_fulfillment",
          weight: 0.4,
          description: "Relevant contribution with developed ideas and peer engagement",
          maxScore: 6.0,
        },
        {
          name: "organization",
          weight: 0.3,
          description: "Coherent progression of arguments and supporting points",
          maxScore: 6.0,
        },
        {
          name: "language_use",
          weight: 0.3,
          description: "Academic register, syntactic complexity, vocabulary precision",
          maxScore: 6.0,
        },
      ],
      band_descriptors: {
        "6.0": "Relevant, highly developed contribution with sophisticated syntactic complexity.",
        "5.0": "Solid contribution with clear supporting reasoning and minor lexical slips.",
        "4.0": "Basic ideas with noticeable repetition.",
        "3.0": "Limited contribution with frequent language errors.",
        "2.0": "Marginally relevant text.",
        "1.0": "Blank or completely off-topic.",
      },
    },
    {
      id: "a1000000-0000-0000-0000-000000000003",
      rubric_version: "2026.1",
      task_type: "take_interview",
      title: "Midnight Academy 2026 Spoken Interview Rubric",
      traits: [
        {
          name: "task_fulfillment",
          weight: 0.25,
          description: "Direct answer to interview prompt with thorough elaboration",
          maxScore: 6.0,
        },
        {
          name: "organization",
          weight: 0.2,
          description: "Logical structure and effective transition words",
          maxScore: 6.0,
        },
        {
          name: "language_use",
          weight: 0.2,
          description: "Grammatical range and accurate vocabulary",
          maxScore: 6.0,
        },
        {
          name: "delivery",
          weight: 0.2,
          description: "Natural speech rhythm and minimal unnatural pauses",
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
        "6.0": "Highly intelligible and fluent speech with sophisticated arguments.",
        "5.0": "Clear, fluent delivery with minor pauses or pronunciation lapses.",
        "4.0": "Generally understandable speech with basic sentence patterns.",
        "3.0": "Fragmented fluency with frequent hesitations.",
        "2.0": "Very difficult to understand.",
        "1.0": "Unintelligible audio or silence.",
      },
    },
    {
      id: "a1000000-0000-0000-0000-000000000004",
      rubric_version: "2026.1",
      task_type: "listen_repeat",
      title: "Midnight Academy 2026 Sentence Repetition Rubric",
      traits: [
        {
          name: "acoustic_accuracy",
          weight: 0.4,
          description: "Word-for-word repetition of stimulus sentence",
          maxScore: 6.0,
        },
        {
          name: "pronunciation",
          weight: 0.35,
          description: "Clarity of phonetic vowels and consonants",
          maxScore: 6.0,
        },
        {
          name: "fluency_cadence",
          weight: 0.25,
          description: "Appropriate phrasing, stress, and intonation",
          maxScore: 6.0,
        },
      ],
      band_descriptors: {
        "6.0": "Flawless repetition with native-like cadence.",
        "5.0": "Accurate repetition with minor phoneme substitution.",
        "4.0": "Recognizable repetition with 1-2 words missed.",
        "3.0": "Several omissions or significant phoneme distortions.",
        "2.0": "Major omission of stimulus words.",
        "1.0": "Unintelligible or silent recording.",
      },
    },
  ];

  for (const r of rubrics) {
    const { error } = await supabase.from("rubrics").upsert(r, { onConflict: "id" });
    assertNoError(error, `Upsert rubric ${r.id}`);
  }

  // 3. Define Tests & Versions
  console.log("2. Seeding Tests & Published Test Versions...");
  const masterTests = [
    {
      id: "f1000000-0000-0000-0000-000000000000",
      versionId: "f2000000-0000-0000-0000-000000000000",
      name: "Moon | Full Test",
      category: "Full Mock",
      difficulty: "Middle",
      code: "TOEFL-MOCK-01",
      questionCount: 20,
    },
    {
      id: "b1000000-0000-0000-0000-000000000002",
      versionId: "b2000000-0000-0000-0000-000000000002",
      name: "Moon | Full Test (Simulation 2)",
      category: "Full Mock",
      difficulty: "Hard",
      code: "TOEFL-MOCK-02",
      questionCount: 20,
    },
    {
      id: "b1000000-0000-0000-0000-000000000010",
      versionId: "b2000000-0000-0000-0000-000000000010",
      name: "TOEFL Reading Section Practice Test",
      category: "Reading",
      difficulty: "Middle",
      code: "TOEFL-SEC-RD",
      questionCount: 6,
    },
    {
      id: "b1000000-0000-0000-0000-000000000020",
      versionId: "b2000000-0000-0000-0000-000000000020",
      name: "TOEFL Listening Section Practice Test",
      category: "Listening",
      difficulty: "Middle",
      code: "TOEFL-SEC-LS",
      questionCount: 6,
    },
    {
      id: "b1000000-0000-0000-0000-000000000030",
      versionId: "b2000000-0000-0000-0000-000000000030",
      name: "TOEFL Writing Section Practice Test",
      category: "Writing",
      difficulty: "Middle",
      code: "TOEFL-SEC-WR",
      questionCount: 4,
    },
    {
      id: "b1000000-0000-0000-0000-000000000040",
      versionId: "b2000000-0000-0000-0000-000000000040",
      name: "TOEFL Speaking Section Practice Test",
      category: "Speaking",
      difficulty: "Middle",
      code: "TOEFL-SEC-SP",
      questionCount: 4,
    },
  ];

  for (const t of masterTests) {
    const { error: tErr } = await supabase.from("tests").upsert(
      {
        id: t.id,
        owner_id: ownerId,
        name: t.name,
        category: t.category,
        difficulty: t.difficulty,
        question_count: t.questionCount,
        seconds_per_question: 120,
        response_seconds: 60,
        status: "active",
        code: t.code,
        is_practice: true,
      },
      { onConflict: "id" },
    );
    assertNoError(tErr, `Upsert test ${t.id}`);

    const { error: vErr } = await supabase.from("test_versions").upsert(
      {
        id: t.versionId,
        test_id: t.id,
        blueprint_version: "2026.1",
        scoring_version: "2026.1",
        status: "published",
        published_at: new Date().toISOString(),
        created_by: ownerId,
      },
      { onConflict: "id" },
    );
    assertNoError(vErr, `Upsert test_version ${t.versionId}`);
  }

  // 4. Seed Full Mock 1 Sections & Modules
  console.log("3. Seeding Full Mock 1 Sections & Modules...");
  const m1SecR = "b3000001-0000-0000-0000-000000000010";
  const m1SecL = "b3000001-0000-0000-0000-000000000020";
  const m1SecW = "b3000001-0000-0000-0000-000000000030";
  const m1SecS = "b3000001-0000-0000-0000-000000000040";

  const { error: s1Err } = await supabase.from("sections").upsert(
    [
      {
        id: m1SecR,
        test_version_id: "f2000000-0000-0000-0000-000000000000",
        section_type: "reading",
        section_order: 0,
        timing_seconds: 1800,
        instructions:
          "Reading Section: Read academic passages, complete cloze sentences, and answer comprehension questions.",
      },
      {
        id: m1SecL,
        test_version_id: "f2000000-0000-0000-0000-000000000000",
        section_type: "listening",
        section_order: 1,
        timing_seconds: 1740,
        instructions:
          "Listening Section: Listen to academic lectures, campus conversations, and public announcements.",
      },
      {
        id: m1SecW,
        test_version_id: "f2000000-0000-0000-0000-000000000000",
        section_type: "writing",
        section_order: 2,
        timing_seconds: 1380,
        instructions:
          "Writing Section: Complete sentence construction, academic email, and online discussion tasks.",
      },
      {
        id: m1SecS,
        test_version_id: "f2000000-0000-0000-0000-000000000000",
        section_type: "speaking",
        section_order: 3,
        timing_seconds: 480,
        instructions:
          "Speaking Section: Listen and repeat sentences, and articulate responses to interview questions.",
      },
    ],
    { onConflict: "id" },
  );
  assertNoError(s1Err, "Upsert Full Mock 1 sections");

  const m1ModR = "b4000001-0000-0000-0000-000000000101";
  const m1ModL = "b4000001-0000-0000-0000-000000000102";
  const m1ModW = "b4000001-0000-0000-0000-000000000103";
  const m1ModS = "b4000001-0000-0000-0000-000000000104";

  const { error: m1Err } = await supabase.from("modules").upsert(
    [
      {
        id: m1ModR,
        section_id: m1SecR,
        stage_index: 1,
        difficulty_band: "middle",
        module_order: 0,
      },
      {
        id: m1ModL,
        section_id: m1SecL,
        stage_index: 1,
        difficulty_band: "middle",
        module_order: 0,
      },
      {
        id: m1ModW,
        section_id: m1SecW,
        stage_index: 1,
        difficulty_band: "middle",
        module_order: 0,
      },
      {
        id: m1ModS,
        section_id: m1SecS,
        stage_index: 1,
        difficulty_band: "middle",
        module_order: 0,
      },
    ],
    { onConflict: "id" },
  );
  assertNoError(m1Err, "Upsert Full Mock 1 modules");

  // 5. Seed Full Mock 2 Sections & Modules
  console.log("4. Seeding Full Mock 2 Sections & Modules...");
  const m2SecR = "c3000002-0000-0000-0000-000000000010";
  const m2SecL = "c3000002-0000-0000-0000-000000000020";
  const m2SecW = "c3000002-0000-0000-0000-000000000030";
  const m2SecS = "c3000002-0000-0000-0000-000000000040";

  const { error: s2Err } = await supabase.from("sections").upsert(
    [
      {
        id: m2SecR,
        test_version_id: "b2000000-0000-0000-0000-000000000002",
        section_type: "reading",
        section_order: 0,
        timing_seconds: 1800,
        instructions:
          "Reading Section: Advanced academic passages, vocabulary in context, and cloze synthesis.",
      },
      {
        id: m2SecL,
        test_version_id: "b2000000-0000-0000-0000-000000000002",
        section_type: "listening",
        section_order: 1,
        timing_seconds: 1740,
        instructions:
          "Listening Section: Complex academic seminars, pragmatic dialogues, and technical announcements.",
      },
      {
        id: m2SecW,
        test_version_id: "b2000000-0000-0000-0000-000000000002",
        section_type: "writing",
        section_order: 2,
        timing_seconds: 1380,
        instructions:
          "Writing Section: Clause syntax building, administrative inquiry email, and scholarly debate.",
      },
      {
        id: m2SecS,
        test_version_id: "b2000000-0000-0000-0000-000000000002",
        section_type: "speaking",
        section_order: 3,
        timing_seconds: 480,
        instructions:
          "Speaking Section: Advanced spoken repetition and spontaneous conceptual argumentation.",
      },
    ],
    { onConflict: "id" },
  );
  assertNoError(s2Err, "Upsert Full Mock 2 sections");

  const m2ModR = "c4000002-0000-0000-0000-000000000101";
  const m2ModL = "c4000002-0000-0000-0000-000000000102";
  const m2ModW = "c4000002-0000-0000-0000-000000000103";
  const m2ModS = "c4000002-0000-0000-0000-000000000104";

  const { error: m2Err } = await supabase.from("modules").upsert(
    [
      { id: m2ModR, section_id: m2SecR, stage_index: 1, difficulty_band: "upper", module_order: 0 },
      { id: m2ModL, section_id: m2SecL, stage_index: 1, difficulty_band: "upper", module_order: 0 },
      { id: m2ModW, section_id: m2SecW, stage_index: 1, difficulty_band: "upper", module_order: 0 },
      { id: m2ModS, section_id: m2SecS, stage_index: 1, difficulty_band: "upper", module_order: 0 },
    ],
    { onConflict: "id" },
  );
  assertNoError(m2Err, "Upsert Full Mock 2 modules");

  // 6. Seed Modules for Single-Section Tests
  console.log("5. Seeding Single-Section Modules...");
  const ssModR = "e4000010-0000-0000-0000-000000000101";
  const ssModL = "e4000020-0000-0000-0000-000000000102";
  const ssModW = "e4000030-0000-0000-0000-000000000103";
  const ssModS = "e4000040-0000-0000-0000-000000000104";

  const { error: ssModErr } = await supabase.from("modules").upsert(
    [
      {
        id: ssModR,
        section_id: "b3000000-0000-0000-0000-000000000010",
        stage_index: 1,
        difficulty_band: "middle",
        module_order: 0,
      },
      {
        id: ssModL,
        section_id: "b3000000-0000-0000-0000-000000000020",
        stage_index: 1,
        difficulty_band: "middle",
        module_order: 0,
      },
      {
        id: ssModW,
        section_id: "b3000000-0000-0000-0000-000000000030",
        stage_index: 1,
        difficulty_band: "middle",
        module_order: 0,
      },
      {
        id: ssModS,
        section_id: "b3000000-0000-0000-0000-000000000040",
        stage_index: 1,
        difficulty_band: "middle",
        module_order: 0,
      },
    ],
    { onConflict: "id" },
  );
  assertNoError(ssModErr, "Upsert single section modules");

  // 7. Seed Complete Content Items Pool
  console.log("6. Seeding Comprehensive Content Items Pool...");

  // Reading Items Definitions (Exact TestGlider "Moon | Full Test" Items)
  const readingDefinitions = [
    {
      item_type: "read_daily_life",
      difficulty: "Easy",
      skill_tags: ["Inference", "Email"],
      payload: {
        title: "Read an email",
        format: "email",
        email: {
          to: "All tenants of Millhouse Tower",
          from: "bwrightson@MTowermail.com",
          date: "15/07/2025",
          subject: "Elevator Maintenance",
        },
        passage:
          "Greetings Tenants,\n\nThe next elevator maintenance is scheduled for August 9 from 10 AM to 4 PM. None of the elevators will be functional during that window. This is routine maintenance that is conducted annually by the City Safety Board. We recommend that the tenants on higher floors work remotely on that day so you won't have to climb up to 20 flights of stairs. If you must come to your office, you should probably bring your lunch since deliverymen will be unable to deliver ordered food. We will notify you when the work has been completed.\n\nSincerely,\nBernice Wrightson",
        prompt: "What can be inferred from the passage about Millhouse Tower?",
      },
      options: [
        {
          key: "A",
          text: "It is a commercial building.",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "The building is located downtown.",
          isCorrect: false,
          distractor: "The passage does not state that the building is located downtown.",
        },
        {
          key: "C",
          text: "It has only one elevator.",
          isCorrect: false,
          distractor: "The passage states 'None of the elevators', indicating multiple elevators.",
        },
        {
          key: "D",
          text: "The City Safety Board is in it.",
          isCorrect: false,
          distractor: "The City Safety Board conducts the annual inspection; their office is not in the building.",
        },
      ],
    },
    {
      item_type: "read_daily_life",
      difficulty: "Medium",
      skill_tags: ["Detail", "Text Chain"],
      payload: {
        title: "Read a text chain.",
        format: "chat",
        chatMessages: [
          {
            sender: "Sara Torsten",
            time: "09:45 AM",
            text: "Good morning, everyone. I wanted to check in with everyone since the Innovation Convention is fast approaching. Everything for our booth needs to be ready by Wednesday.",
          },
          {
            sender: "Paulina Echeverria",
            time: "09:51 AM",
            text: "I am happy to report that the product catalogs will arrive from the printer this afternoon.",
          },
          {
            sender: "Gerald Kingman",
            time: "09:57 AM",
            text: "That is good to know. The redone displays and backdrops were delivered yesterday evening. And the company agreed not to charge us since it was their spelling error, and not ours.",
          },
          {
            sender: "Kathy McDermott",
            time: "10:02 AM",
            text: "That is a relief. I will review both the catalogs and the displays to make sure that they are perfect.",
          },
          {
            sender: "Sara Torsten",
            time: "10:08 AM",
            text: "Fantastic. Make sure to give copies to the employees that will work our booth as soon as you finish. We don't need a repeat of last year.",
          },
          {
            sender: "Kathy McDermott",
            time: "10:12 AM",
            text: "I assure you that won't happen again. Our representatives will have ample time to study the catalog this time.",
          },
          {
            sender: "Sara Torsten",
            time: "10:15 AM",
            text: "Great work, guys! I look forward to seeing all of you in person at the convention.",
          },
        ],
        passage:
          "Sara Torsten (09:45 AM): Good morning, everyone. I wanted to check in with everyone since the Innovation Convention is fast approaching. Everything for our booth needs to be ready by Wednesday.\n\nPaulina Echeverria (09:51 AM): I am happy to report that the product catalogs will arrive from the printer this afternoon.\n\nGerald Kingman (09:57 AM): That is good to know. The redone displays and backdrops were delivered yesterday evening. And the company agreed not to charge us since it was their spelling error, and not ours.\n\nKathy McDermott (10:02 AM): That is a relief. I will review both the catalogs and the displays to make sure that they are perfect.\n\nSara Torsten (10:08 AM): Fantastic. Make sure to give copies to the employees that will work our booth as soon as you finish. We don't need a repeat of last year.\n\nKathy McDermott (10:12 AM): I assure you that won't happen again. Our representatives will have ample time to study the catalog this time.\n\nSara Torsten (10:15 AM): Great work, guys! I look forward to seeing all of you in person at the convention.",
        prompt: "What promotional materials were NOT generated for the convention?",
      },
      options: [
        {
          key: "A",
          text: "Product catalogs",
          isCorrect: false,
          distractor: "Product catalogs arrived from the printer this afternoon.",
        },
        {
          key: "B",
          text: "Free samples",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "C",
          text: "Displays",
          isCorrect: false,
          distractor: "The redone displays were delivered yesterday evening.",
        },
        {
          key: "D",
          text: "Backdrops",
          isCorrect: false,
          distractor: "Backdrops were also delivered yesterday evening.",
        },
      ],
    },
    {
      item_type: "read_academic",
      difficulty: "Hard",
      skill_tags: ["Rhetorical Purpose", "Biology"],
      payload: {
        title: "Longevity",
        passage:
          "What determines how long an organism typically lives? Shrews only live for about six months while Greenland sharks can survive for centuries. The study of longevity has not been able to produce one individual factor that is responsible for the length of any species' typical lifespan, but there appear to be three contributing factors.\n\nThe first factor is living in cold environments. The longest-living mammal, the bowhead whale, lives in the extremely cold waters of the Arctic Ocean. Biologists theorize that the frigid temperatures cause the heart rates and metabolic rates of these animals to slow down, and that, in turn, helps to slow the aging process.\n\nThe second factor is the average size of adult animals. Large-bodied animals, generally speaking, live longer than small-bodied ones. Elephants and whales live longer than rats and mice. The reason seems to be that large bodies offer better protection from predators. The trade-off for this advantage is that it takes a long time to grow that large, so the members of a large-bodied species cannot reproduce quickly.\n\nThe third factor is the lifecycle of cells within an animal. As creatures age, new cells constantly replace dead and damaged ones, but the speed at which new cells are produced is not constant. It increases as animals grow to maturity, levels off, and then begins to decline. The decreasing production of new cells and the increasing accumulation of older cells have a combined effect on how long an animal lives.",
        prompt: "Why does the author mention Greenland sharks?",
      },
      options: [
        {
          key: "A",
          text: "To suggest that they have the longest lifespan of all animals",
          isCorrect: false,
          distractor: "The author mentions them to contrast with shrews, not claiming the longest of all.",
        },
        {
          key: "B",
          text: "To demonstrate the incredible longevity of some species",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "C",
          text: "To illustrate why aquatic animals have such long lifespans",
          isCorrect: false,
          distractor: "Aquatic adaptation is not the general point being illustrated here.",
        },
        {
          key: "D",
          text: "To provide an example of a species that lives in the Arctic Ocean",
          isCorrect: false,
          distractor: "Bowhead whales are cited as Arctic examples later.",
        },
      ],
    },
    {
      item_type: "read_academic",
      difficulty: "Medium",
      skill_tags: ["Factual Information", "Biology"],
      payload: {
        title: "Longevity",
        passage:
          "What determines how long an organism typically lives? Shrews only live for about six months while Greenland sharks can survive for centuries. The study of longevity has not been able to produce one individual factor that is responsible for the length of any species' typical lifespan, but there appear to be three contributing factors.\n\nThe first factor is living in cold environments. The longest-living mammal, the bowhead whale, lives in the extremely cold waters of the Arctic Ocean. Biologists theorize that the frigid temperatures cause the heart rates and metabolic rates of these animals to slow down, and that, in turn, helps to slow the aging process.\n\nThe second factor is the average size of adult animals. Large-bodied animals, generally speaking, live longer than small-bodied ones. Elephants and whales live longer than rats and mice. The reason seems to be that large bodies offer better protection from predators. The trade-off for this advantage is that it takes a long time to grow that large, so the members of a large-bodied species cannot reproduce quickly.\n\nThe third factor is the lifecycle of cells within an animal. As creatures age, new cells constantly replace dead and damaged ones, but the speed at which new cells are produced is not constant. It increases as animals grow to maturity, levels off, and then begins to decline. The decreasing production of new cells and the increasing accumulation of older cells have a combined effect on how long an animal lives.",
        prompt: "According to the passage, cold environments",
      },
      options: [
        {
          key: "A",
          text: "speed up the ageing process.",
          isCorrect: false,
          distractor: "Cold environments slow down the aging process.",
        },
        {
          key: "B",
          text: "are only survivable for mammals.",
          isCorrect: false,
          distractor: "Greenland sharks are fish and also survive for centuries.",
        },
        {
          key: "C",
          text: "make finding food more difficult.",
          isCorrect: false,
          distractor: "Finding food is not mentioned in relation to cold temperatures.",
        },
        {
          key: "D",
          text: "lower heart rates and metabolic rates.",
          isCorrect: true,
          distractor: null,
        },
      ],
    },
    {
      item_type: "read_daily_life",
      difficulty: "Medium",
      skill_tags: ["Inference", "Email"],
      payload: {
        title: "Read an email",
        format: "email",
        email: {
          to: "ikimataoka@sydmail.com",
          from: "ewilson@cHinspmail.com",
          date: "25/08/2025",
          subject: "RE: Inspection",
        },
        passage:
          "Greetings Ms. Mataoka,\n\nSakura Ramen's health inspection was performed on August 23, 2024, and although there were some issues, your restaurant passed its first inspection. An inspector will visit you on August 31 to confirm that those issues have been resolved. Assuming that they have, you may proceed with opening your establishment to customers on September 2 as you had planned.\n\nUnless we receive customer reports of unsanitary conditions, you will be inspected annually, although the dates will be random and unannounced in the future. You must be present at the restaurant for inspections, so you will be notified one hour before they begin. This should allow you sufficient time to reach your restaurant before the inspection team arrives.\n\nBest regards,\nAbigail Wilson",
        prompt: "What can be inferred about Ms. Mataoka?",
      },
      options: [
        {
          key: "A",
          text: "She has requested a health inspection.",
          isCorrect: false,
          distractor: "The email confirms an inspection was scheduled, not requested by her.",
        },
        {
          key: "B",
          text: "She disputed the results of an inspection.",
          isCorrect: false,
          distractor: "No dispute is mentioned.",
        },
        {
          key: "C",
          text: "She has recently become an inspector.",
          isCorrect: false,
          distractor: "She is receiving the inspection letter, not acting as inspector.",
        },
        {
          key: "D",
          text: "She is the owner of a new restaurant.",
          isCorrect: true,
          distractor: null,
        },
      ],
    },
    {
      item_type: "complete_words",
      difficulty: "Medium",
      skill_tags: ["Vocabulary", "Cloze"],
      payload: {
        title: "Photosynthesis & Solar Energy Conversion",
        passage:
          "Plant cells convert solar radiation into chemical energy through light-dependent reactions followed by enzymatic [0] in the stroma. During the Calvin cycle, carbon dioxide is synthesized into carbohydrates to support cellular [1].",
        blanks: [
          { blankIndex: 0, hint: "processes (noun)" },
          { blankIndex: 1, hint: "growth (noun)" },
        ],
      },
      options: [],
    },
  ];

  // Listening Items Definitions (Exact TestGlider "Moon | Full Test" Items)
  const listeningDefinitions = [
    {
      item_type: "listen_choose_response",
      difficulty: "Easy",
      skill_tags: ["Pragmatics", "Immediate Response"],
      payload: {
        title: "Choose the best response.",
        audioUrl: "https://actions.google.com/sounds/v1/household/clock_ticking.ogg",
        stimulusText:
          "Excuse me, the air conditioning unit in Room 407 seems to be malfunctioning and making strange noises.",
        prompt: "Choose the best response.",
      },
      options: [
        {
          key: "A",
          text: "The summer session starts soon.",
          isCorrect: false,
          distractor: "Irrelevant response.",
        },
        {
          key: "B",
          text: "The maintenance team can fix it.",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "C",
          text: "I've just moved to Room 407.",
          isCorrect: false,
          distractor: "Does not address the malfunctioning AC.",
        },
        {
          key: "D",
          text: "Let's open the window instead.",
          isCorrect: false,
          distractor: "Not an appropriate customer/facilities response.",
        },
      ],
    },
    {
      item_type: "listen_conversation",
      difficulty: "Medium",
      skill_tags: ["Pragmatics", "Idiom & Tone"],
      payload: {
        title: "Listen to a conversation.",
        audioUrl: "https://actions.google.com/sounds/v1/science/radiation_monitor.ogg",
        stimulusText:
          "Man: Did you hear that the campus administration finally approved the expansion of the science lab equipment budget after two years of review?\nWoman: Really? Well, this is long overdue! We've been struggling with outdated microscopes and shared apparatus for semesters.",
        prompt: 'Why does the woman say, "This is long overdue"?',
      },
      options: [
        {
          key: "A",
          text: "She thinks an issue should have been resolved sooner.",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "She wishes the man should have told her the news right away.",
          isCorrect: false,
          distractor: "The phrase refers to the administrative delay, not the conversation timing.",
        },
        {
          key: "C",
          text: "She is worried about submitting an assignment late.",
          isCorrect: false,
          distractor: "No homework assignment is mentioned.",
        },
        {
          key: "D",
          text: "She has been waiting to borrow some important equipment.",
          isCorrect: false,
          distractor: "The issue is overall lab budget approval, not personal equipment loan.",
        },
      ],
    },
    {
      item_type: "listen_announcement",
      difficulty: "Medium",
      skill_tags: ["Public Broadcast", "Detail"],
      payload: {
        title: "Listen to an announcement on a campus radio station.",
        audioUrl: "https://actions.google.com/sounds/v1/transportation/car_horn.ogg",
        stimulusText:
          "Good morning students! This is WKCR Campus Radio with an update on today's events. Due to expected rain this afternoon, the outdoor club fair on the main quadrangle has been moved inside to the student union hall. Exhibits will open promptly at 1 PM. Free refreshments will be served at the welcome desk. Be sure to stop by and discover student organizations!",
        prompt: "What change to the club fair is announced?",
      },
      options: [
        {
          key: "A",
          text: "It has been moved to an indoor location due to weather.",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "It has been cancelled until next weekend.",
          isCorrect: false,
          distractor: "The event is relocated, not cancelled.",
        },
        {
          key: "C",
          text: "It will start earlier in the morning.",
          isCorrect: false,
          distractor: "Opening time remains 1 PM.",
        },
        {
          key: "D",
          text: "Refreshments will no longer be provided.",
          isCorrect: false,
          distractor: "Free refreshments are still served at the welcome desk.",
        },
      ],
    },
    {
      item_type: "listen_academic_talk",
      difficulty: "Hard",
      skill_tags: ["Lecture Hierarchy", "Ecology"],
      payload: {
        title: "Apex Predators & Trophic Cascades",
        audioUrl: "https://actions.google.com/sounds/v1/science/radiation_monitor.ogg",
        stimulusText:
          "When wolves were reintroduced to Yellowstone National Park after a seventy-year absence, ecologists witnessed a profound trophic cascade. The presence of apex predators altered elk grazing patterns, which in turn allowed riparian willow and aspen vegetation to regenerate along riverbanks, ultimately stabilizing the soil and restoring beaver populations.",
        prompt:
          "What ecological effect was observed after wolves were reintroduced to Yellowstone National Park?",
      },
      options: [
        {
          key: "A",
          text: "Elk populations were dispersed, allowing riparian willow and aspen vegetation to recover",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "Beaver colonies completely died out across the entire river basin",
          isCorrect: false,
          distractor: "Beaver populations expanded because vegetation rebounded.",
        },
        {
          key: "C",
          text: "Soil erosion increased rapidly along riverbanks",
          isCorrect: false,
          distractor: "Vegetation roots stabilized riverbanks and reduced erosion.",
        },
        {
          key: "D",
          text: "All smaller coyote and fox populations were eliminated permanently",
          isCorrect: false,
          distractor: "Coyotes were regulated, not eliminated entirely.",
        },
      ],
    },
    {
      item_type: "listen_choose_response",
      difficulty: "Easy",
      skill_tags: ["Pragmatics", "Campus Conversation"],
      payload: {
        title: "Choose the best response.",
        audioUrl: "https://actions.google.com/sounds/v1/household/clock_ticking.ogg",
        stimulusText:
          "Hey Alex, a few of us are reviewing macroeconomics notes at the campus cafe tonight. Would you like to join us around seven?",
        prompt: "Choose the best spoken reply:",
      },
      options: [
        {
          key: "A",
          text: "I'd love to, but I have a laboratory report due at midnight.",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "The cafe serves sandwiches and iced tea all afternoon.",
          isCorrect: false,
          distractor: "Describing food does not respond to the invitation.",
        },
        {
          key: "C",
          text: "Macroeconomics is taught in Room 304.",
          isCorrect: false,
          distractor: "Classroom number is not a conversational reply.",
        },
        {
          key: "D",
          text: "Yes, the weather will be cloudy tomorrow morning.",
          isCorrect: false,
          distractor: "Completely unrelated comment.",
        },
      ],
    },
    {
      item_type: "listen_conversation",
      difficulty: "Medium",
      skill_tags: ["Problem-Solution", "Academic Advice"],
      payload: {
        title: "Listen to a conversation.",
        audioUrl: "https://actions.google.com/sounds/v1/science/radiation_monitor.ogg",
        stimulusText:
          "Student: Professor, I realized this morning that my required organic chemistry laboratory time overlaps directly with the advanced history seminar I need for my minor.\nAdvisor: Let us review the alternative Thursday evening lab section. There may still be two open laboratory benches available.",
        prompt: "Why is the student meeting with her academic advisor?",
      },
      options: [
        {
          key: "A",
          text: "Her required chemistry laboratory conflicts with an elective history seminar",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "She wants to withdraw from the university entirely",
          isCorrect: false,
          distractor: "She wants to resolve a schedule conflict, not withdraw.",
        },
        {
          key: "C",
          text: "She is applying to transfer to an overseas campus",
          isCorrect: false,
          distractor: "No overseas transfer is discussed.",
        },
        {
          key: "D",
          text: "She cannot afford her current laboratory course fee",
          isCorrect: false,
          distractor: "Financial concerns are not the topic.",
        },
      ],
    },
  ];

  // Writing Items Definitions (Exact TestGlider "Moon | Full Test" Items)
  const writingDefinitions = [
    {
      item_type: "build_sentence",
      difficulty: "Easy",
      skill_tags: ["Grammar", "Syntax"],
      payload: {
        title: "Build a Sentence",
        subtitle:
          "Move the words in the boxes to create grammatical sentences. A clock will show you how much time you have to complete this task.",
        prompt: "Move the words in the boxes to create grammatical sentences:",
        wordBank: [
          "for students",
          "The library",
          "quiet study spaces",
          "preparing for exams.",
          "offers",
        ],
        acceptedSequences: [
          [
            "The library",
            "offers",
            "quiet study spaces",
            "for students",
            "preparing for exams.",
          ],
        ],
      },
      options: [],
    },
    {
      item_type: "academic_discussion",
      difficulty: "Hard",
      skill_tags: ["Academic Discussion", "Economics"],
      payload: {
        title: "Academic Discussion",
        topic: "Economics: Sin Taxes",
        context:
          "Your professor is teaching a class on economics. Write a post responding to the professor's question.\n\nIn your response, you should do the following.\n• Express and support your opinion.\n• Make a contribution to the discussion in your own words.\n\nAn effective response will contain at least 100 words.",
        prompt:
          "Your professor is teaching a class on economics. Write a post responding to the professor's question.\n\nIn your response, you should do the following.\n• Express and support your opinion.\n• Make a contribution to the discussion in your own words.\n\nAn effective response will contain at least 100 words.",
        professor: {
          name: "Professor Takata",
          avatar: "PT",
          text:
            "Today we are going to cover the topic of sin taxes. These are taxes that the government adds to products, goods, or services that are harmful to individuals or society as a whole. Recently, these taxes have been applied to sugary drinks, fast food, and junk foods. Proponents say these taxes could discourage people from consuming such items and reduce health issues like obesity. Critics argue that these taxes unfairly target low-income consumers who cannot afford healthier foods. Which opinion do you agree with and why?",
        },
        discussionPosts: [
          {
            author: "Mikhail",
            avatar: "M",
            text:
              "I do not agree with applying sin taxes to unhealthy food items. As the professor mentioned, these taxes may unfairly affect poor people who rely on those foods. There are areas in the United States called food deserts where many people without cars live too far from a supermarket to walk there. So, they often have to eat fast food and junk food just to have any kind of food. Their diets aren't healthy, but they have to eat what is available. Sin taxes would really hurt these people.",
          },
          {
            author: "Kaitlyn",
            avatar: "K",
            text:
              "I definitely support adding taxes to unhealthy products. Fast food and junk food often contain high amounts of sugar, fat, and salt, which can cause many health problems including heart disease and obesity. Taxes will discourage people from buying them, and the money from these taxes can be used by the government to help people with those problems. They could also provide incentives to supermarkets to move into food deserts and sell healthier foods.",
          },
        ],
      },
      options: [],
    },
    {
      item_type: "build_sentence",
      difficulty: "Medium",
      skill_tags: ["Grammar", "Adverbial Position"],
      payload: {
        title: "Build a Sentence",
        subtitle:
          "Move the words in the boxes to create grammatical sentences. A clock will show you how much time you have to complete this task.",
        prompt: "Move the words in the boxes to create grammatical sentences:",
        wordBank: ["scientist", "The", "carefully", "analyzed", "the", "experimental", "data."],
        acceptedSequences: [
          ["The", "scientist", "carefully", "analyzed", "the", "experimental", "data."],
          ["The", "scientist", "analyzed", "the", "experimental", "data", "carefully."],
        ],
      },
      options: [],
    },
    {
      item_type: "write_email",
      difficulty: "Medium",
      skill_tags: ["Pragmatics", "Email Writing"],
      payload: {
        title: "Write an Email",
        recipient: "Prof. Marcus Vance (Head of Organic Chemistry)",
        context:
          "During yesterday afternoon's synthesis lab, you discovered that Spectrometer Unit 3 was displaying an inconsistent calibration error code (ERR-402). As a result, your group could not complete the second trial of the reaction titration.",
        prompt:
          "Write an email to Professor Vance explaining the equipment malfunction, requesting permission to conduct the trial during open lab hours on Friday, and asking if replacement calibration standards are needed.",
      },
      options: [],
    },
  ];

  // Speaking Items Definitions (Exact TestGlider "Moon | Full Test" Items)
  const speakingDefinitions = [
    {
      item_type: "listen_repeat",
      difficulty: "Easy",
      skill_tags: ["Acoustic Memory", "Phonetics"],
      payload: {
        scenario: "You are training to assist visitors to a natural history museum.",
        prompt: "Listen and repeat only once.",
        audioUrl: "https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg",
        targetSentence:
          "The dinosaur exhibit is located on the second floor near the main auditorium.",
        stimulusText:
          "The dinosaur exhibit is located on the second floor near the main auditorium.",
      },
      options: [],
    },
    {
      item_type: "listen_repeat",
      difficulty: "Easy",
      skill_tags: ["Acoustic Memory", "Phonetics"],
      payload: {
        scenario: "You are training to assist visitors to a natural history museum.",
        prompt: "Listen and repeat only once.",
        audioUrl: "https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg",
        targetSentence:
          "Photography is permitted inside the mineral gallery, but flash is strictly prohibited.",
        stimulusText:
          "Photography is permitted inside the mineral gallery, but flash is strictly prohibited.",
      },
      options: [],
    },
    {
      item_type: "listen_repeat",
      difficulty: "Easy",
      skill_tags: ["Acoustic Memory", "Phonetics"],
      payload: {
        scenario: "You are training to assist visitors to a natural history museum.",
        prompt: "Listen and repeat only once.",
        audioUrl: "https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg",
        targetSentence:
          "Guided tours depart from the information desk every half hour.",
        stimulusText:
          "Guided tours depart from the information desk every half hour.",
      },
      options: [],
    },
    {
      item_type: "take_interview",
      difficulty: "Medium",
      skill_tags: ["PEEL Spontaneity", "Oral Communication"],
      payload: {
        scenario:
          "You have agreed to take part in a research study about eating at restaurants. You will have a short online interview with a researcher. The researcher will ask you some questions.",
        prompt: "Please answer the interviewer's question.",
        interviewerQuestion:
          "How often do you usually eat meals at restaurants, and what factors influence your choice of where to dine?",
        stimulusText:
          "How often do you usually eat meals at restaurants, and what factors influence your choice of where to dine?",
        preparationSeconds: 15,
        responseLimitSeconds: 45,
        modelAnswer:
          "I typically eat at restaurants about twice a week, usually with friends or when I have a demanding study schedule. The primary factors that influence where I choose to dine are the nutritional quality of the ingredients, reasonable pricing for students, and convenient location near campus.",
      },
      options: [],
    },
  ];

  // Helper to insert a list of items into a module
  const seedItemsIntoModule = async (
    items: typeof readingDefinitions,
    moduleId: string,
    sectionType: string,
    idPrefix: string,
  ) => {
    for (let i = 0; i < items.length; i++) {
      const def = items[i];
      const itemId = `${idPrefix}0000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`;

      const { error: itErr } = await supabase.from("content_items").upsert(
        {
          id: itemId,
          module_id: moduleId,
          section_type: sectionType,
          item_type: def.item_type,
          difficulty: def.difficulty,
          skill_tags: def.skill_tags,
          payload: def.payload,
          item_order: i,
        },
        { onConflict: "id" },
      );
      assertNoError(itErr, `Upsert item ${itemId}`);

      if (def.options && def.options.length > 0) {
        for (let oIdx = 0; oIdx < def.options.length; oIdx++) {
          const opt = def.options[oIdx];
          const { error: optErr } = await supabase.from("question_options").upsert(
            {
              content_item_id: itemId,
              option_key: opt.key,
              option_text: opt.text,
              is_correct: opt.isCorrect,
              distractor_rationale: opt.distractor,
              option_order: oIdx,
            },
            { onConflict: "content_item_id,option_key" },
          );
          assertNoError(optErr, `Upsert option for item ${itemId}`);
        }
      }
    }
  };

  // 8. Seed Full Mock 1 Items (6 R + 6 L + 4 W + 4 S = 20 items)
  console.log("7. Seeding Full Mock 1 Content Items...");
  await seedItemsIntoModule(readingDefinitions, m1ModR, "reading", "b501");
  await seedItemsIntoModule(listeningDefinitions, m1ModL, "listening", "b502");
  await seedItemsIntoModule(writingDefinitions, m1ModW, "writing", "b503");
  await seedItemsIntoModule(speakingDefinitions, m1ModS, "speaking", "b504");

  // 9. Seed Full Mock 2 Items (6 R + 6 L + 4 W + 4 S = 20 items)
  console.log("8. Seeding Full Mock 2 Content Items...");
  await seedItemsIntoModule(readingDefinitions, m2ModR, "reading", "c501");
  await seedItemsIntoModule(listeningDefinitions, m2ModL, "listening", "c502");
  await seedItemsIntoModule(writingDefinitions, m2ModW, "writing", "c503");
  await seedItemsIntoModule(speakingDefinitions, m2ModS, "speaking", "c504");

  // 10. Seed Standalone Section Tests Items (6 R + 6 L + 4 W + 4 S = 20 items)
  console.log("9. Seeding Standalone Section Tests Content Items...");
  await seedItemsIntoModule(readingDefinitions, ssModR, "reading", "d501");
  await seedItemsIntoModule(listeningDefinitions, ssModL, "listening", "d502");
  await seedItemsIntoModule(writingDefinitions, ssModW, "writing", "d503");
  await seedItemsIntoModule(speakingDefinitions, ssModS, "speaking", "d504");

  console.log(
    "=== Production Seeding Successfully Completed! Total 60 items seeded with full integrity! ===",
  );
}

if (process.argv[1]?.includes("seed-complete-production-bank")) {
  seedCompleteProductionBank().catch(console.error);
}
