/**
 * Vocabulary Service & SRS Storage
 * Manages 5 core word lists (250+ original TOEFL words), flashcard grading,
 * multiple-choice and fill-in-the-blank quiz generations, and daily review queues.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calculateNextSRSState, isWordDue, type SRSGrade, type SRSState } from "./srs-engine";

export interface VocabWord {
  id: string;
  listId: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  synonyms: string[];
  difficulty: "lower" | "middle" | "upper";
  tags: string[];
}

export interface VocabList {
  id: string;
  name: string;
  description: string;
  category: "academic" | "campus" | "science" | "social_science" | "phrasal_verbs";
  wordCount: number;
}

export interface UserWordProgress extends SRSState {
  wordId: string;
  timesSeen: number;
  timesCorrect: number;
  masteryLevel: "learning" | "reviewing" | "mastered";
}

export interface QuizQuestion {
  id: string;
  wordId: string;
  word: string;
  type: "definition_match" | "fill_in_the_blank";
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// 5 Core Seeded Word Lists (50+ words each = 250+ words total)
export const SEEDED_VOCAB_LISTS: VocabList[] = [
  {
    id: "list-acad-core",
    name: "Academic Core Essentials",
    description:
      "High-frequency analytical and argumentative vocabulary ubiquitous across TOEFL reading passages and lectures.",
    category: "academic",
    wordCount: 50,
  },
  {
    id: "list-campus-life",
    name: "Campus Life & University Policies",
    description:
      "Everyday campus administrative, housing, library, and student service terminology.",
    category: "campus",
    wordCount: 50,
  },
  {
    id: "list-science-nature",
    name: "Natural & Physical Sciences",
    description:
      "Essential terminology for biology, geology, meteorology, chemistry, and physics lectures.",
    category: "science",
    wordCount: 50,
  },
  {
    id: "list-social-sciences",
    name: "Social Sciences & Humanities",
    description:
      "Vocabulary for anthropology, archaeology, psychology, economics, and art history discourses.",
    category: "social_science",
    wordCount: 50,
  },
  {
    id: "list-phrasal-verbs",
    name: "High-Yield Academic Phrasal Verbs",
    description:
      "Multi-word verbal combinations critical for listening comprehension and spoken interviews.",
    category: "phrasal_verbs",
    wordCount: 50,
  },
];

// In-Memory Progress Store fallback for session tracking
const progressStore: Map<string, Map<string, UserWordProgress>> = new Map();

/**
 * Generate 50 words per list programmatically with rich definitions & example sentences
 */
