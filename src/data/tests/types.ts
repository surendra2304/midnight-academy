import type { JsonRecord } from "@/types/serializable";

/**
 * Shared types and deterministic item builders for eight TOEFL 2026-style practice sets
 * based on the supplied public mock-test playlist (https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV)
 * and video https://youtu.be/5giZh7nDyfk.
 */

export interface SeedBlueprintRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  exam_Type: "full_mock" | "section_practice" | "micro_drill";
  total_Duration_Seconds: number;
  blueprint_Json: {
    sections: Array<{
      section: "reading" | "listening" | "writing" | "speaking";
      order: number;
      durationSeconds: number;
      moduleCount: number;
      questionCount: number;
      isAdaptive: boolean;
    }>;
    scoringScale: string;
    planetName: string;
    videoUrl: string;
    videoId: string;
    playlistUrl: string;
    difficultyLabel: string;
  };
  is_Published: boolean;
  created_At: string;
}

export interface SeedQuestionItemRow {
  id: string;
  blueprint_Id: string;
  section: "reading" | "listening" | "writing" | "speaking";
  task_Type:
    | "complete_words"
    | "read_daily_life"
    | "read_academic"
    | "read_academic_passage"
    | "listen_choose_response"
    | "listen_conversation"
    | "listen_announcement"
    | "listen_academic_talk"
    | "build_sentence"
    | "write_email"
    | "academic_discussion"
    | "listen_repeat"
    | "take_interview";
  module_Number: 1 | 2;
  difficulty_Band: "lower" | "middle" | "upper";
  title: string;
  stimulus_Text: string | null;
  audio_Url: string | null;
  audio_Duration_Seconds: number | null;
  image_Url: string | null;
  prompt_Json: JsonRecord;
  answer_Key_Json: JsonRecord;
  rubric_Json: JsonRecord | null;
  points_Value: number;
  is_Active: boolean;
  created_At: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Deterministically converts any string ID into a valid RFC 4122 v4 UUID
 * so that all Zod `.uuid()` validators pass without requiring Node crypto on the client.
 */
export function toDeterministicUuid(input: string): string {
  if (UUID_REGEX.test(input)) {
    return input.toLowerCase();
  }
  const hash32 = (str: string, seed: number): number => {
    let h = seed >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  };

  const h1 = hash32(input, 0x811c9dc5).toString(16).padStart(8, "0");
  const h2 = hash32(input, 0x9e3779b9).toString(16).padStart(8, "0");
  const h3 = hash32(input, 0x85ebca6b).toString(16).padStart(8, "0");
  const h4 = hash32(input, 0xc2b2ae35).toString(16).padStart(8, "0");

  const part1 = h1;
  const part2 = h2.slice(0, 4);
  const part3 = "4" + h2.slice(5, 8);
  const part4 = "8" + h3.slice(1, 4);
  const part5 = h3.slice(4, 8) + h4;

  return `${part1}-${part2}-${part3}-${part4}-${part5}`.toLowerCase();
}

export function makeItemId(testNumber: number, itemIndex: number): string {
  const testHex = testNumber.toString(16).padStart(2, "0");
  const itemHex = itemIndex.toString(16).padStart(12, "0");
  return `a${testHex}00000-0000-4000-8000-${itemHex}`;
}

export function buildCompleteWordsItem(params: {
  id: string;
  blueprintId: string;
  moduleNumber: 1 | 2;
  difficultyBand: "lower" | "middle" | "upper";
  title: string;
  passageText: string;
  blanks: Array<{ index: number; prefix: string; answer: string }>;
  explanation?: string;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);

  // Convert 1-based [1]..[10] placeholders in passageText to 0-based [0]..[9] for CompleteWordsRenderer
  const hasZeroPlaceholder = params.passageText.includes("[0]");
  const normalizedPassage = hasZeroPlaceholder
    ? params.passageText
    : params.passageText.replace(/\[(\d+)\]/g, (_, numStr) => {
        const n = parseInt(numStr, 10);
        return `[${Math.max(0, n - 1)}]`;
      });

  const answerBlanks = params.blanks.map((b, idx) => {
    const fullWord = `${b.prefix}${b.answer}`.trim();
    return {
      blankIndex: idx,
      acceptedAnswers: Array.from(new Set([b.answer.trim(), fullWord].filter(Boolean))),
      weight: 1,
    };
  });
  const formattedBlanks = params.blanks.map((b, idx) => ({
    blankIndex: idx,
    index: b.index,
    prefix: b.prefix,
    charCount: b.answer.length,
    weight: 1,
  }));

  const explanationText =
    params.explanation ??
    `Complete each word using context clues and grammatical structure: ${params.blanks
      .map((b, i) => `(${i + 1}) ${b.prefix}${b.answer}`)
      .join(", ")}.`;

  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "reading",
    task_Type: "complete_words",
    module_Number: params.moduleNumber,
    difficulty_Band: params.difficultyBand,
    title: params.title,
    stimulus_Text: normalizedPassage,
    audio_Url: null,
    audio_Duration_Seconds: null,
    image_Url: null,
    prompt_Json: {
      taskType: "complete_words",
      title: "Fill in the missing letters in the paragraph.",
      subtitle: params.title,
      passage: normalizedPassage,
      passageText: normalizedPassage,
      blanks: formattedBlanks,
    },
    answer_Key_Json: {
      taskType: "complete_words",
      correctAnswers: params.blanks.map((b) => b.answer),
      fullWords: params.blanks.map((b) => `${b.prefix}${b.answer}`),
      blanks: answerBlanks,
      explanation: explanationText,
    },
    rubric_Json: { maxRawScore: params.blanks.length },
    points_Value: params.blanks.length,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}

export function buildDailyLifeItem(params: {
  id: string;
  blueprintId: string;
  moduleNumber: 1 | 2;
  difficultyBand: "lower" | "middle" | "upper";
  title: string;
  formatType: "email" | "notice" | "text_chain" | "social_post" | "schedule";
  senderName: string;
  senderHandle: string;
  subject: string;
  dateLabel: string;
  stimulusText: string;
  questionStem: string;
  options: [string, string, string, string];
  correctOptionId: "A" | "B" | "C" | "D";
  explanation: string;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);

  // Parse chatMessages if formatType is text_chain
  const chatMessages =
    params.formatType === "text_chain"
      ? params.stimulusText
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const match = line.match(/^([^(:]+?)\s*(?:\(([^)]+)\))?:\s*(.+)$/);
            if (match) {
              return {
                sender: match[1]!.trim(),
                time: match[2]?.trim() || "Today",
                text: match[3]!.trim(),
              };
            }
            return {
              sender: params.senderName,
              time: params.dateLabel,
              text: line,
            };
          })
      : undefined;

  const emailHeader =
    params.formatType === "email"
      ? {
          from: `${params.senderName} (${params.senderHandle})`,
          date: params.dateLabel,
          subject: params.subject,
        }
      : undefined;

  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "reading",
    task_Type: "read_daily_life",
    module_Number: params.moduleNumber,
    difficulty_Band: params.difficultyBand,
    title: params.title,
    stimulus_Text: params.stimulusText,
    audio_Url: null,
    audio_Duration_Seconds: null,
    image_Url: null,
    prompt_Json: {
      taskType: "read_daily_life",
      title:
        params.formatType === "email"
          ? "Read an email."
          : params.formatType === "text_chain"
            ? "Read a text chain."
            : params.title,
      passage: params.stimulusText,
      prompt: params.questionStem,
      questionText: params.questionStem,
      questionStem: params.questionStem,
      format:
        params.formatType === "text_chain"
          ? "chat"
          : params.formatType === "email"
            ? "email"
            : "notice",
      contextType:
        params.formatType === "text_chain"
          ? "phone_chat"
          : params.formatType === "email"
            ? "email"
            : "notice",
      formatType: params.formatType,
      senderName: params.senderName,
      senderHandle: params.senderHandle,
      subject: params.subject,
      dateLabel: params.dateLabel,
      ...(emailHeader ? { emailHeader } : {}),
      ...(chatMessages ? { chatMessages } : {}),
      options: [
        { id: "A", text: params.options[0] },
        { id: "B", text: params.options[1] },
        { id: "C", text: params.options[2] },
        { id: "D", text: params.options[3] },
      ],
    },
    answer_Key_Json: {
      taskType: "read_daily_life",
      correctOptionId: params.correctOptionId,
      explanation: params.explanation,
    },
    rubric_Json: { maxRawScore: 1 },
    points_Value: 1,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}

