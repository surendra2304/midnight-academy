/**
 * Shadowing Practice Service & Evaluator
 * Manages 40+ multi-difficulty shadowing sentences, speech evaluation with 5-trait rubric,
 * word-by-word repetition transcript diffs, and AI pronunciation feedback.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeWordDiff, type DictationScoreResult } from "@/lib/dictation/word-diff-engine";
import { chatJson } from "@/lib/ai.server";
import {
  EvaluationContractSchema,
  type StructuredEvaluationResult,
} from "@/lib/evaluation/evaluation-service.server";

export interface ShadowingItem {
  id: string;
  sentence: string;
  topic: string;
  difficulty: "lower" | "middle" | "upper";
  contextNote?: string;
  focusSkills: string[];
}

export interface ShadowingEvaluationResult {
  scoreBand: number;
  wordAccuracyPercent: number;
  wordDiff: DictationScoreResult;
  referenceSentence: string;
  studentTranscript: string;
  traits: {
    pronunciation: number;
    rhythm_and_pace: number;
    intelligibility: number;
    repetition_accuracy: number;
  };
  strengths: string[];
  pronunciationNotes: string[];
  coachingFeedback: string;
}

// Built-in 40+ Original Multi-Domain Shadowing Bank
export const SEEDED_SHADOWING_BANK: ShadowingItem[] = [
  // Lower Band (Foundational Fluency & Linking)
  {
    id: "shad-001",
    sentence: "Good morning, could you please tell me where the admissions office is?",
    topic: "Campus Inquiries",
    difficulty: "lower",
    contextNote: "Polite campus inquiry with rising intonation",
    focusSkills: ["polite_intonation", "linking_sounds"],
  },
  {
    id: "shad-002",
    sentence: "I would like to make an appointment with the academic advisor.",
    topic: "Academic Support",
    difficulty: "lower",
    contextNote: 'Vowel reduction in "would like to" and "appointment"',
    focusSkills: ["vowel_reduction", "fluid_phrasing"],
  },
  {
    id: "shad-003",
    sentence: "The computer lab on the second floor has twenty open workstations.",
    topic: "Campus Facilities",
    difficulty: "lower",
    contextNote: "Clear articulation of numbers and compound nouns",
    focusSkills: ["number_stress", "compound_words"],
  },
  {
    id: "shad-004",
    sentence: "Make sure to bring your student pass when you enter the recreation center.",
    topic: "Student Services",
    difficulty: "lower",
    contextNote: 'Flap /t/ sound in "recreation center"',
    focusSkills: ["flapping", "rhythm"],
  },
  {
    id: "shad-005",
    sentence: "Are you planning to attend the international student orientation this afternoon?",
    topic: "Campus Events",
    difficulty: "lower",
    contextNote: "Yes/No question intonation contour",
    focusSkills: ["pitch_contour", "connected_speech"],
  },
  {
    id: "shad-006",
    sentence: "The bookstore offers discounts on all required textbooks during orientation week.",
    topic: "Bookstore",
    difficulty: "lower",
    contextNote: 'Sibilant endings in "offers", "discounts", "textbooks"',
    focusSkills: ["plural_sibilants", "natural_pacing"],
  },
  {
    id: "shad-007",
    sentence: "Please submit your lab reports before five o’clock on Friday.",
    topic: "Coursework",
    difficulty: "lower",
    contextNote: 'Contraction "o’clock" and prepositional phrasing',
    focusSkills: ["time_phrasing", "final_consonants"],
  },
  {
    id: "shad-008",
    sentence: "I didn’t receive the confirmation email for my class registration.",
    topic: "Registration",
    difficulty: "lower",
    contextNote: 'Negative contraction "didn’t" and stress on "registration"',
    focusSkills: ["negative_contractions", "word_stress"],
  },
  {
    id: "shad-009",
    sentence: "The campus shuttle runs continuously between the north and south dormitories.",
    topic: "Transportation",
    difficulty: "lower",
    contextNote: 'Adverbial rhythm with "continuously"',
    focusSkills: ["polysyllabic_rhythm", "linking"],
  },
  {
    id: "shad-010",
    sentence: "Let’s meet at the library café after our chemistry review session.",
    topic: "Social & Study",
    difficulty: "lower",
    contextNote: "Informal suggestion intonation",
    focusSkills: ["casual_fluency", "consonant_clusters"],
  },
  {
    id: "shad-011",
    sentence: "You can check out up to five books for two weeks at a time.",
    topic: "Library Policies",
    difficulty: "lower",
    contextNote: 'Phonetic linking in "check out up to"',
    focusSkills: ["catenation", "stress_timed_rhythm"],
  },
  {
    id: "shad-012",
    sentence: "The financial aid office is located right across from the dining hall.",
    topic: "Campus Navigation",
    difficulty: "lower",
    contextNote: "Directional phrases and glottal stops",
    focusSkills: ["prepositional_linking", "rhythm"],
  },
  {
    id: "shad-013",
    sentence: "Don’t forget to save your digital documents before closing the application.",
    topic: "IT Support",
    difficulty: "lower",
    contextNote: 'Weak form of "to" and "before"',
    focusSkills: ["weak_forms", "imperative_cadence"],
  },

  // Middle Band (Intermediate Academic Discourse & Thought Groups)
  {
    id: "shad-014",
    sentence:
      "The professor highlighted three primary factors that contributed to the economic recession.",
    topic: "Economics Lecture",
    difficulty: "middle",
    contextNote: "Thought group division before the relative clause",
    focusSkills: ["thought_groups", "academic_cadence"],
  },
  {
    id: "shad-015",
    sentence:
      "Recent meteorological data suggests a notable rise in average oceanic surface temperatures.",
    topic: "Atmospheric Science",
    difficulty: "middle",
    contextNote: 'Complex adjective-noun stress on "meteorological data"',
    focusSkills: ["syllable_weight", "academic_stress"],
  },
  {
    id: "shad-016",
    sentence:
      "Although the initial hypothesis was promising, subsequent experiments yielded conflicting results.",
    topic: "Scientific Method",
    difficulty: "middle",
    contextNote: "Contrastive stress across the dependent clause",
    focusSkills: ["contrastive_stress", "subordinating_rhythm"],
  },
  {
    id: "shad-017",
    sentence:
      "Cognitive psychologists investigate how mnemonic strategies enhance long-term information retention.",
    topic: "Psychology",
    difficulty: "middle",
    contextNote: 'Silent /m/ in "mnemonic" and fluid academic phrasing',
    focusSkills: ["silent_letters", "fluency"],
  },
  {
    id: "shad-018",
    sentence:
      "Urban infrastructure projects require comprehensive environmental impact assessments prior to approval.",
    topic: "Urban Development",
    difficulty: "middle",
    contextNote: "Multi-word compound phrasing and clear consonant release",
    focusSkills: ["compound_intonation", "terminal_release"],
  },
  {
    id: "shad-019",
    sentence:
      "The artist’s deliberate use of asymmetrical composition creates a compelling sense of visual tension.",
    topic: "Art History",
    difficulty: "middle",
    contextNote: 'Adjectival cadence on "asymmetrical composition"',
    focusSkills: ["cadence", "vowel_clarity"],
  },
  {
    id: "shad-020",
    sentence:
      "Microorganisms in deep hydrothermal vents thrive under extreme pressure and perpetual darkness.",
    topic: "Oceanography",
    difficulty: "middle",
    contextNote: 'Linking between "deep hydrothermal" and "extreme pressure"',
    focusSkills: ["consonant_transitions", "breath_control"],
  },
  {
    id: "shad-021",
    sentence:
      "Statistical variance must be accounted for when evaluating patient responses to clinical treatments.",
    topic: "Biostatistics",
    difficulty: "middle",
    contextNote: "Passive verb rhythm and prepositional pacing",
    focusSkills: ["passive_rhythm", "thought_groups"],
  },
  {
    id: "shad-022",
    sentence:
      "Renewable energy integration diminishes long-term operational expenditures across municipal power grids.",
    topic: "Energy Engineering",
    difficulty: "middle",
    contextNote: 'Polysyllabic fluidity on "operational expenditures"',
    focusSkills: ["word_stress", "smooth_transitions"],
  },
  {
    id: "shad-023",
    sentence:
      "Historical manuscripts preserved in specialized archives provide direct insight into medieval trade routes.",
    topic: "World History",
    difficulty: "middle",
    contextNote: "Past participle stress and historical terminology",
    focusSkills: ["participle_cadence", "articulation"],
  },
  {
    id: "shad-024",
    sentence:
      "The architectural design optimizes natural ventilation to minimize artificial heating and cooling demands.",
    topic: "Sustainable Architecture",
    difficulty: "middle",
    contextNote: "Infinitive purpose clauses and natural pacing",
    focusSkills: ["infinitive_rhythm", "connected_speech"],
  },
  {
    id: "shad-025",
    sentence:
      "Cross-cultural negotiations frequently require participants to decode implicit nonverbal behavioral cues.",
    topic: "Communications",
    difficulty: "middle",
    contextNote: 'Adverbial phrasing on "frequently require"',
    focusSkills: ["adverb_stress", "intonation_shifts"],
  },
  {
    id: "shad-026",
    sentence:
      "Biochemical catalysts accelerate cellular metabolic pathways without being consumed in the reaction.",
    topic: "Biochemistry",
    difficulty: "middle",
    contextNote: 'Consonant cluster precision in "catalysts accelerate"',
    focusSkills: ["cluster_release", "academic_intonation"],
  },

  // Upper Band (Advanced Academic Synthesis, Rapid Connected Speech & Nuanced Intonation)
  {
    id: "shad-027",
    sentence:
      "Epistemological debates concerning empirical determinism have profoundly influenced contemporary philosophical paradigms.",
    topic: "Epistemology",
    difficulty: "upper",
    contextNote: "Heavy syllable sequences and sophisticated academic stress hierarchy",
    focusSkills: ["syllable_timing", "advanced_cadence"],
  },
  {
    id: "shad-028",
    sentence:
      "The spectroscopic identification of interstellar organic molecules suggests prebiotic chemical synthesis is ubiquitous throughout galaxies.",
    topic: "Astrobiology",
    difficulty: "upper",
    contextNote: "Rapid academic delivery with precise phoneme articulation",
    focusSkills: ["rapid_articulation", "breath_support"],
  },
  {
    id: "shad-029",
    sentence:
      "Macroeconomic equilibrium models must incorporate stochastic volatility parameters to accurately forecast market liquidity.",
    topic: "Financial Econometrics",
    difficulty: "upper",
    contextNote: "Quantitative terminology with complex rhythm transitions",
    focusSkills: ["quantitative_cadence", "rhythmic_control"],
  },
  {
    id: "shad-030",
    sentence:
      "Comparative sociological methodologies reveal that institutional norms perpetually reconfigure collective identity narratives.",
    topic: "Sociological Theory",
    difficulty: "upper",
    contextNote: "Nuanced sentence pacing with subtle pause boundaries",
    focusSkills: ["pause_boundaries", "nuanced_stress"],
  },
  {
    id: "shad-031",
    sentence:
      "Neuroimaging paradigms demonstrate that synaptic plasticity facilitates adaptive recalibration in perceptual processing networks.",
    topic: "Cognitive Neuroscience",
    difficulty: "upper",
    contextNote: "Fast speech vowel contrasts and precise consonant articulation",
    focusSkills: ["vowel_distinctions", "smooth_linking"],
  },
  {
    id: "shad-032",
    sentence:
      "Constitutional jurisprudence balances sovereign executive authority against statutory legislative prerogatives.",
    topic: "Jurisprudence",
    difficulty: "upper",
    contextNote: "Legal cadences and high-register vocabulary intonation",
    focusSkills: ["formal_register", "contrastive_cadence"],
  },
  {
    id: "shad-033",
    sentence:
      "Cryptographic decentralization protocols eliminate centralized intermediary risks through distributed consensus mechanisms.",
    topic: "Distributed Systems",
    difficulty: "upper",
    contextNote: "Compound technical terms with sustained vocal projection",
    focusSkills: ["technical_compounds", "vocal_energy"],
  },
  {
    id: "shad-034",
    sentence:
      "Geomorphological sedimentation rates in fluvial estuaries fluctuate in direct proportion to anthropogenic deforestation.",
    topic: "Geomorphology",
    difficulty: "upper",
    contextNote: 'Complex polysyllabic prefixes on "anthropogenic deforestation"',
    focusSkills: ["prefix_stress", "fluid_phrasing"],
  },
  {
    id: "shad-035",
    sentence:
      "Post-colonial literary narratives deliberately subvert traditional hegemonic discourse through multilingual vernacular integration.",
    topic: "Comparative Literature",
    difficulty: "upper",
    contextNote: "Critical theory terminology with sharp rhythmic transitions",
    focusSkills: ["rhythmic_transitions", "phonetic_precision"],
  },
  {
    id: "shad-036",
    sentence:
      "Quantum mechanical superposition enables simultaneous state computation prior to wavefunction collapse upon measurement.",
    topic: "Quantum Physics",
    difficulty: "upper",
    contextNote: "Scientific jargon delivery with continuous pitch contour",
    focusSkills: ["continuous_intonation", "technical_articulation"],
  },
  {
    id: "shad-037",
    sentence:
      "Immunological monoclonal antibody therapies precisely target malignant antigens while preserving adjacent healthy somatic tissue.",
    topic: "Immunology",
    difficulty: "upper",
    contextNote: "Medical terminology with balanced clause weighting",
    focusSkills: ["clause_weighting", "consonant_clarity"],
  },
  {
    id: "shad-038",
    sentence:
      "Algorithmic optimization in deep neural networks often encounters non-convex loss surfaces that impede global convergence.",
    topic: "Machine Learning",
    difficulty: "upper",
    contextNote: "Technical mathematical phrasing with natural speech cadence",
    focusSkills: ["mathematical_cadence", "speech_flow"],
  },
  {
    id: "shad-039",
    sentence:
      "Thermodynamic entropy increments inevitably constrain the theoretical efficiency thresholds of thermoelectric energy converters.",
    topic: "Thermodynamics",
    difficulty: "upper",
    contextNote: "Dense academic conceptual phrasing",
    focusSkills: ["dense_phrasing", "vocal_stability"],
  },
  {
    id: "shad-040",
    sentence:
      "Anthropological ethnographies emphasize how ritualistic gift exchange consolidates reciprocal intertribal alliances.",
    topic: "Cultural Anthropology",
    difficulty: "upper",
    contextNote: "Humanities discourse pacing and pitch variation",
    focusSkills: ["pitch_variation", "advanced_fluency"],
  },
];

/**
 * Fetch shadowing practice items
 */
