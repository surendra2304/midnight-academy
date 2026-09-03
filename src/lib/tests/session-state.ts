/**
 * Pure State Machine & Lifecycle Transitions for Generic Test Sessions
 * UI-Independent, fully unit-testable without database dependencies.
 */

import type { ToeflExamMode, ToeflSectionType, ToeflItemType } from "@/types/toefl";

export type SessionStateStatus =
  | "idle"
  | "in_progress"
  | "section_transition"
  | "paused"
  | "finalized"
  | "scoring"
  | "completed"
  | "error";

export interface ClientContentItem {
  id: string;
  moduleId: string | null;
  sectionType: ToeflSectionType;
  itemType: ToeflItemType;
  difficulty: string;
  skillTags: string[];
  payload: Record<string, any>;
  options: Array<{
    id: string;
    optionKey: string;
    optionText: string;
    optionOrder: number;
  }>;
  itemOrder: number;
}

export interface ClientSectionBlueprint {
  id: string;
  sectionType: ToeflSectionType;
  sectionOrder: number;
  timingSeconds: number;
  instructions: string;
  isTimed: boolean;
  items: ClientContentItem[];
}

export interface ClientTestBlueprint {
  testVersionId: string;
  testId: string;
  name: string;
  examMode: ToeflExamMode;
  blueprintVersion: string;
  sections: ClientSectionBlueprint[];
}

export interface ItemResponseState {
  rawAnswer: string | null;
  normalizedAnswer: Record<string, any>;
  isAnswered: boolean;
  isFlagged: boolean;
  timeSpentMs: number;
  lastSavedAt: string | null;
}

export interface SessionSnapshot {
  attemptId: string;
  status: SessionStateStatus;
  examMode: ToeflExamMode;
  currentSectionIndex: number;
  currentItemIndex: number;
  sectionStartedAt: string | null; // ISO server timestamp
  sectionRemainingSeconds: number;
  isSectionLocked: boolean;
  responses: Record<string, ItemResponseState>; // Keyed by contentItemId
  error?: string;
}

export type SessionEvent =
  | { type: "START"; attemptId: string; examMode: ToeflExamMode; timestamp: string }
  | { type: "NAVIGATE_ITEM"; itemIndex: number }
  | {
      type: "SAVE_RESPONSE";
      contentItemId: string;
      rawAnswer: string | null;
      normalizedAnswer?: Record<string, unknown>;
      timeSpentMs?: number;
      timestamp: string;
    }
  | { type: "TOGGLE_FLAG"; contentItemId: string }
  | { type: "ADVANCE_SECTION"; nextSectionIndex: number; timestamp: string }
  | { type: "SECTION_TIMEOUT"; timestamp: string }
  | { type: "PAUSE" }
  | { type: "RESUME"; timestamp: string }
  | { type: "FINALIZE"; timestamp: string }
  | { type: "MARK_SCORING" }
  | { type: "COMPLETE" }
  | { type: "FAIL"; error: string };

/**
 * Pure Transition Reducer
 */
