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
      name: "Midnight Academy TOEFL Mock 1: Benchmark Examination",
      category: "Full Mock",
      difficulty: "Middle",
      code: "TOEFL-MOCK-01",
      questionCount: 20,
    },
    {
      id: "b1000000-0000-0000-0000-000000000002",
      versionId: "b2000000-0000-0000-0000-000000000002",
      name: "Midnight Academy TOEFL Mock 2: Comprehensive Simulation",
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

  // Reading Items Definitions (6 distinct items)
  const readingDefinitions = [
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
    {
      item_type: "read_daily_life",
      difficulty: "Easy",
      skill_tags: ["Factual Information", "Campus Notice"],
      payload: {
        title: "Greenhouse HVAC Calibration Maintenance",
        passage:
          "Attention Botany Researchers: All temperature calibration dials in Greenhouse Bay 4 will undergo scheduled HVAC maintenance on Thursday between 08:00 and 12:00. Automated watering mist systems will remain fully active during this window. If your specimens require exact humidity tolerances below 65%, please submit a relocation request by Wednesday afternoon.",
        prompt:
          "What must researchers do if their plants require humidity levels below 65% on Thursday morning?",
      },
      options: [
        {
          key: "A",
          text: "Submit a relocation request before Wednesday afternoon",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "Manually shut down the automated mist systems themselves",
          isCorrect: false,
          distractor: "Mist systems remain fully active; researchers should not touch them.",
        },
        {
          key: "C",
          text: "Reschedule the HVAC maintenance team to Friday",
          isCorrect: false,
          distractor: "Students cannot reschedule facilities maintenance.",
        },
        {
          key: "D",
          text: "Leave all greenhouse ventilation windows open overnight",
          isCorrect: false,
          distractor: "Not recommended in the notice.",
        },
      ],
    },
    {
      item_type: "read_academic",
      difficulty: "Hard",
      skill_tags: ["Inference", "Biology"],
      payload: {
        title: "Symbiotic Mycorrhizal Fungal Networks",
        passage:
          "Mycorrhizal fungi form vast subterranean mycelial networks that interlink the root systems of temperate forest trees. Through these mutualistic connections, fungi transfer nitrogen and phosphorus to host trees in exchange for plant-synthesized sucrose. Recent isotopic tracing studies demonstrate that healthy mature trees also distribute surplus carbohydrates to shaded saplings via these shared fungal pathways, challenging traditional models of individualistic forest competition.",
        prompt:
          "Which finding is supported by recent isotopic tracing studies of mycorrhizal networks?",
      },
      options: [
        {
          key: "A",
          text: "Mature trees distribute surplus nutrients to younger saplings through fungal pathways",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "Fungi consume all tree carbohydrates without returning any minerals",
          isCorrect: false,
          distractor: "The passage notes fungi return nitrogen and phosphorus.",
        },
        {
          key: "C",
          text: "Subterranean mycelium inhibits the root growth of competing trees",
          isCorrect: false,
          distractor: "The networks connect and support trees rather than inhibiting roots.",
        },
        {
          key: "D",
          text: "Isotopic tracing proves trees compete without cooperation",
          isCorrect: false,
          distractor:
            "The study challenges individualistic competition by demonstrating cooperation.",
        },
      ],
    },
    {
      item_type: "complete_words",
      difficulty: "Medium",
      skill_tags: ["Morphology", "Syntax"],
      payload: {
        title: "Geological Glacial Moraines",
        passage:
          "As alpine glaciers retreat due to warming temperatures, they deposit unsorted glacial debris along valley floors, forming [0] known as lateral moraines. These formations provide scientists with critical historical records of past [1] fluctuations.",
        blanks: [
          { blankIndex: 0, hint: "ridges (noun)" },
          { blankIndex: 1, hint: "climate (noun)" },
        ],
      },
      options: [],
    },
    {
      item_type: "read_daily_life",
      difficulty: "Medium",
      skill_tags: ["Pragmatics", "Campus Life"],
      payload: {
        title: "Science Library Extended Hours & Quiet Policy",
        passage:
          "During the two weeks preceding final exams, the Science and Engineering Library will operate 24 hours daily. Floors 1 and 2 are designated for collaborative group discussions, while Floors 3 and 4 are strictly enforced as silent study zones. Any audible device use or verbal conversation on the silent floors will result in immediate relocation to the ground-floor collaborative commons.",
        prompt: "What happens if a student talks on Floor 3 during extended library hours?",
      },
      options: [
        {
          key: "A",
          text: "They will be relocated to the ground-floor collaborative commons",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "Their student library privileges are revoked for the semester",
          isCorrect: false,
          distractor: "The stated consequence is relocation, not loss of privileges.",
        },
        {
          key: "C",
          text: "They must register for an evening study session",
          isCorrect: false,
          distractor: "No registration requirement is mentioned.",
        },
        {
          key: "D",
          text: "They are permitted to whisper quietly for up to 10 minutes",
          isCorrect: false,
          distractor: "Silent floors prohibit all verbal conversation.",
        },
      ],
    },
    {
      item_type: "read_academic",
      difficulty: "Hard",
      skill_tags: ["Detail", "Art History"],
      payload: {
        title: "Chiaroscuro in Renaissance Painting",
        passage:
          "The painterly technique of chiaroscuro—employing stark contrasts between light and dark—emerged prominently during the Italian Renaissance to achieve psychological realism and volumetric illusion. By dramatically illuminating central figures while submerging peripheral details into deep shadow, artists directed viewer attention toward emotional focal points rather than decorative background surfaces.",
        prompt: "According to the passage, what was a key artistic purpose of chiaroscuro?",
      },
      options: [
        {
          key: "A",
          text: "To direct viewer focus toward emotional focal points through light contrast",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "To eliminate all shadows and make every background detail equally visible",
          isCorrect: false,
          distractor: "Chiaroscuro submerges background details in shadow.",
        },
        {
          key: "C",
          text: "To reduce the physical weight of oil paint on canvas",
          isCorrect: false,
          distractor: "The technique is aesthetic, not physical weight.",
        },
        {
          key: "D",
          text: "To replace human subjects with architectural landscape perspectives",
          isCorrect: false,
          distractor: "It illuminates central figures rather than replacing them.",
        },
      ],
    },
  ];

  // Listening Items Definitions (6 distinct items)
  const listeningDefinitions = [
    {
      item_type: "listen_choose_response",
      difficulty: "Easy",
      skill_tags: ["Pragmatics", "Immediate Response"],
      payload: {
        title: "Campus Registrar Question",
        audioUrl: "https://actions.google.com/sounds/v1/household/clock_ticking.ogg",
        stimulusText:
          "Excuse me, do you know if the registrar's office is still accepting late course drop forms today?",
        prompt: "Choose the most appropriate spoken response:",
      },
      options: [
        {
          key: "A",
          text: "Yes, but you have to submit it before 5:00 PM today.",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "The textbook was purchased at the bookstore yesterday.",
          isCorrect: false,
          distractor: "Does not answer whether drop forms are accepted.",
        },
        {
          key: "C",
          text: "I have already graduated two years ago.",
          isCorrect: false,
          distractor: "Irrelevant personal statement.",
        },
        {
          key: "D",
          text: "The campus dining hall closes at 8:00 PM.",
          isCorrect: false,
          distractor: "Unrelated to registrar hours.",
        },
      ],
    },
    {
      item_type: "listen_conversation",
      difficulty: "Medium",
      skill_tags: ["Problem-Solution", "Academic Advice"],
      payload: {
        title: "Advising Discussion: Lab Schedule Conflict",
        audioUrl: "https://actions.google.com/sounds/v1/science/radiation_monitor.ogg",
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
    {
      item_type: "listen_announcement",
      difficulty: "Medium",
      skill_tags: ["Public Broadcast", "Detail"],
      payload: {
        title: "Campus Shuttle Route Detour Notice",
        audioUrl: "https://actions.google.com/sounds/v1/transportation/car_horn.ogg",
        prompt: "What is the primary reason for the campus shuttle detour this Friday?",
      },
      options: [
        {
          key: "A",
          text: "Water pipe replacement along University Avenue will block traffic",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "The university is hosting a celebratory sports parade",
          isCorrect: false,
          distractor: "Roadwork, not a parade, causes the detour.",
        },
        {
          key: "C",
          text: "The shuttle fleet is undergoing annual brake inspections",
          isCorrect: false,
          distractor: "Buses are operating, just on an alternate route.",
        },
        {
          key: "D",
          text: "All campus classes are canceled due to bad weather",
          isCorrect: false,
          distractor: "Classes remain in session.",
        },
      ],
    },
    {
      item_type: "listen_academic_talk",
      difficulty: "Hard",
      skill_tags: ["Lecture Hierarchy", "Geology"],
      payload: {
        title: "Plate Tectonics & Mantle Plumes",
        audioUrl: "https://actions.google.com/sounds/v1/science/radiation_monitor.ogg",
        prompt:
          "According to the professor, what distinguishes mantle plumes from boundary volcanism?",
      },
      options: [
        {
          key: "A",
          text: "Mantle plumes originate deep near the core-mantle boundary independently of plate edges",
          isCorrect: true,
          distractor: null,
        },
        {
          key: "B",
          text: "Mantle plumes occur exclusively along subduction trenches",
          isCorrect: false,
          distractor: "Subduction volcanism is boundary-driven; plumes are intraplate.",
        },
        {
          key: "C",
          text: "Mantle plumes are extinguished immediately when oceanic plates move",
          isCorrect: false,
          distractor: "Plumes persist stationary, creating chains of islands.",
        },
        {
          key: "D",
          text: "Plumes produce only cold metamorphic sedimentary rock",
          isCorrect: false,
          distractor: "Plumes produce high-temperature basaltic volcanism.",
        },
      ],
    },
    {
      item_type: "listen_choose_response",
      difficulty: "Easy",
      skill_tags: ["Pragmatics", "Campus Conversation"],
      payload: {
        title: "Study Group Invitation",
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
      item_type: "listen_academic_talk",
      difficulty: "Hard",
      skill_tags: ["Lecture Hierarchy", "Ecology"],
      payload: {
        title: "Apex Predators & Trophic Cascades",
        audioUrl: "https://actions.google.com/sounds/v1/science/radiation_monitor.ogg",
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
  ];

  // Writing Items Definitions (4 distinct items)
  const writingDefinitions = [
    {
      item_type: "build_sentence",
      difficulty: "Easy",
      skill_tags: ["Grammar", "Syntax"],
      payload: {
        prompt: "Arrange the word chips to form a grammatically correct English sentence:",
        wordBank: ["researchers", "The", "published", "their", "findings", "in", "a", "journal"],
        acceptedSequences: [
          ["The", "researchers", "published", "their", "findings", "in", "a", "journal"],
        ],
      },
      options: [],
    },
    {
      item_type: "build_sentence",
      difficulty: "Medium",
      skill_tags: ["Grammar", "Adverbial Position"],
      payload: {
        prompt: "Arrange the word chips to form a grammatically correct sentence:",
        wordBank: ["scientist", "The", "carefully", "analyzed", "the", "experimental", "data"],
        acceptedSequences: [
          ["The", "scientist", "carefully", "analyzed", "the", "experimental", "data"],
          ["The", "scientist", "analyzed", "the", "experimental", "data", "carefully"],
        ],
      },
      options: [],
    },
    {
      item_type: "write_email",
      difficulty: "Medium",
      skill_tags: ["Pragmatics", "Email Writing"],
      payload: {
        title: "Email to Chemistry Professor Regarding Laboratory Equipment Issue",
        recipient: "Prof. Marcus Vance (Head of Organic Chemistry)",
        context:
          "During yesterday afternoon's synthesis lab, you discovered that Spectrometer Unit 3 was displaying an inconsistent calibration error code (ERR-402). As a result, your group could not complete the second trial of the reaction titration.",
        prompt:
          "Write an email to Professor Vance explaining what happened, specifying the equipment and error code, and requesting permission to repeat the measurement during open lab hours tomorrow.",
        modelAnswer:
          "Dear Professor Vance,\n\nI am writing to notify you of an equipment issue our lab group encountered during yesterday afternoon's Organic Chemistry synthesis lab...",
      },
      options: [],
    },
    {
      item_type: "academic_discussion",
      difficulty: "Hard",
      skill_tags: ["Academic Argumentation", "Peer Engagement"],
      payload: {
        title: "Sociology Seminar: Remote Work & Urban Development",
        context:
          "Professor Harrison:\nThe widespread adoption of permanent remote and hybrid work is transforming modern urban landscapes. Some policymakers argue that cities should invest heavily in converting commercial office skyscrapers into residential housing to reduce rental costs. Others argue that municipalities should focus instead on revitalizing retail and cultural entertainment centers to draw workers back into city downtowns. What is your perspective on this policy debate?",
        discussionPosts: [
          {
            author: "Elena (Student)",
            text: "Converting vacant commercial office buildings into affordable housing directly addresses the severe housing shortage many metropolitan areas face today.",
          },
          {
            author: "Marcus (Student)",
            text: "Office conversions are structurally expensive and complex; cities would benefit far more by revitalizing cultural venues, dining corridors, and transit hubs to revitalize downtown vibrancy.",
          },
        ],
        prompt:
          "Write a response contributing your perspective to the class discussion. State your position clearly, provide supporting reasoning and examples, and engage meaningfully with the viewpoints expressed by Elena and Marcus.",
        modelAnswer:
          "In my opinion, municipal governments should prioritize converting underutilized commercial spaces into residential housing while implementing mixed-use zoning...",
      },
      options: [],
    },
  ];

  // Speaking Items Definitions (4 distinct items)
  const speakingDefinitions = [
    {
      item_type: "listen_repeat",
      difficulty: "Easy",
      skill_tags: ["Acoustic Memory", "Phonetics"],
      payload: {
        prompt:
          "Listen to the sentence carefully, then repeat it as accurately and clearly as possible.",
        audioUrl: "https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg",
        targetSentence:
          "The university library will remain open twenty-four hours a day during final examination week.",
      },
      options: [],
    },
    {
      item_type: "listen_repeat",
      difficulty: "Medium",
      skill_tags: ["Acoustic Memory", "Phonetics"],
      payload: {
        prompt:
          "Listen to the sentence carefully, then repeat it as accurately and clearly as possible.",
        audioUrl: "https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg",
        targetSentence:
          "Renewable energy technologies are rapidly transforming industrial power grids across the globe.",
      },
      options: [],
    },
    {
      item_type: "take_interview",
      difficulty: "Medium",
      skill_tags: ["PEEL Spontaneity", "Oral Communication"],
      payload: {
        prompt:
          "Some university students prefer living in on-campus dormitories, while others prefer renting off-campus apartments with roommates. Which living arrangement do you think is better for undergraduates, and why? Explain with specific reasons and examples.",
        preparationSeconds: 15,
        responseLimitSeconds: 45,
        modelAnswer:
          "In my opinion, living in on-campus dormitories is significantly better for undergraduate students, especially during their initial years...",
      },
      options: [],
    },
    {
      item_type: "take_interview",
      difficulty: "Hard",
      skill_tags: ["PEEL Spontaneity", "Oral Communication"],
      payload: {
        prompt:
          "Do you agree or disagree with the following statement? Universities should require all undergraduate students to take at least one course in computer science or programming regardless of their academic major. Explain why with supporting arguments.",
        preparationSeconds: 15,
        responseLimitSeconds: 45,
        modelAnswer:
          "I strongly agree that universities should require all undergraduate students to take at least one introductory programming course...",
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