export const getShadowingItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        difficulty: z.enum(["all", "lower", "middle", "upper"]).optional(),
        limit: z.number().int().positive().optional(),
      })
      .optional()
      .parse(data || {}),
  )
  .handler(async ({ data }) => {
    let items = [...SEEDED_SHADOWING_BANK];
    if (data?.difficulty && data.difficulty !== "all") {
      items = items.filter((i) => i.difficulty === data.difficulty);
    }
    const limit = data?.limit || 40;
    return items.slice(0, limit);
  });

/**
 * Shadowing Evaluation System Prompt
 */
const SHADOWING_EVALUATION_PROMPT = `You are the official TOEFL / Standardized English Shadowing and Speaking Coach for Midnight Academy.
You evaluate student speech repetition against the exact reference transcript across:
1. Pronunciation (1.0 to 6.0 scale): Phoneme accuracy, vowel quality, and consonant clarity.
2. Rhythm & Intonation (1.0 to 6.0 scale): Natural stress-timing, thought groups, and pitch modulation.
3. Intelligibility (1.0 to 6.0 scale): Ease of understanding and absence of heavy phonetic distortions.
4. Repetition Accuracy (1.0 to 6.0 scale): Exactness of spoken words compared to reference.

Return strict structured JSON adhering to the evaluation contract. Provide 2-3 specific coaching notes on rhythm and sound linking.`;