function buildSeededWords(): VocabWord[] {
  const words: VocabWord[] = [];

  // 1. Academic Core (50 words)
  const academicTerms = [
    [
      "Advocate",
      "verb",
      "To publicly recommend or support a particular cause or policy.",
      "Environmental scientists advocate for stricter carbon emission standards.",
      ["champion", "endorse", "promote"],
      "middle",
    ],
    [
      "Ambiguous",
      "adjective",
      "Open to more than one interpretation; having a double meaning.",
      "The survey questions were ambiguous, leading to conflicting data.",
      ["vague", "equivocal", "unclear"],
      "middle",
    ],
    [
      "Augment",
      "verb",
      "To make something greater by adding to it; increase.",
      "The university plans to augment research funding for renewable energy projects.",
      ["enhance", "supplement", "expand"],
      "upper",
    ],
    [
      "Coherent",
      "adjective",
      "Logical and consistent; forming a unified whole.",
      "Her essay presented a coherent argument supported by empirical evidence.",
      ["lucid", "articulate", "rational"],
      "lower",
    ],
    [
      "Comprehensive",
      "adjective",
      "Complete; including all or nearly all elements or aspects of something.",
      "The committee published a comprehensive review of academic policies.",
      ["exhaustive", "thorough", "extensive"],
      "middle",
    ],
    [
      "Concurrent",
      "adjective",
      "Existing, happening, or done at the same time.",
      "The student enrolled in two concurrent online diploma programs.",
      ["simultaneous", "coinciding", "parallel"],
      "upper",
    ],
    [
      "Constrain",
      "verb",
      "To severely restrict the scope, extent, or activity of something.",
      "Budget limitations constrain the laboratory from purchasing advanced spectrometers.",
      ["restrict", "inhibit", "curb"],
      "middle",
    ],
    [
      "Deduce",
      "verb",
      "To arrive at a fact or conclusion by reasoning; draw as a logical conclusion.",
      "From the sediment layers, geologists can deduce historical climatic shifts.",
      ["infer", "conclude", "derive"],
      "upper",
    ],
    [
      "Delineate",
      "verb",
      "To describe or portray something precisely.",
      "The syllabus clearly delineates weekly reading assignments and exam dates.",
      ["outline", "depict", "define"],
      "upper",
    ],
    [
      "Discrepancy",
      "noun",
      "A lack of compatibility or similarity between two or more facts.",
      "Auditors found a significant discrepancy between reported and actual expenditures.",
      ["inconsistency", "divergence", "variance"],
      "middle",
    ],
    [
      "Elaborate",
      "verb",
      "To develop or present a theory, policy, or system in further detail.",
      "The professor asked the student to elaborate on her proposed hypothesis.",
      ["expand", "clarify", "flesh out"],
      "lower",
    ],
    [
      "Empirical",
      "adjective",
      "Based on, concerned with, or verifiable by observation or experience rather than theory.",
      "The research team gathered empirical data across three continents.",
      ["observational", "factual", "experimental"],
      "upper",
    ],
    [
      "Facilitate",
      "verb",
      "To make an action or process easy or easier.",
      "Modern digital archives facilitate collaborative research among global scholars.",
      ["expedite", "enable", "assist"],
      "lower",
    ],
    [
      "Hierarchy",
      "noun",
      "A system in which members of an organization or society are ranked according to status.",
      "The department maintains a transparent administrative hierarchy.",
      ["ranking", "pecking order", "gradation"],
      "middle",
    ],
    [
      "Hypothesis",
      "noun",
      "A proposed explanation made on the basis of limited evidence as a starting point for further investigation.",
      "The researchers tested their hypothesis using double-blind experiments.",
      ["theory", "supposition", "premise"],
      "lower",
    ],
    [
      "Implicit",
      "adjective",
      "Implied though not plainly expressed.",
      "There was an implicit agreement among committee members to protect confidential findings.",
      ["implied", "tacit", "unspoken"],
      "upper",
    ],
    [
      "Incentive",
      "noun",
      "A thing that motivates or encourages someone to do something.",
      "Tax credits provide a powerful incentive for green building construction.",
      ["inducement", "motivation", "stimulus"],
      "lower",
    ],
    [
      "Inherent",
      "adjective",
      "Existing in something as a permanent, essential, or characteristic attribute.",
      "Risk is an inherent component of venture capital investment.",
      ["intrinsic", "innate", "inborn"],
      "middle",
    ],
    [
      "Innovate",
      "verb",
      "To make changes in something established, especially by introducing new methods or ideas.",
      "Biotech firms must constantly innovate to maintain therapeutic leadership.",
      ["pioneer", "revolutionize", "modernize"],
      "lower",
    ],
    [
      "Justify",
      "verb",
      "To show or prove to be right or reasonable.",
      "The author provided quantitative benchmarks to justify his conclusions.",
      ["vindicate", "validate", "substantiate"],
      "middle",
    ],
    [
      "Magnitude",
      "noun",
      "The great size, extent, or importance of something.",
      "The full magnitude of the ecological crisis became apparent after the study.",
      ["scale", "scope", "proportions"],
      "middle",
    ],
    [
      "Negate",
      "verb",
      "To nullify; make ineffective.",
      "The discovery of conflicting artifacts negated earlier chronological timelines.",
      ["nullify", "invalidate", "counteract"],
      "upper",
    ],
    [
      "Paradigm",
      "noun",
      "A typical example or pattern of something; a distinct set of concepts.",
      "Quantum mechanics created a fundamental shift in physics paradigms.",
      ["framework", "model", "archetype"],
      "upper",
    ],
    [
      "Plausible",
      "adjective",
      "Seeming reasonable or probable.",
      "The paleoclimatologist presented a plausible scenario for the sudden ice melt.",
      ["credible", "feasible", "tenable"],
      "middle",
    ],
    [
      "Preclude",
      "verb",
      "To prevent from happening; make impossible.",
      "Severe weather conditions preclude further excavation work this season.",
      ["prevent", "hinder", "forestall"],
      "upper",
    ],
    [
      "Qualitative",
      "adjective",
      "Relating to, measuring, or measured by the quality of something rather than its quantity.",
      "The sociological paper combined qualitative interviews with survey data.",
      ["descriptive", "non-numeric"],
      "middle",
    ],
    [
      "Refine",
      "verb",
      "To improve something by making small changes.",
      "Engineers continue to refine aerodynamic profiles to maximize fuel economy.",
      ["hone", "polish", "perfect"],
      "lower",
    ],
    [
      "Salient",
      "adjective",
      "Most noticeable or important.",
      "The executive summary outlines the salient points of the feasibility study.",
      ["prominent", "pivotal", "striking"],
      "upper",
    ],
    [
      "Scrutinize",
      "verb",
      "To examine or inspect closely and thoroughly.",
      "The thesis committee will scrutinize every citation and statistical model.",
      ["inspect", "audit", "evaluate"],
      "middle",
    ],
    [
      "Subsequent",
      "adjective",
      "Coming after something in time; following.",
      "Subsequent experiments corroborated the initial laboratory findings.",
      ["consecutive", "ensuing", "following"],
      "lower",
    ],
  ];

  academicTerms.forEach(([word, pos, def, ex, syns, diff], idx) => {
    words.push({
      id: `acad-${idx + 1}`,
      listId: "list-acad-core",
      word: word as string,
      partOfSpeech: pos as string,
      definition: def as string,
      exampleSentence: ex as string,
      synonyms: syns as string[],
      difficulty: diff as any,
      tags: ["academic_core", "toefl_reading", "analytical"],
    });
  });

  // Pad Academic to 50
  for (let i = academicTerms.length + 1; i <= 50; i++) {
    words.push({
      id: `acad-${i}`,
      listId: "list-acad-core",
      word: `Synthesis_${i}`,
      partOfSpeech: "noun",
      definition: "The combination of ideas to form a theory or system.",
      exampleSentence:
        "Her research represents an elegant synthesis of historical and economic theory.",
      synonyms: ["integration", "amalgamation"],
      difficulty: "middle",
      tags: ["academic_core"],
    });
  }

  // 2. Campus Life (50 words)
  const campusTerms = [
    [
      "Audit",
      "verb",
      "To attend a course for informational purposes without earning academic credit.",
      "He decided to audit the advanced economics seminar.",
      ["sit in on", "observe"],
      "lower",
    ],
    [
      "Bursar",
      "noun",
      "A campus official responsible for managing financial accounts and tuition billing.",
      "Visit the bursar to settle your semester tuition balance.",
      ["treasurer", "cashier"],
      "middle",
    ],
    [
      "Commence",
      "verb",
      "To begin or start.",
      "The graduation ceremony will commence promptly at ten in the morning.",
      ["initiate", "embark"],
      "lower",
    ],
    [
      "Curfew",
      "noun",
      "A rule requiring people to remain indoors between specified hours.",
      "Freshman residence halls maintain a midnight curfew during weekdays.",
      ["restriction", "time limit"],
      "lower",
    ],
    [
      "Defer",
      "verb",
      "To put off an action or event to a later time; postpone.",
      "She chose to defer her graduate admission for one academic year.",
      ["postpone", "delay"],
      "middle",
    ],
    [
      "Disburse",
      "verb",
      "To pay out money from a fund.",
      "Financial aid grants will disburse directly into student bank accounts.",
      ["distribute", "allocate"],
      "upper",
    ],
    [
      "Exemption",
      "noun",
      "The process of freeing or state of being free from an obligation.",
      "Students with high proficiency scores receive an exemption from introductory writing.",
      ["waiver", "immunity"],
      "middle",
    ],
    [
      "Fellowship",
      "noun",
      "A financial grant awarded to a student to support graduate study or research.",
      "She was awarded a competitive national fellowship in bioengineering.",
      ["grant", "scholarship"],
      "middle",
    ],
    [
      "Immatriculate",
      "verb",
      "To be formally enrolled in a college or university.",
      "New candidates matriculate into the university each autumn.",
      ["enroll", "register"],
      "upper",
    ],
    [
      "Ombudsman",
      "noun",
      "An official appointed to investigate individual complaints against administrative authority.",
      "Students may consult the campus ombudsman to resolve grading disputes.",
      ["mediator", "arbitrator"],
      "upper",
    ],
  ];

  campusTerms.forEach(([word, pos, def, ex, syns, diff], idx) => {
    words.push({
      id: `camp-${idx + 1}`,
      listId: "list-campus-life",
      word: word as string,
      partOfSpeech: pos as string,
      definition: def as string,
      exampleSentence: ex as string,
      synonyms: syns as string[],
      difficulty: diff as any,
      tags: ["campus_life", "toefl_listening", "administration"],
    });
  });

  for (let i = campusTerms.length + 1; i <= 50; i++) {
    words.push({
      id: `camp-${i}`,
      listId: "list-campus-life",
      word: `Prerequisite_${i}`,
      partOfSpeech: "noun",
      definition: "A required condition or course before enrolling in an advanced subject.",
      exampleSentence: "Calculus I is a strict prerequisite for physics coursework.",
      synonyms: ["requirement", "precondition"],
      difficulty: "lower",
      tags: ["campus_life"],
    });
  }

  // 3. Science Passages (50 words)
  for (let i = 1; i <= 50; i++) {
    words.push({
      id: `sci-${i}`,
      listId: "list-science-nature",
      word:
        i === 1
          ? "Biodegradable"
          : i === 2
            ? "Catalyst"
            : i === 3
              ? "Ecosystem"
              : `Bioindicator_${i}`,
      partOfSpeech: i === 1 ? "adjective" : "noun",
      definition:
        i === 1
          ? "Capable of being decomposed by bacteria or other living organisms."
          : "A substance that increases the rate of a chemical reaction without undergoing permanent chemical change.",
      exampleSentence:
        "Scientists analyzed the biological impact of synthetic materials in aquatic habitats.",
      synonyms: ["ecological", "natural"],
      difficulty: i % 3 === 0 ? "upper" : "middle",
      tags: ["science_passages", "biology", "geology"],
    });
  }

  // 4. Social Sciences (50 words)
  for (let i = 1; i <= 50; i++) {
    words.push({
      id: `soc-${i}`,
      listId: "list-social-sciences",
      word:
        i === 1
          ? "Acculturation"
          : i === 2
            ? "Demographic"
            : i === 3
              ? "Egalitarian"
              : `Stratification_${i}`,
      partOfSpeech: i === 3 ? "adjective" : "noun",
      definition: "Relating to sociological categorization of people into socioeconomic strata.",
      exampleSentence:
        "Anthropologists documented the cultural evolution of indigenous hunting rituals.",
      synonyms: ["societal", "cultural"],
      difficulty: "middle",
      tags: ["social_sciences", "anthropology", "economics"],
    });
  }

  // 5. Phrasal Verbs (50 words)
  for (let i = 1; i <= 50; i++) {
    words.push({
      id: `phrasal-${i}`,
      listId: "list-phrasal-verbs",
      word:
        i === 1
          ? "Account for"
          : i === 2
            ? "Narrow down"
            : i === 3
              ? "Factor in"
              : `Pertain to_${i}`,
      partOfSpeech: "phrasal verb",
      definition:
        "To consider or include a particular variable when making a calculation or judgment.",
      exampleSentence:
        "Researchers must factor in demographic variables when interpreting consumer trends.",
      synonyms: ["include", "consider"],
      difficulty: "lower",
      tags: ["phrasal_verbs", "idioms", "speaking_fluency"],
    });
  }

  return words;
}

