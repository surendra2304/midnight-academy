/**
 * Lessons & Strategy Guides Service
 * Manages 4 Section Masterclasses + 12 Task-Type Strategy Guides, user completion states,
 * and weakness-driven lesson recommendations.
 */

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { ToeflSectionType, ToeflItemType } from '@/types/toefl';

export interface LessonItem {
  id: string;
  slug: string;
  title: string;
  section: ToeflSectionType;
  taskType?: ToeflItemType | 'overview';
  estimatedMinutes: number;
  format: 'text' | 'video' | 'interactive';
  summary: string;
  contentMarkdown: string;
  order: number;
  published: boolean;
}

export interface UserLessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

// In-memory completion store for session state
const userLessonStore: Map<string, Set<string>> = new Map();

// 16 Comprehensive Original Strategy Guides & Section Masterclasses
export const SEEDED_LESSONS: LessonItem[] = [
  // Section 1: Reading Overviews & Task Types
  {
    id: 'les-read-overview',
    slug: 'reading-section-masterclass',
    title: 'Reading Section Masterclass: Structure, Pacing & Scoring',
    section: 'reading',
    taskType: 'overview',
    estimatedMinutes: 15,
    format: 'text',
    summary: 'Comprehensive overview of the adaptive reading section, scoring bands, and time management strategies.',
    contentMarkdown: `## Reading Section Overview
The Reading section tests your ability to comprehend authentic university-level texts across physical sciences, social sciences, arts, and daily campus announcements.

### Key Dimensions Scored:
1. **Factual Information & Detail Capture**: Locating explicit assertions without falling for distractor paraphrases.
2. **Inference & Rhetorical Purpose**: Understanding *why* an author mentions a specific piece of evidence.
3. **Vocabulary in Context**: Discerning exact semantic meaning based on surrounding discourse markers.

### Recommended Pacing Strategy:
- **Foundational Items (Complete the Words)**: 30–45 seconds per sentence.
- **Daily Life Passages**: 60–90 seconds per passage.
- **Academic Passages**: 90–120 seconds per paragraph synthesis.`,
    order: 1,
    published: true,
  },
  {
    id: 'les-task-complete-words',
    slug: 'complete-the-words-strategy',
    title: 'Complete the Words: Contextual Morphology & Syntax',
    section: 'reading',
    taskType: 'complete_words',
    estimatedMinutes: 10,
    format: 'text',
    summary: 'Step-by-step strategy for identifying missing word roots, prefixes, and suffixes in paragraph blanks.',
    contentMarkdown: `## Strategy: Complete the Words
This task type measures your vocabulary breadth and syntactic intuition by having you fill in partial word roots.

### 4-Step Method:
1. **Identify the Part of Speech**: Determine whether the blank requires a noun, verb, adjective, or adverb based on adjacent sentence structures.
2. **Scan for Grammatical Collocations**: Look at prepositions (*depend on*, *contribute to*) and auxiliary verbs.
3. **Check Plurality & Tense**: Ensure verb agreement and noun plurality fit the surrounding context.
4. **Read Aloud Subvocally**: Verify that the completed sentence sounds natural and grammatically fluid.`,
    order: 2,
    published: true,
  },
  {
    id: 'les-task-read-daily-life',
    slug: 'read-daily-life-strategy',
    title: 'Read in Daily Life: Notices, Schedules & Pragmatics',
    section: 'reading',
    taskType: 'read_daily_life',
    estimatedMinutes: 12,
    format: 'text',
    summary: 'How to quickly parse bulletin boards, policy updates, and email notices with 100% accuracy.',
    contentMarkdown: `## Strategy: Read in Daily Life
Daily Life reading items present campus announcements, facility hours, and club flyers.

### Critical Traps to Avoid:
- **Assuming Outside Knowledge**: Answer strictly using facts explicitly stated in the notice.
- **Overlooking Exceptions**: Watch for qualifying words like *unless*, *except*, *provided that*, and *subject to change*.
- **Temporal Confusion**: Carefully distinguish between registration deadlines, effective dates, and event start times.`,
    order: 3,
    published: true,
  },
  {
    id: 'les-task-read-academic',
    slug: 'read-academic-passage-strategy',
    title: 'Read an Academic Passage: Paragraph Mapping & Inferences',
    section: 'reading',
    taskType: 'read_academic',
    estimatedMinutes: 15,
    format: 'text',
    summary: 'Mastering dense multi-paragraph academic texts with fast paragraph mapping and topic sentence tracking.',
    contentMarkdown: `## Strategy: Academic Reading Passages
Academic passages cover scientific history, biology, geology, and sociology.

### Paragraph Mapping Technique:
- **First Sentence**: Always states the primary sub-claim or introduces an empirical phenomenon.
- **Middle Sentences**: Contain supporting experiments, dates, and historical data.
- **Transition Words**: Note pivot words (*however, consequently, in contrast*) which indicate author stance shifts.`,
    order: 4,
    published: true,
  },

  // Section 2: Listening Overviews & Task Types
  {
    id: 'les-list-overview',
    slug: 'listening-section-masterclass',
    title: 'Listening Section Masterclass: Acoustic Cues & Note-Taking',
    section: 'listening',
    taskType: 'overview',
    estimatedMinutes: 15,
    format: 'text',
    summary: 'Master conversational turn-taking, lecture hierarchy, and note-taking abbreviations.',
    contentMarkdown: `## Listening Section Overview
Listening evaluates your comprehension of spoken English in academic lectures, campus conversations, and public announcements.

### Note-Taking Shorthand:
- Use symbols: \`+\` (and), \`->\` (causes/leads to), \`^\` (increases), \`v\` (decreases), \`?\` (uncertainty).
- Write keywords only (nouns, verbs, negative particles), never full sentences.
- Focus on tone shifts and professor rhetorical questions.`,
    order: 5,
    published: true,
  },
  {
    id: 'les-task-listen-choose',
    slug: 'listen-and-choose-response-strategy',
    title: 'Listen and Choose Response: Conversational Pragmatics',
    section: 'listening',
    taskType: 'listen_choose_response',
    estimatedMinutes: 10,
    format: 'text',
    summary: 'Predicting natural, idiomatic conversational replies in rapid student-professor exchanges.',
    contentMarkdown: `## Strategy: Listen & Choose Response
You hear a short conversational prompt and must pick the most socially appropriate and direct response.

### Golden Rules:
1. Match the communicative intent (clarification, apology, agreement, suggestion).
2. Beware of literal sound-alikes that twist the context.
3. Reject answers that ignore the speaker's question.`,
    order: 6,
    published: true,
  },
  {
    id: 'les-task-listen-conversation',
    slug: 'listen-conversation-strategy',
    title: 'Campus Conversations: Problem-Solution Dynamics',
    section: 'listening',
    taskType: 'listen_conversation',
    estimatedMinutes: 12,
    format: 'text',
    summary: 'Tracking the student problem, advisor recommendations, and final action items.',
    contentMarkdown: `## Strategy: Campus Conversations
Conversations typically involve a student consulting a professor, housing director, or registrar.

### Structure Breakdown:
- **Opening**: The student explains their immediate problem or confusion.
- **Middle**: The staff member asks clarifying questions and offers 2–3 options.
- **Closing**: The student decides on a specific next step.`,
    order: 7,
    published: true,
  },
  {
    id: 'les-task-listen-announcement',
    slug: 'listen-announcement-strategy',
    title: 'Campus Announcements: Key Event Information',
    section: 'listening',
    taskType: 'listen_announcement',
    estimatedMinutes: 10,
    format: 'text',
    summary: 'Extracting times, locations, eligibility rules, and procedural instructions.',
    contentMarkdown: `## Strategy: Public Campus Announcements
Short audio broadcasts regarding library maintenance, exam room changes, or guest lecture cancellations.

### Focus Checklist:
- What changed?
- Who is affected?
- What action must students take?`,
    order: 8,
    published: true,
  },
  {
    id: 'les-task-listen-academic-talk',
    slug: 'listen-academic-talk-strategy',
    title: 'Academic Lectures: Main Idea, Organization & Attitude',
    section: 'listening',
    taskType: 'listen_academic_talk',
    estimatedMinutes: 15,
    format: 'text',
    summary: 'Deconstructing complex 4-minute university lectures across astronomy, history, and botany.',
    contentMarkdown: `## Strategy: Academic Lectures
Lectures require tracking technical concepts, comparative theories, and professor opinions.

### Lecture Signposts:
- "Let's back up for a second..." -> Signals a crucial definition or qualification.
- "Now, why does this matter?" -> Precedes the central exam takeaway.
- "Interestingly enough..." -> Highlights a surprising research finding.`,
    order: 9,
    published: true,
  },

  // Section 3: Writing Overviews & Task Types
  {
    id: 'les-write-overview',
    slug: 'writing-section-masterclass',
    title: 'Writing Section Masterclass: Cohesion, Grammar & Band 6.0 Rubrics',
    section: 'writing',
    taskType: 'overview',
    estimatedMinutes: 15,
    format: 'text',
    summary: 'The criteria required to achieve a top band 5.5–6.0 on email correspondence and academic discussions.',
    contentMarkdown: `## Writing Section Overview
The Writing section measures sentence construction, email etiquette, and academic argumentative debate.

### Scoring Axes:
1. **Topic Development**: Adding distinct supporting reasons, not repeating the prompt.
2. **Syntactic Variety**: Balancing compound-complex sentences with direct punchy claims.
3. **Lexical Precision**: Utilizing precise academic vocabulary instead of generic terms.`,
    order: 10,
    published: true,
  },
  {
    id: 'les-task-build-sentence',
    slug: 'build-a-sentence-strategy',
    title: 'Build a Sentence: Word Order & Clause Syntax',
    section: 'writing',
    taskType: 'build_sentence',
    estimatedMinutes: 10,
    format: 'text',
    summary: 'Fast rearrangement of scrambled words into grammatically impeccable clauses.',
    contentMarkdown: `## Strategy: Build a Sentence
Rearrange scrambled word tokens into a logical sentence.

### Ordering Rules:
- Identify the Main Subject and Verb first.
- Attach Adverbs and Prepositional Modifiers appropriately.
- Ensure relative clauses directly follow their antecedent noun.`,
    order: 11,
    published: true,
  },
  {
    id: 'les-task-write-email',
    slug: 'write-an-email-strategy',
    title: 'Write an Email: Professional Register & Purpose',
    section: 'writing',
    taskType: 'write_email',
    estimatedMinutes: 12,
    format: 'text',
    summary: 'Crafting concise, polite, and effective administrative and academic emails.',
    contentMarkdown: `## Strategy: Write an Email
You receive a scenario (e.g. asking a professor for an extension) and must write an email addressing all requirements.

### Structure:
1. **Formal Salutation**: Dear Professor [Name],
2. **Opening State of Purpose**: I am writing to respectfully request...
3. **Context & Justification**: Provide 2 concrete details.
4. **Proposed Action / Next Step**: Offer a solution or meeting time.
5. **Sign-off**: Sincerely, [Your Name]`,
    order: 12,
    published: true,
  },
  {
    id: 'les-task-academic-discussion',
    slug: 'write-for-academic-discussion-strategy',
    title: 'Write for Academic Discussion: Developing Original Arguments',
    section: 'writing',
    taskType: 'academic_discussion',
    estimatedMinutes: 15,
    format: 'text',
    summary: 'Contributing original points to an online university discussion board with peer responses.',
    contentMarkdown: `## Strategy: Academic Discussion
Read a professor prompt and two student posts, then write your 100+ word contribution.

### Winning Formula:
- Acknowledge peer points briefly (*"While Sarah makes a valid point regarding..."*).
- State your clear perspective (*"I believe the most critical factor is..."*).
- Provide an original, detailed example from personal or societal observation.`,
    order: 13,
    published: true,
  },

  // Section 4: Speaking Overviews & Task Types
  {
    id: 'les-speak-overview',
    slug: 'speaking-section-masterclass',
    title: 'Speaking Section Masterclass: Intonation, Fluency & Clarity',
    section: 'speaking',
    taskType: 'overview',
    estimatedMinutes: 15,
    format: 'text',
    summary: 'The ETS Speaking Rubric: Delivery, Language Use, and Topic Fulfillment.',
    contentMarkdown: `## Speaking Section Overview
Evaluates your ability to speak clearly, coherently, and spontaneously in English.

### Scoring Secrets:
- Pacing is better than speed: Speak steadily with clear thought pauses.
- Filler words (*uh, um, like*) should be minimized; use silent pauses instead.
- Clear articulation of consonant clusters and final sounds.`,
    order: 14,
    published: true,
  },
  {
    id: 'les-task-listen-repeat',
    slug: 'listen-and-repeat-strategy',
    title: 'Listen and Repeat: Acoustic Memory & Phoneme Fidelity',
    section: 'speaking',
    taskType: 'listen_repeat',
    estimatedMinutes: 10,
    format: 'text',
    summary: 'Techniques for retaining short sentences and shadowing pitch variations.',
    contentMarkdown: `## Strategy: Listen and Repeat
Listen to a native sentence and repeat it immediately into your microphone.

### Key Focus Areas:
- Do not add or drop words (*the, a, of*).
- Mirror the speaker's intonation and rhythm contour.
- Speak firmly and close to the microphone.`,
    order: 15,
    published: true,
  },
  {
    id: 'les-task-take-interview',
    slug: 'take-an-interview-strategy',
    title: 'Take an Interview: Structured Answers on the Fly',
    section: 'speaking',
    taskType: 'take_interview',
    estimatedMinutes: 15,
    format: 'text',
    summary: 'Answering spontaneous multi-part interview questions with the PEEL structure.',
    contentMarkdown: `## Strategy: Take an Interview
Participate in an interactive interview with spontaneous university life questions.

### PEEL Framework:
- **P (Point)**: Direct answer to the question.
- **E (Explanation)**: Why this view is held.
- **E (Example)**: A concrete experience or illustrative scenario.
- **L (Link)**: Concluding sentence summarizing the takeaway.`,
    order: 16,
    published: true,
  },
];