export function buildAcademicReadingItem(params: {
  id: string;
  blueprintId: string;
  moduleNumber: 1 | 2;
  difficultyBand: "lower" | "middle" | "upper";
  title: string;
  stimulusText: string;
  questionSubType:
    | "factual"
    | "negative_factual"
    | "inference"
    | "vocabulary"
    | "rhetorical_purpose"
    | "sentence_simplification";
  questionStem: string;
  targetWord?: string;
  options: [string, string, string, string];
  correctOptionId: "A" | "B" | "C" | "D";
  explanation: string;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);
  const paragraphs = params.stimulusText.split(/\n\n+/).filter(Boolean);
  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "reading",
    task_Type: "read_academic",
    module_Number: params.moduleNumber,
    difficulty_Band: params.difficultyBand,
    title: params.title,
    stimulus_Text: params.stimulusText,
    audio_Url: null,
    audio_Duration_Seconds: null,
    image_Url: null,
    prompt_Json: {
      taskType: "read_academic",
      title: params.title.replace(/\s*\(Q\d+\)$/i, ""),
      passage: params.stimulusText,
      prompt: params.questionStem,
      questionText: params.questionStem,
      questionStem: params.questionStem,
      paragraphCount: paragraphs.length,
      questionSubType: params.questionSubType,
      ...(params.targetWord
        ? { targetWord: params.targetWord, highlightedWord: params.targetWord }
        : {}),
      options: [
        { id: "A", text: params.options[0] },
        { id: "B", text: params.options[1] },
        { id: "C", text: params.options[2] },
        { id: "D", text: params.options[3] },
      ],
    },
    answer_Key_Json: {
      taskType: "read_academic",
      correctOptionId: params.correctOptionId,
      explanation: params.explanation,
    },
    rubric_Json: { maxRawScore: 1 },
    points_Value: 1,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}