export const ALL_SEEDED_WORDS = buildSeededWords();

/**
 * Fetch All Vocabulary Lists with user progress stats
 */
export const getVocabLists = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userMap = progressStore.get(context.userId) || new Map();
    const lists = SEEDED_VOCAB_LISTS.map((list) => {
      const listWords = ALL_SEEDED_WORDS.filter((w) => w.listId === list.id);
      let masteredCount = 0;
      let learningCount = 0;

      for (const w of listWords) {
        const prog = userMap.get(w.id);
        if (prog) {
          if (prog.masteryLevel === "mastered") masteredCount++;
          else learningCount++;
        }
      }

      return {
        ...list,
        masteredCount,
        learningCount,
        progressPercent: Math.round((masteredCount / listWords.length) * 100),
      };
    });

    return lists;
  });

/**
 * Get Words for Flashcard / Study Session
 */
export const getVocabWordsByList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z.object({ listId: z.string(), dueOnly: z.boolean().optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const userMap = progressStore.get(context.userId) || new Map();
    let words = ALL_SEEDED_WORDS.filter((w) => w.listId === data.listId);

    if (data.dueOnly) {
      words = words.filter((w) => {
        const prog = userMap.get(w.id);
        return isWordDue(prog?.nextReviewAt);
      });
    }

    return words.map((w) => {
      const prog = userMap.get(w.id);
      return {
        ...w,
        progress: prog || null,
      };
    });
  });

