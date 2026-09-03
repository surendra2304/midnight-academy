/**
 * Task-Type Practice Bank Statistics & Inventory
 * Reflects depth across all 12 official 2026 task types with difficulty distributions (40% lower, 40% middle, 20% upper).
 * Guarantees a minimum of 15+ practice items per task type.
 */

import { ToeflSectionType, ToeflItemType } from "@/types/toefl";

export interface TaskTypeBankStats {
  itemType: ToeflItemType;
  displayName: string;
  section: ToeflSectionType;
  totalItems: number;
  difficultySpread: {
    lower: number;
    middle: number;
    upper: number;
  };
  focusSkill: string;
}

export const TASK_TYPE_BANK_INVENTORY: TaskTypeBankStats[] = [
  // Reading
  {
    itemType: "complete_words",
    displayName: "Complete the Words",
    section: "reading",
    totalItems: 20,
    difficultySpread: { lower: 8, middle: 8, upper: 4 },
    focusSkill: "Contextual Morphology & Syntax",
  },
  {
    itemType: "read_daily_life",
    displayName: "Read in Daily Life",
    section: "reading",
    totalItems: 18,
    difficultySpread: { lower: 8, middle: 7, upper: 3 },
    focusSkill: "Notices, Schedules & Pragmatics",
  },
  {
    itemType: "read_academic",
    displayName: "Read an Academic Passage",
    section: "reading",
    totalItems: 22,
    difficultySpread: { lower: 8, middle: 10, upper: 4 },
    focusSkill: "Inference & Synthesis",
  },

  // Listening
  {
    itemType: "listen_choose_response",
    displayName: "Listen and Choose Response",
    section: "listening",
    totalItems: 25,
    difficultySpread: { lower: 10, middle: 10, upper: 5 },
    focusSkill: "Conversational Turn-Taking",
  },
  {
    itemType: "listen_conversation",
    displayName: "Campus Conversation",
    section: "listening",
    totalItems: 18,
    difficultySpread: { lower: 7, middle: 8, upper: 3 },
    focusSkill: "Problem-Solution Dialogue",
  },
  {
    itemType: "listen_announcement",
    displayName: "Campus Announcement",
    section: "listening",
    totalItems: 16,
    difficultySpread: { lower: 7, middle: 6, upper: 3 },
    focusSkill: "Public Broadcast Extraction",
  },
  {
    itemType: "listen_academic_talk",
    displayName: "Academic Lecture Talk",
    section: "listening",
    totalItems: 20,
    difficultySpread: { lower: 8, middle: 8, upper: 4 },
    focusSkill: "Lecture Structure & Attitude",
  },

  // Writing
  {
    itemType: "build_sentence",
    displayName: "Build a Sentence",
    section: "writing",
    totalItems: 24,
    difficultySpread: { lower: 10, middle: 10, upper: 4 },
    focusSkill: "Clause Syntax & Modifiers",
  },
  {
    itemType: "write_email",
    displayName: "Write an Email",
    section: "writing",
    totalItems: 16,
    difficultySpread: { lower: 6, middle: 7, upper: 3 },
    focusSkill: "Academic Email Etiquette",
  },
  {
    itemType: "academic_discussion",
    displayName: "Write for Academic Discussion",
    section: "writing",
    totalItems: 18,
    difficultySpread: { lower: 7, middle: 7, upper: 4 },
    focusSkill: "Peer Debate & Argumentation",
  },

  // Speaking
  {
    itemType: "listen_repeat",
    displayName: "Listen and Repeat",
    section: "speaking",
    totalItems: 30,
    difficultySpread: { lower: 12, middle: 12, upper: 6 },
    focusSkill: "Acoustic Memory & Intonation",
  },
  {
    itemType: "take_interview",
    displayName: "Take an Interview",
    section: "speaking",
    totalItems: 18,
    difficultySpread: { lower: 7, middle: 8, upper: 3 },
    focusSkill: "PEEL Framework Spontaneity",
  },
];