export function buildListeningItem(params: {
  id: string;
  blueprintId: string;
  taskType:
    | "listen_choose_response"
    | "listen_conversation"
    | "listen_announcement"
    | "listen_academic_talk";
  moduleNumber: 1 | 2;
  difficultyBand: "lower" | "middle" | "upper";
  title: string;
  transcript: string;
  audioDurationSeconds?: number;
  campusContext?: string;
  academicDomain?: string;
  questionStem: string;
  options: [string, string, string, string];
  correctOptionId: "A" | "B" | "C" | "D";
  explanation: string;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);

  const firstLine = params.transcript.split("\n")[0]?.toLowerCase() || "";
  const isAcademic = params.taskType === "listen_academic_talk";
  const isMale =
    firstLine.startsWith("man:") ||
    firstLine.startsWith("male:") ||
    firstLine.startsWith("mr.") ||
    firstLine.startsWith("dr.") ||
    firstLine.includes("professor");
  const speakerGender = isMale ? "male" : "female";
  const imageUrl = isAcademic
    ? isMale
      ? "/images/speakers/professor-male.jpg"
      : "/images/speakers/professor-female.jpg"
    : isMale
      ? "/images/speakers/student-male-1.jpg"
      : "/images/speakers/student-female-1.jpg";

  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "listening",
    task_Type: params.taskType,
    module_Number: params.moduleNumber,
    difficulty_Band: params.difficultyBand,
    title: params.title,
    stimulus_Text: params.transcript,
    audio_Url: null,
    audio_Duration_Seconds:
      params.audioDurationSeconds ??
      (params.taskType === "listen_choose_response"
        ? 8
        : params.taskType === "listen_academic_talk"
          ? 95
          : 45),
    image_Url: imageUrl,
    prompt_Json: {
      taskType: params.taskType,
      title:
        params.taskType === "listen_choose_response" ? "Choose the best response." : params.title,
      prompt: params.questionStem,
      questionText: params.questionStem,
      questionStem: params.questionStem,
      stimulusText: params.transcript,
      transcript: params.transcript,
      imageUrl,
      speakerGender,
      speakerCount:
        params.taskType === "listen_conversation"
          ? 2
          : params.taskType === "listen_choose_response"
            ? 2
            : 1,
      campusContext: params.campusContext ?? "University Campus",
      academicDomain: params.academicDomain ?? "General Studies",
      options: [
        { id: "A", text: params.options[0] },
        { id: "B", text: params.options[1] },
        { id: "C", text: params.options[2] },
        { id: "D", text: params.options[3] },
      ],
    },
    answer_Key_Json: {
      taskType: params.taskType,
      correctOptionId: params.correctOptionId,
      explanation: params.explanation,
    },
    rubric_Json: { maxRawScore: 1 },
    points_Value: 1,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}