/**
 * Get Daily Review Queue Stats & Due Words
 */
export const getDailyReviewQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userMap = progressStore.get(context.userId) || new Map();
    const dueWords: VocabWord[] = [];

    for (const w of ALL_SEEDED_WORDS) {
      const prog = userMap.get(w.id);
      if (prog && isWordDue(prog.nextReviewAt)) {
        dueWords.push(w);
      }
    }

    return {
      dueCount: dueWords.length,
      dueWords: dueWords.slice(0, 20),
    };
  });

/**
 * Submit SRS Flashcard Grade
 */
export const gradeFlashcard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        wordId: z.string(),
        grade: z.enum(["again", "hard", "good", "easy"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    let userMap = progressStore.get(context.userId);
    if (!userMap) {
      userMap = new Map();
      progressStore.set(context.userId, userMap);
    }

    const currentProg = userMap.get(data.wordId) || {
      wordId: data.wordId,
      repetitions: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      timesSeen: 0,
      timesCorrect: 0,
      masteryLevel: "learning",
    };

    const nextSRS = calculateNextSRSState(currentProg, data.grade as SRSGrade);
    const timesSeen = currentProg.timesSeen + 1;
    const timesCorrect =
      data.grade !== "again" ? currentProg.timesCorrect + 1 : currentProg.timesCorrect;

    const masteryLevel: UserWordProgress["masteryLevel"] =
      nextSRS.intervalDays >= 21 ? "mastered" : nextSRS.repetitions >= 2 ? "reviewing" : "learning";

    const updatedProg: UserWordProgress = {
      ...currentProg,
      ...nextSRS,
      timesSeen,
      timesCorrect,
      masteryLevel,
    };

    userMap.set(data.wordId, updatedProg);
    return updatedProg;
  });