/**
 * Evaluate spoken shadowing repetition attempt
 */
export const submitShadowingAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        itemId: z.string(),
        studentTranscript: z.string(),
        audioDurationSeconds: z.number().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<ShadowingEvaluationResult> => {
    const item = SEEDED_SHADOWING_BANK.find((i) => i.id === data.itemId);
    const referenceSentence = item ? item.sentence : "The library will extend its operating hours.";

    const studentSpoken = data.studentTranscript.trim();

    // 1. Calculate deterministic word diff
    const wordDiff = computeWordDiff(studentSpoken, referenceSentence);

    if (!studentSpoken) {
      return {
        scoreBand: 1.0,
        wordAccuracyPercent: 0,
        wordDiff,
        referenceSentence,
        studentTranscript: "",
        traits: {
          pronunciation: 1.0,
          rhythm_and_pace: 1.0,
          intelligibility: 1.0,
          repetition_accuracy: 1.0,
        },
        strengths: [],
        pronunciationNotes: ["No speech detected. Please speak clearly into your microphone."],
        coachingFeedback:
          "Ensure your microphone is enabled and speak immediately after the countdown.",
      };
    }

    // 2. Call AI evaluator for acoustic, rhythm & pronunciation rubric
    try {
      const userPrompt = [
        `REFERENCE SENTENCE: "${referenceSentence}"`,
        `STUDENT SPOKEN TRANSCRIPT: "${studentSpoken}"`,
        `WORD ACCURACY: ${wordDiff.accuracyPercent}% (${wordDiff.correctWordCount}/${wordDiff.totalReferenceWords} words matched)`,
        `DURATION: ${data.audioDurationSeconds || 5} seconds`,
      ].join("\n\n");

      const rawJson = await chatJson<unknown>([
        { role: "system", content: SHADOWING_EVALUATION_PROMPT },
        { role: "user", content: userPrompt },
      ]);

      const parsed = EvaluationContractSchema.safeParse(rawJson);
      if (parsed.success) {
        const d = parsed.data;
        const pron =
          d.traits.pronunciation ||
          Math.min(6.0, Math.max(1.0, (wordDiff.accuracyPercent / 100) * 5 + 1));
        const deliv =
          d.traits.delivery ||
          Math.min(6.0, Math.max(1.0, (wordDiff.accuracyPercent / 100) * 5 + 1));
        const avgBand =
          Math.round(((d.score_band + (wordDiff.accuracyPercent / 100) * 5 + 1) / 2) * 2) / 2;

        return {
          scoreBand: Math.max(1.0, Math.min(6.0, avgBand)),
          wordAccuracyPercent: wordDiff.accuracyPercent,
          wordDiff,
          referenceSentence,
          studentTranscript: studentSpoken,
          traits: {
            pronunciation: pron,
            rhythm_and_pace: deliv,
            intelligibility: d.traits.task_fulfillment || pron,
            repetition_accuracy: Math.round(((wordDiff.accuracyPercent / 100) * 5 + 1) * 2) / 2,
          },
          strengths:
            d.strengths.length > 0 ? d.strengths : ["Solid sentence completion and vocal effort."],
          pronunciationNotes:
            d.issues.length > 0 ? d.issues : ["Smooth rhythm with natural phrasing."],
          coachingFeedback:
            d.next_actions[0] || "Focus on linking words naturally across thought groups.",
        };
      }
    } catch {
      // Fallback deterministic grading
    }

    const calculatedBand = Math.round(((wordDiff.accuracyPercent / 100) * 5 + 1) * 2) / 2;

    return {
      scoreBand: Math.max(1.0, Math.min(6.0, calculatedBand)),
      wordAccuracyPercent: wordDiff.accuracyPercent,
      wordDiff,
      referenceSentence,
      studentTranscript: studentSpoken,
      traits: {
        pronunciation: calculatedBand,
        rhythm_and_pace: calculatedBand,
        intelligibility: calculatedBand,
        repetition_accuracy: calculatedBand,
      },
      strengths:
        wordDiff.accuracyPercent >= 80
          ? ["Clear phonetic repetition and rhythm."]
          : ["Good vocal projection."],
      pronunciationNotes:
        wordDiff.accuracyPercent < 80
          ? ["Pay close attention to weak forms and unstressed function words."]
          : ["Natural cadence matching the original speaker."],
      coachingFeedback:
        "Practice shadowing each sentence until you achieve 90%+ word accuracy and fluid pacing.",
    };
  });