/**
 * Helper to determine ordered chips from wordBank that reconstruct targetSentence.
 */
function computeOrderedChipsFromTarget(
  targetSentence: string,
  wordBank: string[],
): {
  orderedChips: string[];
  terminalPunctuation: string;
} {
  const punctMatch = targetSentence.trim().match(/([.?!]+)$/);
  const terminalPunctuation = punctMatch?.[1] ?? ".";
  const cleanTarget = targetSentence
    .trim()
    .replace(/[.?!]+$/, "")
    .trim();
  const lowerTarget = cleanTarget.toLowerCase();

  // Greedily match chips from wordBank along lowerTarget from left to right
  const remainingIndices = new Set(wordBank.map((_, i) => i));
  const orderedChips: string[] = [];
  let cursor = 0;

  while (cursor < lowerTarget.length && remainingIndices.size > 0) {
    while (cursor < lowerTarget.length && /\s/.test(lowerTarget[cursor]!)) {
      cursor++;
    }
    if (cursor >= lowerTarget.length) break;

    let matchedIdx = -1;
    let matchedLen = -1;

    for (const idx of remainingIndices) {
      const chip = wordBank[idx]!.trim()
        .replace(/[.?!]+$/, "")
        .trim();
      const lowerChip = chip.toLowerCase();
      if (
        lowerTarget.startsWith(lowerChip, cursor) &&
        (cursor + lowerChip.length === lowerTarget.length ||
          /\s/.test(lowerTarget[cursor + lowerChip.length]!))
      ) {
        if (lowerChip.length > matchedLen) {
          matchedLen = lowerChip.length;
          matchedIdx = idx;
        }
      }
    }

    if (matchedIdx !== -1) {
      orderedChips.push(wordBank[matchedIdx]!);
      remainingIndices.delete(matchedIdx);
      cursor += matchedLen;
    } else {
      // Fallback: sort chips by their indexOf in lowerTarget
      break;
    }
  }

  if (orderedChips.length === 0) {
    const withPos = wordBank
      .map((chip) => ({
        chip,
        pos: lowerTarget.indexOf(
          chip
            .toLowerCase()
            .replace(/[.?!]+$/, "")
            .trim(),
        ),
      }))
      .filter((x) => x.pos >= 0)
      .sort((a, b) => a.pos - b.pos);
    return {
      orderedChips: withPos.length > 0 ? withPos.map((x) => x.chip) : [...wordBank],
      terminalPunctuation,
    };
  }

  return { orderedChips, terminalPunctuation };
}