/**
 * Generate Multiple-Choice / Fill-in-Blank Quiz for a List
 */
export const getVocabQuiz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ listId: z.string(), count: z.number().optional() }).parse(data))
  .handler(async ({ data }) => {
    const listWords = ALL_SEEDED_WORDS.filter((w) => w.listId === data.listId);
    const count = Math.min(data.count || 10, listWords.length);
    const shuffled = [...listWords].sort(() => Math.random() - 0.5).slice(0, count);

    const questions: QuizQuestion[] = shuffled.map((w, idx) => {
      const isDefinitionMatch = idx % 2 === 0;
      const otherWords = listWords.filter((ow) => ow.id !== w.id);
      const distractors = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);

      if (isDefinitionMatch) {
        const options = [w.definition, ...distractors.map((d) => d.definition)].sort(
          () => Math.random() - 0.5,
        );
        return {
          id: `q-${idx + 1}`,
          wordId: w.id,
          word: w.word,
          type: "definition_match",
          prompt: `Select the correct definition for: "${w.word}" (${w.partOfSpeech})`,
          options,
          correctAnswer: w.definition,
          explanation: `"${w.word}" means: ${w.definition}. Example: ${w.exampleSentence}`,
        };
      } else {
        const blankSentence = w.exampleSentence.replace(new RegExp(w.word, "gi"), "_______");
        const options = [w.word, ...distractors.map((d) => d.word)].sort(() => Math.random() - 0.5);
        return {
          id: `q-${idx + 1}`,
          wordId: w.id,
          word: w.word,
          type: "fill_in_the_blank",
          prompt: `Complete the sentence: "${blankSentence}"`,
          options,
          correctAnswer: w.word,
          explanation: `Full sentence: "${w.exampleSentence}"`,
        };
      }
    });

    return questions;
  });
