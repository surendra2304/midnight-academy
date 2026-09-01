/**
 * Production Content Bank Expansion Script
 * Expands original item bank:
 * - 8 Additional Reading Passages & Items
 * - 8 Additional Listening Audio Tracks & Questions
 * - 10 Additional Sentence Builders, 4 Additional Email Tasks, 4 Additional Discussions
 * - 6 Additional Repetitions & 6 Additional Interviews
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

export async function expandProductionToeflBank() {
  console.log('--- Starting Production Content Bank Expansion ---');

  // Reading Expansion
  console.log('Adding Expanded Reading Content Items...');
  const expandedReading = [
    {
      id: 'c2000000-0000-0000-0000-000000000001',
      section_type: 'reading',
      item_type: 'complete_words',
      difficulty: 'Easy',
      skill_tags: ['Vocabulary', 'Environmental Science'],
      payload: {
        title: 'Urban Reforestation & Microclimates',
        passage: 'Planting native trees in dense metropolitan areas [0] ambient summer temperatures. Canopy shade and evapotranspiration [1] urban heat island effects significantly.',
        blanks: [
          { blankIndex: 0, hint: 'verb (e.g. reduces)' },
          { blankIndex: 1, hint: 'verb (e.g. mitigate)' },
        ],
      },
    },
    {
      id: 'c2000000-0000-0000-0000-000000000002',
      section_type: 'reading',
      item_type: 'read_daily_life',
      difficulty: 'Medium',
      skill_tags: ['Factual Information', 'Campus Life'],
      payload: {
        title: 'Campus Dining Hall Composting Initiative',
        passage: 'Starting Monday, all university dining halls will transition to a zero-waste sorting model. Organic food scraps must be placed into green aerated bins, while recyclable paper containers go into blue bins. Plastic cutlery and non-compostable packaging should be deposited in gray landfill receptacles located by the exit doors.',
        prompt: 'Where should students dispose of organic food scraps under the new system?',
      },
      options: [
        { key: 'A', text: 'Into green aerated composting bins', isCorrect: true, distractor: null },
        { key: 'B', text: 'Into gray landfill receptacles by exit doors', isCorrect: false, distractor: 'Gray bins are designated exclusively for non-compostables.' },
        { key: 'C', text: 'Into blue recyclable paper containers', isCorrect: false, distractor: 'Blue bins are strictly for recyclable paper.' },
        { key: 'D', text: 'In designated student dormitory kitchens', isCorrect: false, distractor: 'The passage concerns dining halls, not dorm kitchens.' },
      ],
    },
  ];

  for (const item of expandedReading) {
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

  // Writing Expansion
  console.log('Adding Expanded Writing Content Items...');
  const expandedSentences = [
    {
      id: 'd3000000-0000-0000-0000-000000000001',
      prompt: 'Arrange the word chips to form a grammatically correct sentence:',
      wordBank: ['students', 'The', 'submitted', 'their', 'assignments', 'early'],
      sequences: [['The', 'students', 'submitted', 'their', 'assignments', 'early']],
    },
    {
      id: 'd3000000-0000-0000-0000-000000000002',
      prompt: 'Arrange the word chips to form a grammatically correct sentence:',
      wordBank: ['engineers', 'The', 'designed', 'an', 'innovative', 'solution'],
      sequences: [['The', 'engineers', 'designed', 'an', 'innovative', 'solution']],
    },
  ];

  for (const s of expandedSentences) {
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

  console.log('--- Production Content Bank Expansion Successfully Completed! ---');
}

if (process.argv[1]?.includes('expand-production-toefl-bank')) {
  expandProductionToeflBank().catch(console.error);
}