export function buildSentenceItem(params: {
  id: string;
  blueprintId: string;
  questionNumber: number;
  contextPrompt: string;
  speakerAName?: string;
  speakerBName?: string;
  targetSentence: string;
  wordBank: string[];
  explanation?: string;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);
  const { orderedChips, terminalPunctuation } = computeOrderedChipsFromTarget(
    params.targetSentence,
    params.wordBank,
  );
  const cleanTarget = params.targetSentence
    .trim()
    .replace(/[.?!]+$/, "")
    .trim();
  const explanationText =
    params.explanation ?? `Correct sentence structure: "${params.targetSentence}"`;

  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "writing",
    task_Type: "build_sentence",
    module_Number: 1,
    difficulty_Band: "middle",
    title: `Build a Sentence — Question ${params.questionNumber} of 10`,
    stimulus_Text: params.contextPrompt,
    audio_Url: null,
    audio_Duration_Seconds: null,
    image_Url: null,
    prompt_Json: {
      taskType: "build_sentence",
      title: "Make an appropriate sentence.",
      prompt: params.contextPrompt,
      partnerDialogue: params.contextPrompt,
      contextPrompt: params.contextPrompt,
      speakerAName: params.speakerAName ?? "Colleague",
      speakerBName: params.speakerBName ?? "You",
      sentencePrefix: "",
      wordBank: params.wordBank,
      slotCount: orderedChips.length,
      terminalPunctuation,
    },
    answer_Key_Json: {
      taskType: "build_sentence",
      targetSentence: params.targetSentence,
      orderedChips,
      acceptedSequences: [orderedChips, [cleanTarget], cleanTarget.split(/\s+/).filter(Boolean)],
      acceptableVariants: [params.targetSentence, cleanTarget],
      explanation: explanationText,
    },
    rubric_Json: { maxRawScore: 1 },
    points_Value: 1,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}

export function buildWriteEmailItem(params: {
  id: string;
  blueprintId: string;
  title: string;
  scenarioContext: string;
  recipientRole: string;
  bulletPoints: [string, string, string];
  sampleAnswer: string;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);
  const formattedPrompt = `Write an email to ${params.recipientRole}. In your email, do the following:\n• ${params.bulletPoints[0]}\n• ${params.bulletPoints[1]}\n• ${params.bulletPoints[2]}\n\nWrite as much as you can and in complete sentences.`;

  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "writing",
    task_Type: "write_email",
    module_Number: 1,
    difficulty_Band: "middle",
    title: params.title,
    stimulus_Text: params.scenarioContext,
    audio_Url: null,
    audio_Duration_Seconds: null,
    image_Url: null,
    prompt_Json: {
      taskType: "write_email",
      title: params.title,
      context: params.scenarioContext,
      scenarioContext: params.scenarioContext,
      recipient: params.recipientRole,
      recipientRole: params.recipientRole,
      prompt: formattedPrompt,
      bulletPoints: params.bulletPoints,
      timeLimitSeconds: 420,
      minWords: 80,
      maxWords: 150,
    },
    answer_Key_Json: {
      taskType: "write_email",
      rubricType: "writing_5pt",
      keyPointsToCover: params.bulletPoints,
      sampleHighScoringResponse: params.sampleAnswer,
    },
    rubric_Json: { maxRawScore: 5 },
    points_Value: 5,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}

export function buildAcademicDiscussionItem(params: {
  id: string;
  blueprintId: string;
  title: string;
  courseName: string;
  professorName: string;
  professorPrompt: string;
  studentPosts: [
    { authorName: string; avatarSeed: string; text: string },
    { authorName: string; avatarSeed: string; text: string },
  ];
  keyPointsToCover: string[];
  sampleAnswer: string;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);
  const avatarInitials = params.professorName
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z]/g, "")[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedPrompt = `Your professor is teaching a class on ${params.courseName.toLowerCase()}. Write a post responding to the professor's question.\nIn your response, you should do the following:\n• Express and support your opinion.\n• Make a contribution to the discussion in your own words.\nAn effective response will contain at least 100 words.`;

  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "writing",
    task_Type: "academic_discussion",
    module_Number: 1,
    difficulty_Band: "middle",
    title: params.title,
    stimulus_Text: params.professorPrompt,
    audio_Url: null,
    audio_Duration_Seconds: null,
    image_Url: null,
    prompt_Json: {
      taskType: "academic_discussion",
      title: params.title,
      courseName: params.courseName,
      professorName: params.professorName,
      professorPrompt: params.professorPrompt,
      prompt: formattedPrompt,
      professor: {
        name: params.professorName,
        avatar: avatarInitials || "PR",
        role: `Professor of ${params.courseName}`,
        text: params.professorPrompt,
        question: params.professorPrompt,
      },
      discussionPosts: params.studentPosts.map((p) => ({
        author: p.authorName,
        avatar: p.authorName[0]?.toUpperCase() || "S",
        text: p.text,
      })),
      studentPosts: params.studentPosts.map((p) => ({
        name: p.authorName,
        authorName: p.authorName,
        avatarSeed: p.avatarSeed,
        comment: p.text,
        text: p.text,
      })),
      timeLimitSeconds: 600,
      minWords: 100,
    },
    answer_Key_Json: {
      taskType: "academic_discussion",
      rubricType: "writing_5pt",
      keyPointsToCover: params.keyPointsToCover,
      sampleHighScoringResponse: params.sampleAnswer,
    },
    rubric_Json: { maxRawScore: 5 },
    points_Value: 5,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}

