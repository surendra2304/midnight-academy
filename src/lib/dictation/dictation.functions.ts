/**
 * Server Functions for Dictation Practice Mode
 * Handles fetching dictation practice items, evaluating typing responses with word-diff,
 * recording metrics, and generating AI diagnostic explanations using Gemini.
 */

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { computeWordDiff, type DictationScoreResult } from './word-diff-engine';

export interface DictationItem {
  id: string;
  sentence: string;
  audioUrl?: string;
  topic: string;
  difficulty: 'lower' | 'middle' | 'upper';
  contextNote?: string;
  skillTags: string[];
}

export interface DictationSubmissionResult {
  score: DictationScoreResult;
  referenceSentence: string;
  studentAnswer: string;
  aiExplanation?: string;
}

// Built-in 30+ Original Multi-Domain Dictation Bank
export const SEEDED_DICTATION_BANK: DictationItem[] = [
  // Lower Band (Daily Life & Campus Basics)
  {
    id: 'dict-001',
    sentence: 'The student center remains open until eleven tonight.',
    topic: 'Campus Facility',
    difficulty: 'lower',
    contextNote: 'Campus hours announcement',
    skillTags: ['listening_accuracy', 'numbers_and_time'],
  },
  {
    id: 'dict-002',
    sentence: 'Please show your university identification card at the entrance.',
    topic: 'Campus Security',
    difficulty: 'lower',
    contextNote: 'Building entry instructions',
    skillTags: ['listening_accuracy', 'campus_vocabulary'],
  },
  {
    id: 'dict-003',
    sentence: 'The cafeteria will introduce new vegetarian options next semester.',
    topic: 'Campus Dining',
    difficulty: 'lower',
    contextNote: 'Meal program update',
    skillTags: ['listening_accuracy', 'future_tense'],
  },
  {
    id: 'dict-004',
    sentence: 'Remember to return the borrowed textbooks before Friday afternoon.',
    topic: 'Library Services',
    difficulty: 'lower',
    contextNote: 'Library circulation reminder',
    skillTags: ['listening_accuracy', 'dates_and_times'],
  },
  {
    id: 'dict-005',
    sentence: 'Our study group meets every Tuesday in room three hundred.',
    topic: 'Academic Life',
    difficulty: 'lower',
    contextNote: 'Peer study schedule',
    skillTags: ['listening_accuracy', 'numbers_and_time'],
  },
  {
    id: 'dict-006',
    sentence: 'You can download the course syllabus from the department website.',
    topic: 'Course Materials',
    difficulty: 'lower',
    contextNote: 'Online portal guidance',
    skillTags: ['listening_accuracy', 'technology'],
  },
  {
    id: 'dict-007',
    sentence: 'The shuttle bus arrives outside the main dormitory every twenty minutes.',
    topic: 'Transportation',
    difficulty: 'lower',
    contextNote: 'Campus transit schedule',
    skillTags: ['listening_accuracy', 'weak_forms'],
  },
  {
    id: 'dict-008',
    sentence: 'All laboratory safety goggles must be worn during the chemistry experiment.',
    topic: 'Science Lab',
    difficulty: 'lower',
    contextNote: 'Lab safety briefing',
    skillTags: ['listening_accuracy', 'passive_voice'],
  },
  {
    id: 'dict-009',
    sentence: 'The career fair provides direct networking opportunities with international employers.',
    topic: 'Career Guidance',
    difficulty: 'lower',
    contextNote: 'Professional event notice',
    skillTags: ['listening_accuracy', 'connected_speech'],
  },
  {
    id: 'dict-010',
    sentence: 'Students who submit their papers early will receive helpful feedback.',
    topic: 'Academic Writing',
    difficulty: 'lower',
    contextNote: 'Professor grading policy',
    skillTags: ['listening_accuracy', 'relative_clauses'],
  },

  // Middle Band (Intermediate Discussions & Lectures)
  {
    id: 'dict-011',
    sentence: 'Recent archaeological findings challenge previous assumptions regarding early agricultural settlements.',
    topic: 'Archaeology',
    difficulty: 'middle',
    contextNote: 'Academic history lecture',
    skillTags: ['listening_accuracy', 'academic_vocabulary'],
  },
  {
    id: 'dict-012',
    sentence: 'Photosynthesis converts solar energy into chemical compounds through complex biochemical reactions.',
    topic: 'Biology',
    difficulty: 'middle',
    contextNote: 'Introductory biology talk',
    skillTags: ['listening_accuracy', 'scientific_terms'],
  },
  {
    id: 'dict-013',
    sentence: 'Urban development plans should balance economic expansion with environmental preservation.',
    topic: 'Urban Planning',
    difficulty: 'middle',
    contextNote: 'Public policy seminar',
    skillTags: ['listening_accuracy', 'modal_verbs'],
  },
  {
    id: 'dict-014',
    sentence: 'The statistical analysis revealed a strong correlation between sleep patterns and cognitive performance.',
    topic: 'Psychology',
    difficulty: 'middle',
    contextNote: 'Behavioral research findings',
    skillTags: ['listening_accuracy', 'academic_vocabulary'],
  },
  {
    id: 'dict-015',
    sentence: 'Volcanic eruptions release significant quantities of sulfur dioxide into the upper atmosphere.',
    topic: 'Geology',
    difficulty: 'middle',
    contextNote: 'Earth science discussion',
    skillTags: ['listening_accuracy', 'weak_forms'],
  },
  {
    id: 'dict-016',
    sentence: 'Renaissance artists utilized innovative geometric perspectives to produce realistic visual depths.',
    topic: 'Art History',
    difficulty: 'middle',
    contextNote: 'Art appreciation class',
    skillTags: ['listening_accuracy', 'historical_terms'],
  },
  {
    id: 'dict-017',
    sentence: 'Economists predict that interest rate adjustments will stimulate capital investment in technology.',
    topic: 'Economics',
    difficulty: 'middle',
    contextNote: 'Macroeconomics overview',
    skillTags: ['listening_accuracy', 'financial_terms'],
  },
  {
    id: 'dict-018',
    sentence: 'Migratory marine species navigate ocean currents by detecting natural magnetic field variations.',
    topic: 'Marine Biology',
    difficulty: 'middle',
    contextNote: 'Animal navigation mechanisms',
    skillTags: ['listening_accuracy', 'elision_sounds'],
  },
  {
    id: 'dict-019',
    sentence: 'Renewable energy generation requires substantial initial investment in modern power grid infrastructure.',
    topic: 'Environmental Science',
    difficulty: 'middle',
    contextNote: 'Sustainability lecture',
    skillTags: ['listening_accuracy', 'connected_speech'],
  },
  {
    id: 'dict-020',
    sentence: 'The peer review committee evaluated the grant proposal with extreme methodological rigor.',
    topic: 'Academic Publishing',
    difficulty: 'middle',
    contextNote: 'Research methodology seminar',
    skillTags: ['listening_accuracy', 'academic_vocabulary'],
  },

  // Upper Band (Advanced Academic Discourse & Fast Connected Speech)
  {
    id: 'dict-021',
    sentence: 'Epistemological distinctions between empirical observation and theoretical deduction remain fundamental in modern philosophy.',
    topic: 'Philosophy',
    difficulty: 'upper',
    contextNote: 'Advanced philosophy seminar',
    skillTags: ['listening_accuracy', 'complex_syntax', 'academic_vocabulary'],
  },
  {
    id: 'dict-022',
    sentence: 'Gravitational lensing provides compelling empirical evidence for the existence of non-luminous dark matter.',
    topic: 'Astrophysics',
    difficulty: 'upper',
    contextNote: 'Cosmology colloquium',
    skillTags: ['listening_accuracy', 'scientific_terms', 'weak_forms'],
  },
  {
    id: 'dict-023',
    sentence: 'Sociolinguistic variations among demographic subgroups demonstrate how linguistic norms evolve through cultural interaction.',
    topic: 'Linguistics',
    difficulty: 'upper',
    contextNote: 'Linguistics research paper',
    skillTags: ['listening_accuracy', 'complex_syntax'],
  },
  {
    id: 'dict-024',
    sentence: 'Thermodynamic equilibrium in closed ecological systems cannot be sustained without continuous external energy dissipation.',
    topic: 'Thermodynamics',
    difficulty: 'upper',
    contextNote: 'Advanced physics lecture',
    skillTags: ['listening_accuracy', 'scientific_terms'],
  },
  {
    id: 'dict-025',
    sentence: 'Comparative constitutional jurisprudence highlights how institutional checks and balances mitigate sovereign overreach.',
    topic: 'Constitutional Law',
    difficulty: 'upper',
    contextNote: 'Legal theory debate',
    skillTags: ['listening_accuracy', 'legal_terms', 'connected_speech'],
  },
  {
    id: 'dict-026',
    sentence: 'Neuroplasticity enables neural pathways to reorganize dynamically in response to systemic physiological stimuli.',
    topic: 'Neuroscience',
    difficulty: 'upper',
    contextNote: 'Cognitive science symposium',
    skillTags: ['listening_accuracy', 'scientific_terms'],
  },
  {
    id: 'dict-027',
    sentence: 'Algorithmic efficiency in large-scale distributed computing depends critically upon minimizing inter-node latency bottlenecks.',
    topic: 'Computer Science',
    difficulty: 'upper',
    contextNote: 'Systems engineering discourse',
    skillTags: ['listening_accuracy', 'technology', 'fast_speech'],
  },
  {
    id: 'dict-028',
    sentence: 'Paleoclimatic ice-core samples reveal unprecedented atmospheric greenhouse gas concentrations over millennial timescales.',
    topic: 'Climatology',
    difficulty: 'upper',
    contextNote: 'Climate change symposium',
    skillTags: ['listening_accuracy', 'scientific_terms'],
  },
  {
    id: 'dict-029',
    sentence: 'Post-structuralist literary criticism deconstructs binary oppositions embedded within conventional canonical narratives.',
    topic: 'Literary Theory',
    difficulty: 'upper',
    contextNote: 'Graduate literature seminar',
    skillTags: ['listening_accuracy', 'humanities_terms'],
  },
  {
    id: 'dict-030',
    sentence: 'Biomedical nanotechnology facilitates targeted pharmacological delivery while attenuating unintended collateral cytotoxicity.',
    topic: 'Nanomedicine',
    difficulty: 'upper',
    contextNote: 'Pharmacology conference',
    skillTags: ['listening_accuracy', 'scientific_terms', 'complex_syntax'],
  },
];