export function sessionReducer(
  state: SessionSnapshot,
  event: SessionEvent,
  blueprint: ClientTestBlueprint,
): SessionSnapshot {
  const currentSection = blueprint.sections[state.currentSectionIndex];

  switch (event.type) {
    case "START": {
      if (state.status !== "idle") {
        throw new Error(`Invalid state transition: Cannot START from status '${state.status}'`);
      }
      return {
        ...state,
        attemptId: event.attemptId,
        status: "in_progress",
        examMode: event.examMode,
        currentSectionIndex: 0,
        currentItemIndex: 0,
        sectionStartedAt: event.timestamp,
        sectionRemainingSeconds: blueprint.sections[0]?.timingSeconds || 0,
        isSectionLocked: false,
      };
    }

    case "NAVIGATE_ITEM": {
      if (state.status !== "in_progress" && state.status !== "section_transition") {
        throw new Error(
          `Invalid state transition: Cannot navigate items in status '${state.status}'`,
        );
      }
      if (
        !currentSection ||
        event.itemIndex < 0 ||
        event.itemIndex >= currentSection.items.length
      ) {
        throw new Error(`Item index out of bounds: ${event.itemIndex}`);
      }
      return {
        ...state,
        currentItemIndex: event.itemIndex,
      };
    }

    case "SAVE_RESPONSE": {
      if (state.status !== "in_progress") {
        throw new Error(`Cannot save response when session is '${state.status}'`);
      }
      if (state.isSectionLocked) {
        throw new Error("Cannot save response for a locked or expired section");
      }

      const prev = state.responses[event.contentItemId] || {
        rawAnswer: null,
        normalizedAnswer: {},
        isAnswered: false,
        isFlagged: false,
        timeSpentMs: 0,
        lastSavedAt: null,
      };

      const isAnswered = Boolean(
        event.rawAnswer !== null &&
        event.rawAnswer !== undefined &&
        event.rawAnswer.trim().length > 0,
      );

      return {
        ...state,
        responses: {
          ...state.responses,
          [event.contentItemId]: {
            ...prev,
            rawAnswer: event.rawAnswer,
            normalizedAnswer: event.normalizedAnswer ?? prev.normalizedAnswer,
            isAnswered,
            timeSpentMs: prev.timeSpentMs + (event.timeSpentMs || 0),
            lastSavedAt: event.timestamp,
          },
        },
      };
    }

    case "TOGGLE_FLAG": {
      const prev = state.responses[event.contentItemId] || {
        rawAnswer: null,
        normalizedAnswer: {},
        isAnswered: false,
        isFlagged: false,
        timeSpentMs: 0,
        lastSavedAt: null,
      };

      return {
        ...state,
        responses: {
          ...state.responses,
          [event.contentItemId]: {
            ...prev,
            isFlagged: !prev.isFlagged,
          },
        },
      };
    }

    case "ADVANCE_SECTION": {
      if (state.status !== "in_progress" && state.status !== "section_transition") {
        throw new Error(`Cannot advance section from status '${state.status}'`);
      }
      if (event.nextSectionIndex <= state.currentSectionIndex) {
        throw new Error("Cannot navigate backward to earlier locked sections in test mode");
      }
      if (event.nextSectionIndex >= blueprint.sections.length) {
        // Advanced past final section -> proceed to finalize
        return {
          ...state,
          status: "finalized",
          isSectionLocked: true,
          sectionRemainingSeconds: 0,
        };
      }

      const nextSec = blueprint.sections[event.nextSectionIndex];
      return {
        ...state,
        status: "in_progress",
        currentSectionIndex: event.nextSectionIndex,
        currentItemIndex: 0,
        sectionStartedAt: event.timestamp,
        sectionRemainingSeconds: nextSec?.timingSeconds || 0,
        isSectionLocked: false,
      };
    }

    case "SECTION_TIMEOUT": {
      if (state.status !== "in_progress") return state;
      const isLastSection = state.currentSectionIndex >= blueprint.sections.length - 1;
      if (isLastSection) {
        return {
          ...state,
          status: "finalized",
          isSectionLocked: true,
          sectionRemainingSeconds: 0,
        };
      }
      return {
        ...state,
        status: "section_transition",
        isSectionLocked: true,
        sectionRemainingSeconds: 0,
      };
    }

    case "PAUSE": {
      if (state.status !== "in_progress") return state;
      if (state.examMode === "full") {
        throw new Error("Full mock tests cannot be paused");
      }
      return {
        ...state,
        status: "paused",
      };
    }

    case "RESUME": {
      if (state.status !== "paused") return state;
      return {
        ...state,
        status: "in_progress",
      };
    }

    case "FINALIZE": {
      if (state.status === "completed" || state.status === "scoring") {
        return state;
      }
      return {
        ...state,
        status: "finalized",
        isSectionLocked: true,
      };
    }

    case "MARK_SCORING": {
      return {
        ...state,
        status: "scoring",
      };
    }

    case "COMPLETE": {
      return {
        ...state,
        status: "completed",
      };
    }

    case "FAIL": {
      return {
        ...state,
        status: "error",
        error: event.error,
      };
    }

    default:
      return state;
  }
}

/**
 * Calculates remaining section seconds accurately from server start time
 */
export function calculateRemainingSeconds(
  sectionStartedAt: string | null,
  totalTimingSeconds: number,
  isTimed: boolean,
  serverNowMs: number = Date.now(),
  gracePeriodMs: number = 3000,
): { remainingSeconds: number; isExpired: boolean } {
  if (!isTimed || !sectionStartedAt) {
    return { remainingSeconds: totalTimingSeconds, isExpired: false };
  }

  const startTimeMs = new Date(sectionStartedAt).getTime();
  const elapsedMs = Math.max(0, serverNowMs - startTimeMs);
  const totalLimitMs = totalTimingSeconds * 1000 + gracePeriodMs;

  if (elapsedMs >= totalLimitMs) {
    return { remainingSeconds: 0, isExpired: true };
  }

  const remaining = Math.max(0, Math.ceil((totalLimitMs - elapsedMs) / 1000));
  return { remainingSeconds: remaining, isExpired: false };
}