export function buildListenRepeatItem(params: {
  id: string;
  blueprintId: string;
  questionNumber: number;
  scenarioTitle: string;
  sentence: string;
  responseSeconds?: number;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);
  const scenarioDescription = `Scenario: ${params.scenarioTitle}. Listen carefully to the speaker and repeat each sentence accurately once.`;

  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "speaking",
    task_Type: "listen_repeat",
    module_Number: 1,
    difficulty_Band: "middle",
    title: `Listen and Repeat — Sentence ${params.questionNumber} of 7 (${params.scenarioTitle})`,
    stimulus_Text: params.sentence,
    audio_Url: null,
    audio_Duration_Seconds: 5,
    image_Url: null,
    prompt_Json: {
      taskType: "listen_repeat",
      title: "Listen and Repeat",
      scenarioTitle: params.scenarioTitle,
      scenario: scenarioDescription,
      context: scenarioDescription,
      prompt: "Listen and repeat only once.",
      stimulusText: params.sentence,
      preparationSeconds: 0,
      responseSeconds: params.responseSeconds ?? 10,
      responseLimitSeconds: params.responseSeconds ?? 10,
    },
    answer_Key_Json: {
      taskType: "listen_repeat",
      rubricType: "speaking_5pt",
      expectedKeyPhrases: [params.sentence],
      sampleHighScoringResponse: params.sentence,
    },
    rubric_Json: { maxRawScore: 5 },
    points_Value: 5,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}

export function buildTakeInterviewItem(params: {
  id: string;
  blueprintId: string;
  questionNumber: number;
  interviewTopic: string;
  questionText: string;
  expectedKeyPhrases: string[];
  sampleAnswer: string;
}): SeedQuestionItemRow {
  const itemId = toDeterministicUuid(params.id);
  const scenarioDescription = `You are participating in an interview on the topic of ${params.interviewTopic}. Answer the interviewer's question clearly and completely.`;

  return {
    id: itemId,
    blueprint_Id: params.blueprintId,
    section: "speaking",
    task_Type: "take_interview",
    module_Number: 1,
    difficulty_Band: "middle",
    title: `Take an Interview — Question ${params.questionNumber} of 4 (${params.interviewTopic})`,
    stimulus_Text: params.questionText,
    audio_Url: null,
    audio_Duration_Seconds: 12,
    image_Url: null,
    prompt_Json: {
      taskType: "take_interview",
      title: "Please answer the interviewer's question.",
      interviewTopic: params.interviewTopic,
      scenario: scenarioDescription,
      context: scenarioDescription,
      prompt: params.questionText,
      questionText: params.questionText,
      stimulusText: params.questionText,
      transcript: params.questionText,
      interviewerQuestions: [params.questionText],
      preparationSeconds: 15,
      responseSecondsPerTurn: 45,
      responseLimitSeconds: 45,
    },
    answer_Key_Json: {
      taskType: "take_interview",
      rubricType: "speaking_5pt",
      expectedKeyPhrases: params.expectedKeyPhrases,
      sampleHighScoringResponse: params.sampleAnswer,
    },
    rubric_Json: { maxRawScore: 5 },
    points_Value: 5,
    is_Active: true,
    created_At: "2026-09-01T10:00:00.000Z",
  };
}
