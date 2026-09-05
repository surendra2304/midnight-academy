/**
 * Master Seed Script: TOEFL iBT 2026 Official TestGlider Full Mock (Moon)
 * 100% Alignment with Official TestGlider Mock 6 / YouTube Practice Test:
 * - Reading: Paleontology cloze, Fungi cloze, Marketing coordinator email, Webinar email, Text chain, The Power of Music (all 5 questions)
 * - Listening: Choose the best response (8 items), Janet's concert conversation, Sociology Cultural Relativism lecture
 * - Writing: Build a Sentence (10 sentences), Email to Jake, Academic Discussion on Social Mobility (Dr. Gupta, Kelly, Andrew)
 * - Speaking: Museum Visitor Guide repetition (7 items), Outdoor Activities Interview (4 items)
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

export async function seedTestGliderMoon() {
  console.log("Seeding 100% Authentic TestGlider Moon Full Mock Exam...");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "admin@midnight.academy")
    .maybeSingle();

  const ownerId = adminProfile?.id || "25a1547b-07ce-450d-a31b-eaebbdeefc6a";

  // 1. Top-Level Test
  const testId = "f1000000-0000-0000-0000-000000000000";
  await supabase.from("tests").upsert(
    {
      id: testId,
      owner_id: ownerId,
      name: "Moon | Full Test",
      category: "Full Mock",
      difficulty: "Medium",
      question_count: 37,
      seconds_per_question: 90,
      response_seconds: 60,
      status: "active",
      code: "TOEFL-MOCK-MOON",
      is_practice: false,
    },
    { onConflict: "id" },
  );

  // 2. Test Version
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

  // 3. Sections
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
      instructions: "Reading Section: Read the passages and complete the cloze and comprehension questions.",
    },
    {
      id: secListeningId,
      test_version_id: versionId,
      section_type: "listening",
      section_order: 1,
      timing_seconds: 1740,
      instructions: "Listening Section: Listen to academic lectures, campus conversations, and answer the questions.",
    },
    {
      id: secWritingId,
      test_version_id: versionId,
      section_type: "writing",
      section_order: 2,
      timing_seconds: 1380,
      instructions: "Writing Section: Complete sentence building, email writing, and academic discussion writing.",
    },
    {
      id: secSpeakingId,
      test_version_id: versionId,
      section_type: "speaking",
      section_order: 3,
      timing_seconds: 480,
      instructions: "Speaking Section: Listen and repeat sentences, and answer the interview questions.",
    },
  ]);

  // 4. Modules
  const modR1Id = "f4000000-0000-0000-0000-000000000101";
  const modL1Id = "f4000000-0000-0000-0000-000000000102";
  const modW1Id = "f4000000-0000-0000-0000-000000000103";
  const modS1Id = "f4000000-0000-0000-0000-000000000104";

  await supabase.from("modules").upsert([
    { id: modR1Id, section_id: secReadingId, stage_index: 1, difficulty_band: "middle", module_order: 0 },
    { id: modL1Id, section_id: secListeningId, stage_index: 1, difficulty_band: "middle", module_order: 0 },
    { id: modW1Id, section_id: secWritingId, stage_index: 1, difficulty_band: "middle", module_order: 0 },
    { id: modS1Id, section_id: secSpeakingId, stage_index: 1, difficulty_band: "middle", module_order: 0 },
  ]);

  // ==========================================
  // SECTION 1: READING (14 Items)
  // ==========================================

  // R1: Complete the Words - Paleontology
  const itemR1 = "f5000000-0000-0000-0001-000000000001";
  await supabase.from("content_items").upsert({
    id: itemR1,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "complete_words",
    difficulty: "Medium",
    skill_tags: ["Cloze", "Paleontology", "Vocabulary"],
    payload: {
      title: "Fill in the missing letters in the paragraph.",
      passage:
        "Paleontology is the scientific study that deals with the history of life through the analysis of fossil records. This fi[0] involves exam[1] fossils—rem[2] of orga[3] preserved i[4] rock—t[5] understand h[6] ancient li[7]-forms evo[8] and ada[9] to their surroundings. Paleontologists also use fossils to learn about ancient environmental conditions. Finding marine fossils in landlocked areas, for example, suggests that these regions were very likely underwater once upon a time.",
      blanks: [
        { blankIndex: 0, prefix: "fi", answer: "eld", hint: "eld" },
        { blankIndex: 1, prefix: "exam", answer: "ining", hint: "ining" },
        { blankIndex: 2, prefix: "rem", answer: "ains", hint: "ains" },
        { blankIndex: 3, prefix: "orga", answer: "nisms", hint: "nisms" },
        { blankIndex: 4, prefix: "i", answer: "n", hint: "n" },
        { blankIndex: 5, prefix: "t", answer: "o", hint: "o" },
        { blankIndex: 6, prefix: "h", answer: "ow", hint: "ow" },
        { blankIndex: 7, prefix: "li", answer: "fe", hint: "fe" },
        { blankIndex: 8, prefix: "evo", answer: "lved", hint: "lved" },
        { blankIndex: 9, prefix: "ada", answer: "pted", hint: "pted" },
      ],
      correctTokens: ["eld", "ining", "ains", "nisms", "n", "o", "ow", "fe", "lved", "pted"],
    },
    item_order: 0,
  });

  // R2: Complete the Words - Fungi
  const itemR2 = "f5000000-0000-0000-0001-000000000002";
  await supabase.from("content_items").upsert({
    id: itemR2,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "complete_words",
    difficulty: "Medium",
    skill_tags: ["Cloze", "Biology", "Fungi"],
    payload: {
      title: "Fill in the missing letters in the paragraph.",
      passage:
        "Fungi, a group of organisms that include mushrooms and yeast, are not plants but a separate branch of life. They c[0] be fo[1] in alm[2] every envir[3] and pl[4] essential ro[5] in var[6] ecosystems. Ma[7] of th[8] are decomposers, mea[9] that they break down organic matter and recycle nutrients back into the soil. Some fungi form symbiotic relationships with plants, helping them absorb water and nutrients. While many fungi are beneficial, others can cause diseases in plants, animals, and humans.",
      blanks: [
        { blankIndex: 0, prefix: "c", answer: "an", hint: "an" },
        { blankIndex: 1, prefix: "fo", answer: "und", hint: "und" },
        { blankIndex: 2, prefix: "alm", answer: "ost", hint: "ost" },
        { blankIndex: 3, prefix: "envir", answer: "onment", hint: "onment" },
        { blankIndex: 4, prefix: "pl", answer: "ay", hint: "ay" },
        { blankIndex: 5, prefix: "ro", answer: "les", hint: "les" },
        { blankIndex: 6, prefix: "var", answer: "ious", hint: "ious" },
        { blankIndex: 7, prefix: "Ma", answer: "ny", hint: "ny" },
        { blankIndex: 8, prefix: "th", answer: "em", hint: "em" },
        { blankIndex: 9, prefix: "mea", answer: "ning", hint: "ning" },
      ],
      correctTokens: ["an", "und", "ost", "onment", "ay", "les", "ious", "ny", "em", "ning"],
    },
    item_order: 1,
  });

  // R3: Daily Life Email 1 - Purpose
  const email1Text =
    "Date: September 21\nSubject: Marketing Coordinator Interview\n\nDear Ms. Johnson,\n\nYour interview for the position of Marketing Coordinator is scheduled for November 3 at 2:00 p.m. See directions to our office here: www.lemberts.org/Q&A. Please arrive 10 minutes early. Contact us at 444-3526 if you have any questions.\n\nBest regards,\nMichael Davis";

  const itemR3 = "f5000000-0000-0000-0001-000000000003";
  await supabase.from("content_items").upsert({
    id: itemR3,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_daily_life",
    difficulty: "Medium",
    skill_tags: ["Email", "Main Purpose"],
    payload: {
      title: "Read an email.",
      contextType: "email",
      emailHeader: { date: "September 21", subject: "Marketing Coordinator Interview" },
      passage: email1Text,
      prompt: "What is the main purpose of the email?",
    },
    item_order: 2,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR3, option_key: "A", option_text: "To request details about a job application", is_correct: false, option_order: 0 },
    { content_item_id: itemR3, option_key: "B", option_text: "To make an offer of employment", is_correct: false, option_order: 1 },
    { content_item_id: itemR3, option_key: "C", option_text: "To provide information about a job interview", is_correct: true, option_order: 2 },
    { content_item_id: itemR3, option_key: "D", option_text: "To apologize for a scheduling error", is_correct: false, option_order: 3 },
  ]);

  // R4: Daily Life Email 1 - Website
  const itemR4 = "f5000000-0000-0000-0001-000000000004";
  await supabase.from("content_items").upsert({
    id: itemR4,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_daily_life",
    difficulty: "Medium",
    skill_tags: ["Email", "Detail"],
    payload: {
      title: "Read an email.",
      contextType: "email",
      emailHeader: { date: "September 21", subject: "Marketing Coordinator Interview" },
      passage: email1Text,
      prompt: "Why does the message mention a website?",
    },
    item_order: 3,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR4, option_key: "A", option_text: "To provide job requirements", is_correct: false, option_order: 0 },
    { content_item_id: itemR4, option_key: "B", option_text: "To give directions", is_correct: true, option_order: 1 },
    { content_item_id: itemR4, option_key: "C", option_text: "To schedule an appointment", is_correct: false, option_order: 2 },
    { content_item_id: itemR4, option_key: "D", option_text: "To answer an earlier question", is_correct: false, option_order: 3 },
  ]);

  // R5: Daily Life Email 2 - Purpose
  const email2Text =
    "Dear Mr. Thompson,\n\nI am writing about the upcoming training webinar on advanced project management techniques, which was originally scheduled for next Tuesday at 1:00 P.M. Due to a schedule conflict, the presenter has asked that the webinar be postponed until next Wednesday at the same time. We apologize for the inconvenience. If you cannot make the new date, please respond to this email and we will process a refund for you.\n\nThe webinar will give an introductory overview of topics such as risk management, resource allocation, and performance tracking. If there are specific questions that you would like to ask, please submit them to our training coordinator at least one day prior. Please ensure you have access to a computer with internet connectivity and functioning cameras and headphones to ensure participation during the interactive segments of the webinar.\n\nRegards,\nMaria Sanchez";

  const itemR5 = "f5000000-0000-0000-0001-000000000005";
  await supabase.from("content_items").upsert({
    id: itemR5,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_daily_life",
    difficulty: "Medium",
    skill_tags: ["Email", "Purpose"],
    payload: {
      title: "Read an email.",
      contextType: "email",
      passage: email2Text,
      prompt: "What is the main purpose of the email?",
    },
    item_order: 4,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR5, option_key: "A", option_text: "To announce changes to the management team", is_correct: false, option_order: 0 },
    { content_item_id: itemR5, option_key: "B", option_text: "To request details about a project", is_correct: false, option_order: 1 },
    { content_item_id: itemR5, option_key: "C", option_text: "To introduce a new webinar", is_correct: false, option_order: 2 },
    { content_item_id: itemR5, option_key: "D", option_text: "To provide information about a change to an event", is_correct: true, option_order: 3 },
  ]);

  // R6: Daily Life Email 2 - Participants
  const itemR6 = "f5000000-0000-0000-0001-000000000006";
  await supabase.from("content_items").upsert({
    id: itemR6,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_daily_life",
    difficulty: "Medium",
    skill_tags: ["Email", "Inference"],
    payload: {
      title: "Read an email.",
      contextType: "email",
      passage: email2Text,
      prompt: "What can be inferred about participants of the webinar?",
    },
    item_order: 5,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR6, option_key: "A", option_text: "They can view the webinar content offline.", is_correct: false, option_order: 0 },
    { content_item_id: itemR6, option_key: "B", option_text: "They work on the same team as Mr. Thompson.", is_correct: false, option_order: 1 },
    { content_item_id: itemR6, option_key: "C", option_text: "They requested that the webinar be delayed.", is_correct: false, option_order: 2 },
    { content_item_id: itemR6, option_key: "D", option_text: "They will have a chance to talk to others during the webinar.", is_correct: true, option_order: 3 },
  ]);

  // R7: Daily Life Email 2 - Coordinator
  const itemR7 = "f5000000-0000-0000-0001-000000000007";
  await supabase.from("content_items").upsert({
    id: itemR7,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_daily_life",
    difficulty: "Medium",
    skill_tags: ["Email", "Factual"],
    payload: {
      title: "Read an email.",
      contextType: "email",
      passage: email2Text,
      prompt: "The email suggests that, by next Tuesday, the training coordinator will",
    },
    item_order: 6,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR7, option_key: "A", option_text: "contact Mr. Thompson", is_correct: false, option_order: 0 },
    { content_item_id: itemR7, option_key: "B", option_text: "collect questions and give them to the presenter", is_correct: true, option_order: 1 },
    { content_item_id: itemR7, option_key: "C", option_text: "confirm computer and internet access", is_correct: false, option_order: 2 },
    { content_item_id: itemR7, option_key: "D", option_text: "host the webinar", is_correct: false, option_order: 3 },
  ]);

  // R8: Daily Life Text Chain - Carlos
  const textChainContent =
    "Sanjay Kapoor (9:00 A.M.): Hello team. The deadline for the software update is tomorrow. Ensure all testing is complete before submission.\n\nEmily Novak (9:05 A.M.): Sure thing. I was worried about how user-friendly the new software was going to be, but you should see the focus group reports!\n\nCarlos Mendez (9:10 A.M.): Good to hear, Emily. I will check the compatibility on different devices. I'll make sure it runs smoothly on all platforms.\n\nYuki Matsuda (9:15 A.M.): I can help with any critical issues that arise. I'll keep an eye on my inbox.\n\nSanjay Kapoor (9:20 A.M.): Sounds good, Yuki. Let's make sure deliver a flawless update.";

  const itemR8 = "f5000000-0000-0000-0001-000000000008";
  await supabase.from("content_items").upsert({
    id: itemR8,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_daily_life",
    difficulty: "Medium",
    skill_tags: ["Text Chain", "Detail"],
    payload: {
      title: "Read a text chain.",
      contextType: "phone_chat",
      passage: textChainContent,
      prompt: "What is Carlos's responsibility?",
    },
    item_order: 7,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR8, option_key: "A", option_text: "Finishing usability testing", is_correct: false, option_order: 0 },
    { content_item_id: itemR8, option_key: "B", option_text: "Checking device compatibility", is_correct: true, option_order: 1 },
    { content_item_id: itemR8, option_key: "C", option_text: "Emailing about last-minute issues", is_correct: false, option_order: 2 },
    { content_item_id: itemR8, option_key: "D", option_text: "Monitoring progress", is_correct: false, option_order: 3 },
  ]);

  // R9: Daily Life Text Chain - Yuki
  const itemR9 = "f5000000-0000-0000-0001-000000000009";
  await supabase.from("content_items").upsert({
    id: itemR9,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_daily_life",
    difficulty: "Medium",
    skill_tags: ["Text Chain", "Detail"],
    payload: {
      title: "Read a text chain.",
      contextType: "phone_chat",
      passage: textChainContent,
      prompt: "How will Yuki help out?",
    },
    item_order: 8,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR9, option_key: "A", option_text: "By preparing the final report", is_correct: false, option_order: 0 },
    { content_item_id: itemR9, option_key: "B", option_text: "By identifying suitable platforms", is_correct: false, option_order: 1 },
    { content_item_id: itemR9, option_key: "C", option_text: "By monitoring her inbox for urgent matters", is_correct: true, option_order: 2 },
    { content_item_id: itemR9, option_key: "D", option_text: "By reviewing a colleague's work", is_correct: false, option_order: 3 },
  ]);

  // Academic Passage: The Power of Music (Questions 10-14)
  const musicPassage =
    "Music has the remarkable ability to influence our emotions, behavior, and physical health. Studies show that listening to music can reduce stress, alleviate pain, and improve cognitive function. It is no surprise that music therapy has become an integral part of treatment for various conditions.\n\nMusic affects the brain by triggering the release of neurotransmitters such as dopamine and serotonin, which are associated with pleasure and mood regulation. Fast-paced music can energize us, while slower tempos can calm us down. This is why workout playlists often feature upbeat songs, while relaxation playlists include soothing melodies.\n\nBeyond personal well-being, music also plays a crucial role in social interactions. It can strengthen bonds, create a sense of unity, and influence social movements. Chanting and singing have been used in protests and rallies to motivate and unify participants. Despite its benefits, not all music has a positive impact. Loud and aggressive music can sometimes increase stress and anxiety levels. Understanding the power of music and its effects can help us make informed choices about what we listen to and how we use it in our daily lives.";

  // R10: The Power of Music - Alleviate
  const itemR10 = "f5000000-0000-0000-0001-000000000010";
  await supabase.from("content_items").upsert({
    id: itemR10,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_academic",
    difficulty: "Medium",
    skill_tags: ["Academic Reading", "Vocabulary"],
    payload: {
      title: "The Power of Music",
      passage: musicPassage,
      highlightedWord: "alleviate",
      prompt: "The word \"alleviate\" in the passage is closest in meaning to",
    },
    item_order: 9,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR10, option_key: "A", option_text: "delay", is_correct: false, option_order: 0 },
    { content_item_id: itemR10, option_key: "B", option_text: "ease", is_correct: true, option_order: 1 },
    { content_item_id: itemR10, option_key: "C", option_text: "monitor", is_correct: false, option_order: 2 },
    { content_item_id: itemR10, option_key: "D", option_text: "predict", is_correct: false, option_order: 3 },
  ]);

  // R11: The Power of Music - Neurotransmitters
  const itemR11 = "f5000000-0000-0000-0001-000000000011";
  await supabase.from("content_items").upsert({
    id: itemR11,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_academic",
    difficulty: "Medium",
    skill_tags: ["Academic Reading", "Author's Purpose"],
    payload: {
      title: "The Power of Music",
      passage: musicPassage,
      prompt: "Why does the author mention neurotransmitters?",
    },
    item_order: 10,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR11, option_key: "A", option_text: "To provide some examples of chemicals in our bodies", is_correct: false, option_order: 0 },
    { content_item_id: itemR11, option_key: "B", option_text: "To identify the mechanisms by which music influences pleasure and mood", is_correct: true, option_order: 1 },
    { content_item_id: itemR11, option_key: "C", option_text: "To explain how music increases physical health", is_correct: false, option_order: 2 },
    { content_item_id: itemR11, option_key: "D", option_text: "To imply that music affects social interactions", is_correct: false, option_order: 3 },
  ]);

  // R12: The Power of Music - Fast-paced
  const itemR12 = "f5000000-0000-0000-0001-000000000012";
  await supabase.from("content_items").upsert({
    id: itemR12,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_academic",
    difficulty: "Medium",
    skill_tags: ["Academic Reading", "Factual Information"],
    payload: {
      title: "The Power of Music",
      passage: musicPassage,
      prompt: "The passage suggests that fast-paced music might be included in workout playlists for which of the following reasons?",
    },
    item_order: 11,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR12, option_key: "A", option_text: "It helps to calm down the listener.", is_correct: false, option_order: 0 },
    { content_item_id: itemR12, option_key: "B", option_text: "It reduces stress levels.", is_correct: false, option_order: 1 },
    { content_item_id: itemR12, option_key: "C", option_text: "It energizes the listener.", is_correct: true, option_order: 2 },
    { content_item_id: itemR12, option_key: "D", option_text: "It improves cognitive function.", is_correct: false, option_order: 3 },
  ]);

  // R13: The Power of Music - Social Movements
  const itemR13 = "f5000000-0000-0000-0001-000000000013";
  await supabase.from("content_items").upsert({
    id: itemR13,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_academic",
    difficulty: "Medium",
    skill_tags: ["Academic Reading", "Inference"],
    payload: {
      title: "The Power of Music",
      passage: musicPassage,
      prompt: "What can be inferred about the use of music in social movements?",
    },
    item_order: 12,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR13, option_key: "A", option_text: "It helps to create a shared emotional experience among participants", is_correct: true, option_order: 0 },
    { content_item_id: itemR13, option_key: "B", option_text: "It distracts people from the goals of the movement", is_correct: false, option_order: 1 },
    { content_item_id: itemR13, option_key: "C", option_text: "It prevents protests from becoming violent", is_correct: false, option_order: 2 },
    { content_item_id: itemR13, option_key: "D", option_text: "It is only effective in small groups", is_correct: false, option_order: 3 },
  ]);

  // R14: The Power of Music - Paragraph Relationship
  const itemR14 = "f5000000-0000-0000-0001-000000000014";
  await supabase.from("content_items").upsert({
    id: itemR14,
    module_id: modR1Id,
    section_type: "reading",
    item_type: "read_academic",
    difficulty: "Medium",
    skill_tags: ["Academic Reading", "Text Structure"],
    payload: {
      title: "The Power of Music",
      passage: musicPassage,
      prompt: "What is the relationship between paragraphs 2 and 3?",
    },
    item_order: 13,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemR14, option_key: "A", option_text: "Paragraph 2 describes how music affects physical health, while Paragraph 3 focuses on the emotional benefits of music", is_correct: false, option_order: 0 },
    { content_item_id: itemR14, option_key: "B", option_text: "Paragraph 2 explains the scientific effects of music, while Paragraph 3 discusses how music influences social interactions", is_correct: true, option_order: 1 },
    { content_item_id: itemR14, option_key: "C", option_text: "Paragraph 2 explores the benefits of music in individual well-being, while Paragraph 3 examines its use in public settings", is_correct: false, option_order: 2 },
    { content_item_id: itemR14, option_key: "D", option_text: "Paragraph 2 explains the brain's reaction to music, while Paragraph 3 provides examples of music's social impact", is_correct: false, option_order: 3 },
  ]);

  // ==========================================
  // SECTION 2: LISTENING (10 Items)
  // ==========================================

  const listeningResponses = [
    {
      q: "How can I access my account?",
      speakerImg: "/images/speakers/student-female-1.jpg",
      gender: "female",
      options: [
        { key: "A", text: "You should try taking the bus.", correct: false },
        { key: "B", text: "I usually call Support.", correct: true },
        { key: "C", text: "It's easy for them.", correct: false },
        { key: "D", text: "You can read it to me now.", correct: false },
      ],
    },
    {
      q: "When will you have time to finish the report?",
      speakerImg: "/images/speakers/student-male-1.jpg",
      gender: "male",
      options: [
        { key: "A", text: "No need to cancel it.", correct: false },
        { key: "B", text: "No, it's the beginning.", correct: false },
        { key: "C", text: "I have nothing scheduled for Thursday.", correct: true },
        { key: "D", text: "You cannot tell the difference.", correct: false },
      ],
    },
    {
      q: "Why was the history class canceled?",
      speakerImg: "/images/speakers/student-male-1.jpg",
      gender: "male",
      options: [
        { key: "A", text: "The teacher is not feeling well.", correct: true },
        { key: "B", text: "I have other classes.", correct: false },
        { key: "C", text: "It's sometime in the afternoon.", correct: false },
        { key: "D", text: "The students have already arrived.", correct: false },
      ],
    },
    {
      q: "Would you like to try the appetizer special?",
      speakerImg: "/images/speakers/student-male-1.jpg",
      gender: "male",
      options: [
        { key: "A", text: "I brought a warm coat.", correct: false },
        { key: "B", text: "No, that bus already left.", correct: false },
        { key: "C", text: "What is it?", correct: true },
        { key: "D", text: "I might call him later.", correct: false },
      ],
    },
    {
      q: "Have you made progress on the report?",
      speakerImg: "/images/speakers/student-female-1.jpg",
      gender: "female",
      options: [
        { key: "A", text: "They ended yesterday.", correct: false },
        { key: "B", text: "No, not yet.", correct: true },
        { key: "C", text: "I don't remember why.", correct: false },
        { key: "D", text: "Yes, I have some for you here.", correct: false },
      ],
    },
    {
      q: "When is the deadline for the project?",
      speakerImg: "/images/speakers/student-female-1.jpg",
      gender: "female",
      options: [
        { key: "A", text: "Your plans were delayed.", correct: false },
        { key: "B", text: "I can't miss my train.", correct: false },
        { key: "C", text: "Two weeks isn't much time.", correct: false },
        { key: "D", text: "I'll have to get back to you on that.", correct: true },
      ],
    },
    {
      q: "How do I extend my hotel reservation?",
      speakerImg: "/images/speakers/student-male-1.jpg",
      gender: "male",
      options: [
        { key: "A", text: "Maybe one more day.", correct: false },
        { key: "B", text: "I think that's right.", correct: false },
        { key: "C", text: "Call the front desk.", correct: true },
        { key: "D", text: "It's a nice room.", correct: false },
      ],
    },
    {
      q: "How can I update my user profile?",
      speakerImg: "/images/speakers/student-female-1.jpg",
      gender: "female",
      options: [
        { key: "A", text: "First, go to Settings.", correct: true },
        { key: "B", text: "You can submit it tomorrow.", correct: false },
        { key: "C", text: "It's simpler than that.", correct: false },
        { key: "D", text: "Turn left at the stoplight.", correct: false },
      ],
    },
  ];

  for (let i = 0; i < listeningResponses.length; i++) {
    const item = listeningResponses[i];
    const itemId = `f5000000-0000-0000-0002-00000000000${i + 1}`;
    await supabase.from("content_items").upsert({
      id: itemId,
      module_id: modL1Id,
      section_type: "listening",
      item_type: "listen_choose_response",
      difficulty: "Medium",
      skill_tags: ["Short Response", "Listening Comprehension"],
      payload: {
        title: "Choose the best response.",
        stimulusText: item.q,
        imageUrl: item.speakerImg,
        speakerGender: item.gender,
        prompt: "Choose the best response.",
      },
      item_order: i,
    });

    const optRows = item.options.map((opt, oIdx) => ({
      content_item_id: itemId,
      option_key: opt.key,
      option_text: opt.text,
      is_correct: opt.correct,
      option_order: oIdx,
    }));
    await supabase.from("question_options").upsert(optRows);
  }

  // L9: Conversation - Janet's concert
  const itemL9 = "f5000000-0000-0000-0002-000000000009";
  const janetConvo =
    "Man: Hey, did you end up making it to Janet's concert last night?\nWoman: I was planning to go, but I got completely sidetracked helping my cousin move into her new apartment. It took way longer than expected.\nMan: That's too bad. It was incredible. She added a saxophonist to her band. You would have loved it.\nWoman: Ah, I knew I was missing something special. I hope she'll play again soon.\nMan: I think she'll be at the spring festival in a couple weeks, so don't make any other plan.";

  await supabase.from("content_items").upsert({
    id: itemL9,
    module_id: modL1Id,
    section_type: "listening",
    item_type: "listen_conversation",
    difficulty: "Medium",
    skill_tags: ["Campus Conversation", "Listening"],
    payload: {
      title: "Listen to a conversation.",
      imageUrl: "/images/student-female-listening.png",
      stimulusText: janetConvo,
      prompt: "Why was the woman unable to attend Janet's concert?",
    },
    item_order: 8,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemL9, option_key: "A", option_text: "She forgot the date of the concert.", is_correct: false, option_order: 0 },
    { content_item_id: itemL9, option_key: "B", option_text: "She had to assist a family member with moving.", is_correct: true, option_order: 1 },
    { content_item_id: itemL9, option_key: "C", option_text: "She had to study for a music examination.", is_correct: false, option_order: 2 },
    { content_item_id: itemL9, option_key: "D", option_text: "Her car broke down on the way to the hall.", is_correct: false, option_order: 3 },
  ]);

  // L10: Academic Lecture - Cultural Relativism
  const itemL10 = "f5000000-0000-0000-0002-000000000010";
  const sociologyTalk =
    "Cultural relativism is the idea that a person's beliefs and activities should be understood based on that person's own culture, rather than be judged against the criteria of another culture. This concept contrasts with ethnocentrism, which is the practice of evaluating other cultures according to the standards of one's own culture. Cultural relativism encourages us to view cultural practices in their own context. Practicing cultural relativism allows sociologists and anthropologists to gain a deeper understanding of how cultural practices shape societies. However, critics argue that it can lead to moral relativism, where all cultural practices are seen as equally valid, potentially excusing practices that violate human rights.";

  await supabase.from("content_items").upsert({
    id: itemL10,
    module_id: modL1Id,
    section_type: "listening",
    item_type: "listen_academic_talk",
    difficulty: "Medium",
    skill_tags: ["Academic Talk", "Sociology"],
    payload: {
      title: "Listen to a talk in a sociology class.",
      imageUrl: "/images/speakers/professor-male.jpg",
      speakerGender: "male",
      stimulusText: sociologyTalk,
      prompt: "What is the primary distinction between cultural relativism and ethnocentrism?",
    },
    item_order: 9,
  });
  await supabase.from("question_options").upsert([
    { content_item_id: itemL10, option_key: "A", option_text: "Cultural relativism evaluates cultures using universal criteria, whereas ethnocentrism focuses on diversity.", is_correct: false, option_order: 0 },
    { content_item_id: itemL10, option_key: "B", option_text: "Cultural relativism evaluates practices within their cultural context, whereas ethnocentrism judges others by one's own cultural standards.", is_correct: true, option_order: 1 },
    { content_item_id: itemL10, option_key: "C", option_text: "Cultural relativism ignores history, while ethnocentrism is rooted entirely in modern sociological research.", is_correct: false, option_order: 2 },
    { content_item_id: itemL10, option_key: "D", option_text: "Both concepts reject the idea of subjective morality in diverse human communities.", is_correct: false, option_order: 3 },
  ]);

  // ==========================================
  // SECTION 3: WRITING (12 Items)
  // ==========================================

  const sentences = [
    {
      partnerDialogue: "Were you able to complete the project on time?",
      prefix: "Unfortunately, I",
      target: "Unfortunately, I did not meet the deadline.",
      wordBank: ["did", "not", "the deadline", "meet", "no"],
    },
    {
      partnerDialogue: "How did he react to the presentation?",
      prefix: "Did he",
      target: "Did he tell you what his favorite part was?",
      wordBank: ["tell you", "what", "his favorite part", "was", "is"],
    },
    {
      partnerDialogue: "Did you enjoy the lecture?",
      prefix: "The content",
      target: "The content was not interesting to me.",
      wordBank: ["was", "not", "interesting", "to me", "for"],
    },
    {
      partnerDialogue: "What did your interviewer ask about?",
      prefix: "She",
      target: "She wanted to know what I do in my current position.",
      wordBank: ["wanted to know", "what I do", "in my", "current position", "doing"],
    },
    {
      partnerDialogue: "How did you find your missing keys?",
      prefix: "I retracted",
      target: "I retracted all of the steps that I took last night.",
      wordBank: ["all of", "the steps", "that I took", "last night", "taking"],
    },
    {
      partnerDialogue: "What did she ask when you returned?",
      prefix: "She wanted",
      target: "She wanted to know if I went anywhere interesting.",
      wordBank: ["to know", "if I went", "anywhere", "interesting", "where"],
    },
    {
      partnerDialogue: "Why did you leave the party early?",
      prefix: "I did",
      target: "I did not stay long enough to have fun.",
      wordBank: ["not stay", "long enough", "to have", "fun", "staying"],
    },
    {
      partnerDialogue: "Do you exercise regularly?",
      prefix: "I do",
      target: "I do not go to the gym on weekends.",
      wordBank: ["not go", "to the gym", "on", "weekends", "going"],
    },
    {
      partnerDialogue: "How do you compare your new job with the previous one?",
      prefix: "I found",
      target: "I found the work environment at this company to be much more relaxed.",
      wordBank: ["the work environment", "at this company", "to be", "much more relaxed", "relaxing"],
    },
    {
      partnerDialogue: "Are you coming to the dinner tonight?",
      prefix: "I am",
      target: "I am not able to attend due to a prior commitment.",
      wordBank: ["not able", "to attend", "due to", "a prior commitment", "committed"],
    },
  ];

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const sItemId = `f5000000-0000-0000-0003-${String(i + 1).padStart(12, "0")}`;
    await supabase.from("content_items").upsert({
      id: sItemId,
      module_id: modW1Id,
      section_type: "writing",
      item_type: "build_sentence",
      difficulty: "Medium",
      skill_tags: ["Grammar", "Syntax", "Sentence Building"],
      payload: {
        title: "Make an appropriate sentence.",
        prompt: s.partnerDialogue,
        sentencePrefix: s.prefix,
        targetSentence: s.target,
        wordBank: s.wordBank,
      },
      item_order: i,
    });
  }

  // W11: Write an Email (Jake)
  const itemW11 = "f5000000-0000-0000-0003-000000000011";
  await supabase.from("content_items").upsert({
    id: itemW11,
    module_id: modW1Id,
    section_type: "writing",
    item_type: "write_email",
    difficulty: "Medium",
    skill_tags: ["Email Writing", "Interpersonal Communication"],
    payload: {
      title: "Write an Email",
      context:
        "You are a university student working on a group project for one of your classes. One of your group members, Jake, has not been contributing to the project and has missed several meetings. This is affecting the progress of the project, and you need to address the issue with him.",
      prompt:
        "Write an email to Jake. In your email, do the following:\n• Describe the importance of the project.\n• Explain how his absence has affected the group's progress.\n• Suggest ways he can help the group.\n\nWrite as much as you can and in complete sentences.",
      recipient: "Jake",
      subject: "Need your contribution to the group project",
      modelAnswer:
        "Dear Jake,\nI hope you are doing well. I am writing because our group project is very important for our final grade in class. The project requires teamwork, research, and preparation from every member. Recently, you missed several meetings and did not complete your assigned tasks. Because of this, the rest of the group has faced delays and additional work, and we are worried about finishing the project on time.\nWe would really appreciate your support. You could help by attending the next meeting, completing your research section, and communicating with the group regularly. If you are having any problems, please let us know so we can help.\nI hope we can work together successfully.\nBest regards,\n[Your Name]",
    },
    item_order: 10,
  });

  // W12: Academic Discussion (Social Mobility)
  const itemW12 = "f5000000-0000-0000-0003-000000000012";
  await supabase.from("content_items").upsert({
    id: itemW12,
    module_id: modW1Id,
    section_type: "writing",
    item_type: "academic_discussion",
    difficulty: "Medium",
    skill_tags: ["Academic Discussion", "Argumentation"],
    payload: {
      title: "Academic Discussion",
      professor: {
        name: "Dr Gupta",
        role: "Professor of Psychology",
        imageUrl: "/images/speakers/professor-male.jpg",
        question:
          "For the past few classes, we have been discussing the concept of social mobility which refers to the ability of individuals or families to move up or down the social hierarchy. Some argue that education is the key to social mobility, while others believe that networking and personal connections are more important. Which viewpoint do you agree with? Why?",
      },
      studentPosts: [
        {
          name: "Kelly",
          imageUrl: "/images/speakers/student-female-1.jpg",
          comment:
            "I believe that education is the key to social mobility. With a good education, individuals can acquire the knowledge and skills needed to access better job opportunities and improve their social status. We have always been taught that education provides a foundation for long-term success and upward mobility.",
        },
        {
          name: "Andrew",
          imageUrl: "/images/speakers/student-male-1.jpg",
          comment:
            "In my opinion, networking and personal connections are more crucial for social mobility. Knowing the right people can open doors to opportunities that education alone might not provide. Therefore, personal connections can lead to job offers, mentorship, and other advantages that help individuals climb the social ladder.",
        },
      ],
      prompt:
        "Your professor is teaching a class on psychology. Write a post responding to the professor's question.\nIn your response, you should do the following.\n• Express and support your opinion.\n• Make a contribution to the discussion in your own words.\nAn effective response will contain at least 100 words.",
      modelAnswer:
        "After reading both opinions, I agree more with Kelly's viewpoint that education is the most important factor for social mobility. Although networking can create opportunities, education provides people with the skills and knowledge necessary for long-term success. A well-educated person is usually more qualified for professional jobs and can earn a higher income. In addition, education helps individuals develop confidence, critical thinking, and communication skills.",
    },
    item_order: 11,
  });

  // ==========================================
  // SECTION 4: SPEAKING (11 Items)
  // ==========================================

  const repetitions = [
    "Is this your first time at our museum?",
    "For modern art visit the eastern wing.",
    "Classical paintings are located on the 2nd floor.",
    "The new exhibit of self portraits is very popular.",
    "We offer group tours of gallery highlights at no extra charge.",
    "Unfortunately, the sculpture hall is currently under renovation.",
    "Our gift shop is running a special promotion on a wide selection of books.",
  ];

  for (let i = 0; i < repetitions.length; i++) {
    const repText = repetitions[i];
    const repItemId = `f5000000-0000-0000-0004-${String(i + 1).padStart(12, "0")}`;
    await supabase.from("content_items").upsert({
      id: repItemId,
      module_id: modS1Id,
      section_type: "speaking",
      item_type: "listen_repeat",
      difficulty: "Medium",
      skill_tags: ["Repetition", "Pronunciation"],
      payload: {
        title: "Listen and Repeat",
        context:
          "You are being trained to guide visitors in an art museum. Listen to your trainer and repeat what he says. Repeat only once.",
        targetSentence: repText,
        stimulusText: repText,
        speakerGender: "male",
        preparationSeconds: 0,
        responseLimitSeconds: 7,
      },
      item_order: i,
    });
  }

  // Interview Questions (4 items)
  const interviewQuestions = [
    {
      q: "Thank you for your participation. I have some questions about your outdoor activities. First, what kind of outdoor sports do you or your friends generally like to do? For example, do you like hiking, cycling, tennis, or other types of sport?",
      prep: 15,
      limit: 45,
    },
    {
      q: "Thank you. When you participate in your favorite outdoor activity, do you prefer to do it alone, or do you like to do it together with your family or friends? Why?",
      prep: 15,
      limit: 45,
    },
    {
      q: "Interesting. Next, I'd like to get your opinion. Where I live, outdoor activities are becoming increasingly popular. Do you think that in the place you live, the popularity of outdoor activities will increase in the future? Why or why not?",
      prep: 15,
      limit: 45,
    },
    {
      q: "Good points. I just have one more question. Some people believe that outdoor activities are essential for children's physical and mental health. Do you agree with this idea, or do you think indoor activities can be just as beneficial for children? Explain why you think so.",
      prep: 15,
      limit: 45,
    },
  ];

  for (let i = 0; i < interviewQuestions.length; i++) {
    const iv = interviewQuestions[i];
    const ivItemId = `f5000000-0000-0000-0004-${String(i + 8).padStart(12, "0")}`;
    await supabase.from("content_items").upsert({
      id: ivItemId,
      module_id: modS1Id,
      section_type: "speaking",
      item_type: "take_interview",
      difficulty: "Medium",
      skill_tags: ["Interview", "Oral Expression"],
      payload: {
        title: "Please answer the interviewer's question.",
        context:
          "You have volunteered for a research study about outdoor activities. You will have a short online interview with a researcher. The researcher will ask you some questions.",
        prompt: iv.q,
        stimulusText: iv.q,
        imageUrl: "/images/speakers/student-male-1.jpg",
        speakerGender: "male",
        preparationSeconds: iv.prep,
        responseLimitSeconds: iv.limit,
      },
      item_order: i + 7,
    });
  }

  console.log("Successfully seeded 100% Authentic TestGlider Moon Exam blueprint with 37 real items!");
}

if (process.argv[1]?.includes("seed-video-testglider-moon")) {
  seedTestGliderMoon().catch(console.error);
}