/**
 * Fetch All Lessons
 */
export const getLessons = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ section: z.enum(['all', 'reading', 'listening', 'writing', 'speaking']).optional() }).optional().parse(data || {}))
  .handler(async ({ data, context }) => {
    const userCompleted = userLessonStore.get(context.userId) || new Set();
    let items = [...SEEDED_LESSONS];

    if (data?.section && data.section !== 'all') {
      items = items.filter((l) => l.section === data.section);
    }

    return items.map((l) => ({
      ...l,
      isCompleted: userCompleted.has(l.id),
    }));
  });

/**
 * Get Lesson by Slug
 */
export const getLessonBySlug = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const lesson = SEEDED_LESSONS.find((l) => l.slug === data.slug);
    if (!lesson) return null;

    const userCompleted = userLessonStore.get(context.userId) || new Set();
    return {
      ...lesson,
      isCompleted: userCompleted.has(lesson.id),
    };
  });

/**
 * Mark Lesson Completed
 */
export const markLessonCompleted = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ lessonId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    let userCompleted = userLessonStore.get(context.userId);
    if (!userCompleted) {
      userCompleted = new Set();
      userLessonStore.set(context.userId, userCompleted);
    }

    userCompleted.add(data.lessonId);
    return { success: true, completedCount: userCompleted.size };
  });