/**
 * Fetch dictation practice items
 */
export const getDictationItems = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        difficulty: z.enum(['all', 'lower', 'middle', 'upper']).optional(),
        limit: z.number().int().positive().optional(),
      })
      .optional()
      .parse(data || {}),
  )
  .handler(async ({ data }) => {
    let items = [...SEEDED_DICTATION_BANK];
    if (data?.difficulty && data.difficulty !== 'all') {
      items = items.filter((i) => i.difficulty === data.difficulty);
    }
    const limit = data?.limit || 30;
    return items.slice(0, limit);
  });

/**
 * Submit student dictation typing and calculate word diff with AI explanation
 */
export const submitDictationAttempt = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        itemId: z.string(),
        studentAnswer: z.string(),
        requestAiExplanation: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<DictationSubmissionResult> => {
    const item = SEEDED_DICTATION_BANK.find((i) => i.id === data.itemId);
    const referenceSentence = item ? item.sentence : 'The library will extend its operating hours.';

    // 1. Calculate deterministic word diff
    const score = computeWordDiff(data.studentAnswer, referenceSentence);

    // 2. Generate natural language AI explanation if student had errors and requested feedback
    let aiExplanation: string | undefined;

    if (data.requestAiExplanation && !score.isPerfectMatch && score.wrongWordCount + score.missingWordCount > 0) {
      try {
        const { chatText } = await import('@/lib/ai.server');
        const prompt = [
          'You are a standardized English phonetics and listening coach.',
          `REFERENCE SENTENCE: "${referenceSentence}"`,
          `STUDENT TYPED: "${data.studentAnswer}"`,
          'Explain in 1-2 friendly, precise coaching sentences why the student likely misheard those specific sounds, weak forms, contractions, or connected speech reductions.',
        ].join('\n\n');

        const aiResponse = await chatText([
          { role: 'system', content: 'You are an expert English listening pronunciation tutor.' },
          { role: 'user', content: prompt },
        ]);

        if (aiResponse && aiResponse.trim().length > 0) {
          aiExplanation = aiResponse.trim();
        }
      } catch {
        // Fallback rule-based explanation
        aiExplanation = 'Pay attention to unstressed syllables, weak forms (like "of", "to", "and"), and fast-speech reductions in academic lectures.';
      }
    }

    return {
      score,
      referenceSentence,
      studentAnswer: data.studentAnswer,
      aiExplanation,
    };
  });
