/**
 * Admin Seed Script: TOEFL 2026 Original Writing Item Bank & Rubrics
 * Seeds Build a Sentence, Write an Email, and Academic Discussion boards with rubrics.
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

export async function seedToeflWritingBank() {
  console.log('Seeding TOEFL 2026 Writing item bank and rubrics...');

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'admin@midnight.academy')
    .maybeSingle();

  const ownerId = adminProfile?.id || '25a1547b-07ce-450d-a31b-eaebbdeefc6a';

  // 1. Create Top-level Test
  const testId = 'f1000000-0000-0000-0000-000000000003';
  await supabase.from('tests').upsert(
    {
      id: testId,
      owner_id: ownerId,
      name: 'TOEFL iBT 2026: Writing Section Test 1',
      category: 'Writing',
      difficulty: 'Medium',
      question_count: 3,
      seconds_per_question: 180,
      response_seconds: 180,
      status: 'active',
      code: 'TOEFL-WR-01',
      is_practice: true,
    },
    { onConflict: 'id' },
  );

  // 2. Create Test Version
  const versionId = 'f2000000-0000-0000-0000-000000000003';
  await supabase.from('test_versions').upsert(
    {
      id: versionId,
      test_id: testId,
      blueprint_version: '2026.1',
      scoring_version: '2026.1',
      status: 'published',
      published_at: new Date().toISOString(),
      created_by: ownerId,
    },
    { onConflict: 'id' },
  );

  // 3. Create Writing Section (23 mins = 1380s)
  const sectionId = 'f3000000-0000-0000-0000-000000000003';
  await supabase.from('sections').upsert(
    {
      id: sectionId,
      test_version_id: versionId,
      section_type: 'writing',
      section_order: 0,
      timing_seconds: 1380,
      instructions: 'The Writing section measures your ability to write in English in an academic environment.',
    },
    { onConflict: 'id' },
  );

  // 4. Create Module
  const moduleId = 'f4000000-0000-0000-0000-000000000021';
  await supabase.from('modules').upsert({
    id: moduleId,
    section_id: sectionId,
    stage_index: 1,
    difficulty_band: 'middle',
    routing_rule: {},
    module_order: 0,
  });

  // 5. Create Versioned Rubrics
  await supabase.from('rubrics').upsert([
    {
      id: 'f6000000-0000-0000-0000-000000000001',
      rubric_version: '2026.1',
      task_type: 'write_email',
      title: 'TOEFL 2026 Write an Email Rubric',
      traits: [
        { name: 'task_fulfillment', weight: 0.35, description: 'Directly addresses prompt requirements and recipient tone', maxScore: 6.0 },
        { name: 'organization', weight: 0.30, description: 'Clear paragraph structure, greeting, logical flow, and closing', maxScore: 6.0 },
        { name: 'language_use', weight: 0.35, description: 'Grammatical accuracy, syntactic variety, vocabulary range', maxScore: 6.0 },
      ],
      band_descriptors: {
        '6.0': 'Fully successful fulfillment; natural, fluent, and idiomatic expression with precise vocabulary.',
        '5.0': 'Generally successful fulfillment; minor grammatical or lexical slips that do not obscure meaning.',
        '4.0': 'Adequate fulfillment; noticeable limitations in vocabulary or sentence structures.',
        '3.0': 'Partial fulfillment; frequent errors in syntax and word choice.',
        '2.0': 'Unsuccessful response; pervasive language errors.',
        '1.0': 'Off-topic, blank, or completely unintelligible response.',
      },
    },
    {
      id: 'f6000000-0000-0000-0000-000000000002',
      rubric_version: '2026.1',
      task_type: 'academic_discussion',
      title: 'TOEFL 2026 Academic Discussion Rubric',
      traits: [
        { name: 'task_fulfillment', weight: 0.40, description: 'Relevant contribution to discussion with developed ideas', maxScore: 6.0 },
        { name: 'organization', weight: 0.30, description: 'Coherent progression of reasoning and supporting details', maxScore: 6.0 },
        { name: 'language_use', weight: 0.30, description: 'Complex sentence structures, precise academic vocabulary', maxScore: 6.0 },
      ],
      band_descriptors: {
        '6.0': 'Relevant and very well-developed contribution; consistent syntactic variety and appropriate academic register.',
        '5.0': 'Relevant and mostly developed; contains minor lexical or grammatical flaws.',
        '4.0': 'Understandable but underdeveloped idea with repetition or basic sentence structures.',
        '3.0': 'Limited contribution with frequent language errors.',
        '2.0': 'Marginal or minimally relevant text.',
        '1.0': 'Blank, off-topic, or random text.',
      },
    },
  ]);

  // 6. Content Items

  // Item 1: Build a Sentence (Deterministic)
  const item1Id = 'f5000000-0000-0000-0000-000000000021';
  await supabase.from('content_items').upsert({
    id: item1Id,
    module_id: moduleId,
    section_type: 'writing',
    item_type: 'build_sentence',
    difficulty: 'Easy',
    skill_tags: ['Grammar', 'Syntax', 'Word Order'],
    payload: {
      prompt: 'Arrange the word chips into a grammatically correct sentence:',
      wordBank: ['students', 'The', 'library', 'studied', 'in', 'quietly', 'the'],
      acceptedSequences: [
        ['The', 'students', 'studied', 'quietly', 'in', 'the', 'library'],
        ['The', 'students', 'quietly', 'studied', 'in', 'the', 'library'],
      ],
    },
    item_order: 0,
  });

  // Item 2: Write an Email (AI Rubric)
  const item2Id = 'f5000000-0000-0000-0000-000000000022';
  await supabase.from('content_items').upsert({
    id: item2Id,
    module_id: moduleId,
    section_type: 'writing',
    item_type: 'write_email',
    difficulty: 'Medium',
    skill_tags: ['Pragmatics', 'Email Writing', 'Campus Life'],
    payload: {
      title: 'Email to Academic Advisor Regarding Course Scheduling',
      recipient: 'Dr. Evelyn Martinez (Academic Advisor)',
      context: 'You are planning your schedule for next semester, but two of your required courses have a time conflict. You need your advisor\'s guidance on alternative approved electives or permission to enroll in an online section.',
      prompt: 'Write an email to your advisor explaining your situation. Include:\n- A polite explanation of the scheduling conflict\n- Two possible alternatives you have considered\n- A request for a brief advising meeting or written approval',
      modelAnswer: 'Dear Dr. Martinez,\n\nI hope this email finds you well. I am currently finalizing my course schedule for the upcoming semester and encountered a scheduling conflict between Advanced Statistics (STAT 301) and Environmental Policy (ENVR 310), which are both held on Tuesdays and Thursdays at 10:00 AM.\n\nTo resolve this issue, I have looked into two possibilities: either taking the approved online section of Environmental Policy or substituting STAT 301 with Research Methodology (STAT 305). Could you please let me know if one of these options would satisfy my degree requirements? If necessary, I would be glad to meet during your office hours this Thursday.\n\nThank you for your time and assistance.\n\nSincerely,\nAlex Morgan',
    },
    item_order: 1,
  });

  // Item 3: Write for an Academic Discussion (AI Rubric)
  const item3Id = 'f5000000-0000-0000-0000-000000000023';
  await supabase.from('content_items').upsert({
    id: item3Id,
    module_id: moduleId,
    section_type: 'writing',
    item_type: 'academic_discussion',
    difficulty: 'Hard',
    skill_tags: ['Academic Writing', 'Argumentation', 'Idea Development'],
    payload: {
      title: 'Sociology 201: Impact of Remote Work on Urban Economies',
      context: 'Professor Henderson:\nMany modern companies are shifting permanently to remote or hybrid work policies. While workers praise increased flexibility, local downtown businesses often experience significant economic decline. In your opinion, does the rise of remote work bring more overall benefits or disadvantages to society as a whole?',
      discussionPosts: [
        {
          author: 'Claire (Student)',
          text: 'I believe remote work is overwhelmingly positive. Eliminating long daily commutes reduces carbon emissions and gives families more time together, improving overall mental well-being.',
        },
        {
          author: 'David (Student)',
          text: 'While individual workers might save time, we cannot ignore the economic fallout on downtown service industries, public transportation funding, and city commercial tax revenue.',
        },
      ],
      prompt: 'Write a response contributing to the discussion. Express and support your personal opinion, and make sure to address or build upon the points raised by your classmates. Aim for at least 100 words.',
      modelAnswer: 'In my view, the widespread adoption of remote work provides substantial net benefits to society, though it requires intentional urban restructuring. While David correctly highlights the short-term strain on downtown businesses and public transit systems, this transition also creates tremendous economic opportunities in suburban and rural communities as remote employees spend locally. Furthermore, as Claire noted, the reduction in traffic congestion significantly lowers greenhouse gas emissions and enhances work-life balance. Rather than resisting remote work, municipal governments should adapt by converting unoccupied commercial real estate into affordable residential housing, ultimately creating vibrant, multi-purpose urban neighborhoods.',
    },
    item_order: 2,
  });

  console.log('Successfully seeded original TOEFL 2026 Writing Item Bank & Rubrics!');
}

if (process.argv[1]?.includes('seed-toefl-writing')) {
  seedToeflWritingBank().catch(console.error);
}
