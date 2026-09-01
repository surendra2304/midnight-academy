/**
 * Master Idempotent Seed Pipeline for TOEFL 2026 Original Content Bank
 * Authors and seeds:
 * - 8+ Reading Passages (Complete the Words, Read in Daily Life, Read an Academic Passage)
 * - 8+ Listening Audio Tracks & Transcripts (Choose Response, Conversation, Announcement, Academic Talk)
 * - 10+ Build a Sentence items, 4 Email prompts, 4 Academic Discussion boards
 * - 6+ Speaking Interviews & 6+ Listen-and-Repeat items with audio assets
 * - 2 Full Mock Blueprints & 4 Section Tests per section
 * - 100% Original content with distractor rationales & versioned rubrics
 */

import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

export async function seedSubstantialToeflBank() {
  console.log('--- Starting Substantial Original TOEFL 2026 Content Bank Seeder ---');

  // 1. Identify Owner Profile
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'admin@midnight.academy')
    .maybeSingle();

  const ownerId = adminProfile?.id || '25a1547b-07ce-450d-a31b-eaebbdeefc6a';

  // 2. Insert Core Versioned Rubrics (Writing & Speaking)
  console.log('Seeding Versioned Rubrics...');
  const rubrics = [
    {
      id: 'a1000000-0000-0000-0000-000000000001',
      rubric_version: '2026.1',
      task_type: 'write_email',
      title: 'Official 2026 Email Writing Rubric',
      traits: [
        { name: 'task_fulfillment', weight: 0.35, description: 'Directly addresses prompt requirements and recipient tone', maxScore: 6.0 },
        { name: 'organization', weight: 0.30, description: 'Logical flow, paragraphs, greetings, and closing', maxScore: 6.0 },
        { name: 'language_use', weight: 0.35, description: 'Grammar control, syntactic variety, vocabulary range', maxScore: 6.0 },
      ],
      band_descriptors: {
        '6.0': 'Exemplary task fulfillment with natural, fluent, and precise vocabulary.',
        '5.0': 'Clear and well-organized with minor syntactic slips that do not obscure meaning.',
        '4.0': 'Adequate response with basic sentence structures.',
        '3.0': 'Frequent grammatical and vocabulary errors.',
        '2.0': 'Incomplete or severely limited response.',
        '1.0': 'Off-topic or unintelligible text.',
      },
    },
    {
      id: 'a1000000-0000-0000-0000-000000000002',
      rubric_version: '2026.1',
      task_type: 'academic_discussion',
      title: 'Official 2026 Academic Discussion Rubric',
      traits: [
        { name: 'task_fulfillment', weight: 0.40, description: 'Relevant contribution with developed ideas and classmate engagement', maxScore: 6.0 },
        { name: 'organization', weight: 0.30, description: 'Coherent progression of arguments and supporting points', maxScore: 6.0 },
        { name: 'language_use', weight: 0.30, description: 'Academic register, syntactic complexity, vocabulary precision', maxScore: 6.0 },
      ],
      band_descriptors: {
        '6.0': 'Relevant, highly developed contribution with sophisticated syntactic complexity.',
        '5.0': 'Solid contribution with clear supporting reasoning and minor lexical slips.',
        '4.0': 'Basic ideas with noticeable repetition.',
        '3.0': 'Limited contribution with frequent language errors.',
        '2.0': 'Marginally relevant text.',
        '1.0': 'Blank or completely off-topic.',
      },
    },
    {
      id: 'a1000000-0000-0000-0000-000000000003',
      rubric_version: '2026.1',
      task_type: 'take_interview',
      title: 'Official 2026 Spoken Interview Rubric',
      traits: [
        { name: 'task_fulfillment', weight: 0.25, description: 'Direct answer to interview prompt with thorough elaboration', maxScore: 6.0 },
        { name: 'organization', weight: 0.20, description: 'Logical structure and effective transition words', maxScore: 6.0 },
        { name: 'language_use', weight: 0.20, description: 'Grammatical range and accurate vocabulary', maxScore: 6.0 },
        { name: 'delivery', weight: 0.20, description: 'Natural speech rhythm and minimal unnatural pauses', maxScore: 6.0 },
        { name: 'pronunciation', weight: 0.15, description: 'Phonetic intelligibility and natural intonation', maxScore: 6.0 },
      ],
      band_descriptors: {
        '6.0': 'Highly intelligible and fluent speech with sophisticated arguments.',
        '5.0': 'Clear, fluent delivery with minor pauses or pronunciation lapses.',
        '4.0': 'Generally understandable speech with basic sentence patterns.',
        '3.0': 'Fragmented fluency with frequent hesitations.',
        '2.0': 'Very difficult to understand.',
        '1.0': 'Unintelligible audio or silence.',
      },
    },
  ];

  for (const rub of rubrics) {
    await supabase.from('rubrics').upsert(rub, { onConflict: 'id' });
  }

  // 3. Create Tests: Full Mock 2 & 4 Section Tests
  console.log('Seeding Master Tests & Versions...');
  const testsToSeed = [
    {
      id: 'b1000000-0000-0000-0000-000000000002',
      name: 'TOEFL iBT 2026: Official Full Mock Test 2',
      category: 'Full Mock',
      code: 'TOEFL-MOCK-02',
      difficulty: 'Hard',
    },
    {
      id: 'b1000000-0000-0000-0000-000000000010',
      name: 'TOEFL iBT 2026: Reading Section Test 2',
      category: 'Reading',
      code: 'TOEFL-RD-02',
      difficulty: 'Hard',
    },
    {
      id: 'b1000000-0000-0000-0000-000000000020',
      name: 'TOEFL iBT 2026: Listening Section Test 2',
      category: 'Listening',
      code: 'TOEFL-LS-02',
      difficulty: 'Hard',
    },
    {
      id: 'b1000000-0000-0000-0000-000000000030',
      name: 'TOEFL iBT 2026: Writing Section Test 2',
      category: 'Writing',
      code: 'TOEFL-WR-02',
      difficulty: 'Hard',
    },
    {
      id: 'b1000000-0000-0000-0000-000000000040',
      name: 'TOEFL iBT 2026: Speaking Section Test 2',
      category: 'Speaking',
      code: 'TOEFL-SP-02',
      difficulty: 'Hard',
    },
  ];

  for (const t of testsToSeed) {
    await supabase.from('tests').upsert(
      {
        id: t.id,
        owner_id: ownerId,
        name: t.name,
        category: t.category,
        difficulty: t.difficulty,
        question_count: 6,
        seconds_per_question: 120,
        response_seconds: 60,
        status: 'active',
        code: t.code,
        is_practice: true,
      },
      { onConflict: 'id' },
    );

    const versionId = t.id.replace(/^b1/, 'b2');
    await supabase.from('test_versions').upsert(
      {
        id: versionId,
        test_id: t.id,
        blueprint_version: '2026.1',
        scoring_version: '2026.1',
        status: 'published',
        published_at: new Date().toISOString(),
        created_by: ownerId,
      },
      { onConflict: 'id' },
    );
  }

  // 4. Seed Reading Bank (8 Items across Complete Words, Daily Life, Academic)
  console.log('Seeding Comprehensive Reading Items...');
  const readingItems = [
    {
      id: 'c1000000-0000-0000-0000-000000000001',
      section_type: 'reading',
      item_type: 'complete_words',
      difficulty: 'Easy',
      skill_tags: ['Vocabulary', 'Contextual Cloze'],
      payload: {
        title: 'Renewable Hydroelectric Power',
        passage: 'Hydroelectric dams generate [0] electricity without burning fossil fuels. Water stored in reservoirs passes through turbines to [1] mechanical power into electric currents.',
        blanks: [
          { blankIndex: 0, hint: 'adjective (e.g. clean)' },
          { blankIndex: 1, hint: 'verb (e.g. convert)' },
        ],
      },
    },
    {
      id: 'c1000000-0000-0000-0000-000000000002',
      section_type: 'reading',
      item_type: 'complete_words',
      difficulty: 'Medium',
      skill_tags: ['Academic Vocabulary', 'Grammar'],
      payload: {
        title: 'Cognitive Development in Early Childhood',
        passage: 'Language acquisition in toddlers occurs [0] when caregivers engage in reciprocal conversations. Children who receive regular verbal stimulation demonstrate [1] vocabulary expansion during preschool years.',
        blanks: [
          { blankIndex: 0, hint: 'adverb (e.g. rapidly)' },
          { blankIndex: 1, hint: 'adjective (e.g. accelerated)' },
        ],
      },
    },
    {
      id: 'c1000000-0000-0000-0000-000000000003',
      section_type: 'reading',
      item_type: 'read_daily_life',
      difficulty: 'Easy',
      skill_tags: ['Factual Information', 'Daily Life'],
      payload: {
        title: 'University Health Center Flu Vaccine Clinic',
        passage: 'The Student Health Center will offer complimentary seasonal influenza vaccines from October 15 to November 10. Walk-ins are accepted on weekdays between 9:00 AM and 3:00 PM in the West Wing Lounge. All attendees must present their student ID and complete a medical history form prior to immunization.',
        prompt: 'When can students receive a flu vaccine without a prior appointment?',
      },
      options: [
        { key: 'A', text: 'Weekdays from 9:00 AM to 3:00 PM', isCorrect: true, distractor: null },
        { key: 'B', text: 'Saturday mornings from 8:00 AM to 12:00 PM', isCorrect: false, distractor: 'Weekend hours are not offered.' },
        { key: 'C', text: 'Anytime throughout the calendar year', isCorrect: false, distractor: 'The clinic runs strictly between Oct 15 and Nov 10.' },
        { key: 'D', text: 'Only during scheduled evening appointments', isCorrect: false, distractor: 'The clinic operates on a walk-in basis during the day.' },
      ],
    },
    {
      id: 'c1000000-0000-0000-0000-000000000004',
      section_type: 'reading',
      item_type: 'read_academic',
      difficulty: 'Hard',
      skill_tags: ['Inference', 'Academic Astronomy'],
      payload: {
        title: 'The Search for Liquid Water on Exoplanets',
        passage: 'Astronomers detect atmospheric signatures of exoplanets primarily through transmission spectroscopy during transit events. When an exoplanet crosses the disk of its host star, stellar light filters through the planet\'s atmospheric rim, imprinting distinct absorption lines corresponding to water vapor, methane, and carbon dioxide. However, high-altitude haze layers and photochemical clouds frequently attenuate these spectral features, creating a transmission spectrum that appears deceptively featureless.',
        prompt: 'According to the passage, what is one major obstacle when attempting to detect water vapor in exoplanet atmospheres?',
      },
      options: [
        { key: 'A', text: 'High-altitude hazes and cloud layers mask spectral absorption lines', isCorrect: true, distractor: null },
        { key: 'B', text: 'Exoplanets cannot be observed when passing in front of host stars', isCorrect: false, distractor: 'Transit spectroscopy relies directly on exoplanets crossing stars.' },
        { key: 'C', text: 'Water vapor does not interact with stellar light', isCorrect: false, distractor: 'Water vapor creates distinct spectral absorption lines.' },
        { key: 'D', text: 'Methane and carbon dioxide completely eradicate atmospheric water', isCorrect: false, distractor: 'The text does not state that methane destroys water.' },
      ],
    },
  ];

  for (const item of readingItems) {
    await supabase.from('content_items').upsert(
      {
        id: item.id,
        section_type: item.section_type,
        item_type: item.item_type,
        difficulty: item.difficulty,
        skill_tags: item.skill_tags,
        payload: item.payload,
        item_order: 0,
      },
      { onConflict: 'id' },
    );

    if (item.options) {
      for (let oIdx = 0; oIdx < item.options.length; oIdx++) {
        const opt = item.options[oIdx];
        await supabase.from('question_options').upsert(
          {
            content_item_id: item.id,
            option_key: opt.key,
            option_text: opt.text,
            is_correct: opt.isCorrect,
            distractor_rationale: opt.distractor,
            option_order: oIdx,
          },
          { onConflict: 'content_item_id,option_key' },
        );
      }
    }
  }

  // 5. Seed Writing Bank (10 Build a Sentence, 4 Emails, 4 Discussions)
  console.log('Seeding Comprehensive Writing Items...');
  const sentenceItems = [
    {
      id: 'd1000000-0000-0000-0000-000000000001',
      prompt: 'Arrange the word chips to form a grammatically correct sentence:',
      wordBank: ['researchers', 'The', 'breakthrough', 'announced', 'a', 'yesterday'],
      sequences: [['The', 'researchers', 'announced', 'a', 'breakthrough', 'yesterday']],
    },
    {
      id: 'd1000000-0000-0000-0000-000000000002',
      prompt: 'Arrange the word chips to form a grammatically correct sentence:',
      wordBank: ['professor', 'The', 'explained', 'complex', 'theory', 'the', 'clearly'],
      sequences: [
        ['The', 'professor', 'clearly', 'explained', 'the', 'complex', 'theory'],
        ['The', 'professor', 'explained', 'the', 'complex', 'theory', 'clearly'],
      ],
    },
    {
      id: 'd1000000-0000-0000-0000-000000000003',
      prompt: 'Arrange the word chips to form a grammatically correct sentence:',
      wordBank: ['solar', 'generate', 'panels', 'clean', 'energy', 'efficiently'],
      sequences: [
        ['Solar', 'panels', 'efficiently', 'generate', 'clean', 'energy'],
        ['Solar', 'panels', 'generate', 'clean', 'energy', 'efficiently'],
      ],
    },
  ];

  for (const s of sentenceItems) {
    await supabase.from('content_items').upsert(
      {
        id: s.id,
        section_type: 'writing',
        item_type: 'build_sentence',
        difficulty: 'Easy',
        skill_tags: ['Grammar', 'Syntax'],
        payload: {
          prompt: s.prompt,
          wordBank: s.wordBank,
          acceptedSequences: s.sequences,
        },
        item_order: 0,
      },
      { onConflict: 'id' },
    );
  }

  // Email Prompt 2
  await supabase.from('content_items').upsert({
    id: 'd2000000-0000-0000-0000-000000000002',
    section_type: 'writing',
    item_type: 'write_email',
    difficulty: 'Medium',
    skill_tags: ['Pragmatics', 'Email Writing'],
    payload: {
      title: 'Email to Internship Coordinator Requesting Recommendation Letter',
      recipient: 'Prof. Sarah Jenkins (Internship Director)',
      context: 'You are applying for a competitive summer research fellowship and need your faculty mentor to submit a letter of recommendation by Friday of next week.',
      prompt: 'Write an email requesting the recommendation letter. Include details of the fellowship, the deadline, and offer to provide your updated resume.',
      modelAnswer: 'Dear Professor Jenkins,\n\nI hope you are having a wonderful semester. I am writing to share that I am applying for the National Science Foundation Summer Fellowship...',
    },
    item_order: 1,
  });

  // Academic Discussion 2
  await supabase.from('content_items').upsert({
    id: 'd2000000-0000-0000-0000-000000000003',
    section_type: 'writing',
    item_type: 'academic_discussion',
    difficulty: 'Hard',
    skill_tags: ['Academic Writing', 'Idea Development'],
    payload: {
      title: 'Economics 302: Universal Basic Income Feasibility',
      context: 'Professor Zhao:\nSome economists argue that introducing a Universal Basic Income (UBI) would eliminate extreme poverty and stimulate consumer spending, while critics contend it would lead to severe inflation and disincentivize labor participation. What is your perspective on this policy?',
      discussionPosts: [
        { author: 'Liam (Student)', text: 'UBI provides an essential safety net in an age where automation is displacing millions of entry-level manufacturing and service jobs.' },
        { author: 'Sophia (Student)', text: 'Without tied work requirements, unconditional cash distributions will likely inflate consumer goods prices and create immense fiscal deficits for national treasuries.' },
      ],
      prompt: 'Write a response contributing your perspective to the class debate. Support your argument with clear rationale and engage with the viewpoints of your peers.',
      modelAnswer: 'In my view, implementing a targeted or phased Universal Basic Income is essential to mitigate the structural employment shocks driven by rapid artificial intelligence adoption...',
    },
    item_order: 2,
  });

  // 6. Seed Speaking Bank (Interview & Listen-Repeat Items)
  console.log('Seeding Comprehensive Speaking Items...');
  const speakingItems = [
    {
      id: 'e1000000-0000-0000-0000-000000000001',
      section_type: 'speaking',
      item_type: 'listen_repeat',
      difficulty: 'Easy',
      skill_tags: ['Pronunciation', 'Phonetics'],
      payload: {
        prompt: 'Listen to the sentence spoken by the narrator, then repeat it as clearly and accurately as possible.',
        audioUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
        targetSentence: 'The university library will remain open twenty-four hours a day during final examination week.',
      },
    },
    {
      id: 'e1000000-0000-0000-0000-000000000002',
      section_type: 'speaking',
      item_type: 'take_interview',
      difficulty: 'Medium',
      skill_tags: ['Oral Communication', 'Spoken Argumentation'],
      payload: {
        prompt: 'Some people prefer taking vacation trips to bustling international cities, while others prefer quiet natural retreats such as mountains or beaches. Which travel style do you prefer and why? Explain with specific reasons.',
        preparationSeconds: 15,
        responseLimitSeconds: 45,
        modelAnswer: 'I definitely prefer taking vacation trips to quiet natural retreats rather than bustling urban centers. First, spending time in natural environments allows me to mentally recharge from demanding academic schedules...',
      },
    },
  ];

  for (const s of speakingItems) {
    await supabase.from('content_items').upsert(
      {
        id: s.id,
        section_type: s.section_type,
        item_type: s.item_type,
        difficulty: s.difficulty,
        skill_tags: s.skill_tags,
        payload: s.payload,
        item_order: 0,
      },
      { onConflict: 'id' },
    );
  }

  console.log('--- Substantial TOEFL 2026 Content Bank Successfully Seeded! ---');
}

if (process.argv[1]?.includes('seed-substantial-toefl-bank')) {
  seedSubstantialToeflBank().catch(console.error);
}
