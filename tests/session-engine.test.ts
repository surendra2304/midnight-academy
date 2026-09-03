import { describe, it, expect } from "vitest";
import {
  sessionReducer,
  calculateRemainingSeconds,
  type SessionSnapshot,
  type ClientTestBlueprint,
} from "../src/lib/tests/session-state";
import { scoringService } from "../src/lib/tests/scoring-service";

describe("Generic Test Session State Machine Suite", () => {
  const mockBlueprint: ClientTestBlueprint = {
    testVersionId: "v-100",
    testId: "t-100",
    name: "TOEFL Practice Test 1",
    examMode: "practice",
    blueprintVersion: "2026.1",
    sections: [
      {
        id: "sec-reading",
        sectionType: "reading",
        sectionOrder: 0,
        timingSeconds: 1800,
        instructions: "Read passages and answer questions.",
        isTimed: true,
        items: [
          {
            id: "item-1",
            moduleId: null,
            sectionType: "reading",
            itemType: "read_daily_life",
            difficulty: "Easy",
            skillTags: ["Vocabulary"],
            payload: { prompt: "What is the main topic?" },
            options: [
              { id: "opt-1", optionKey: "A", optionText: "Library rules", optionOrder: 0 },
              { id: "opt-2", optionKey: "B", optionText: "Campus parking", optionOrder: 1 },
            ],
            itemOrder: 0,
          },
          {
            id: "item-2",
            moduleId: null,
            sectionType: "reading",
            itemType: "complete_words",
            difficulty: "Easy",
            skillTags: ["Grammar"],
            payload: { prompt: "Fill in the blanks." },
            options: [],
            itemOrder: 1,
          },
        ],
      },
      {
        id: "sec-listening",
        sectionType: "listening",
        sectionOrder: 1,
        timingSeconds: 1200,
        instructions: "Listen and respond.",
        isTimed: true,
        items: [
          {
            id: "item-3",
            moduleId: null,
            sectionType: "listening",
            itemType: "listen_choose_response",
            difficulty: "Medium",
            skillTags: ["Listening"],
            payload: { prompt: "Choose response" },
            options: [],
            itemOrder: 0,
          },
        ],
      },
    ],
  };

  const initialIdleState: SessionSnapshot = {
    attemptId: "",
    status: "idle",
    examMode: "practice",
    currentSectionIndex: 0,
    currentItemIndex: 0,
    sectionStartedAt: null,
    sectionRemainingSeconds: 0,
    isSectionLocked: false,
    responses: {},
  };

  it("transitions from idle to in_progress on START event", () => {
    const state = sessionReducer(
      initialIdleState,
      {
        type: "START",
        attemptId: "att-123",
        examMode: "practice",
        timestamp: "2026-09-01T10:00:00Z",
      },
      mockBlueprint,
    );

    expect(state.status).toBe("in_progress");
    expect(state.attemptId).toBe("att-123");
    expect(state.currentSectionIndex).toBe(0);
    expect(state.currentItemIndex).toBe(0);
    expect(state.sectionRemainingSeconds).toBe(1800);
    expect(state.isSectionLocked).toBe(false);
  });

  it("saves response and flags for items during in_progress session", () => {
    let state = sessionReducer(
      initialIdleState,
      {
        type: "START",
        attemptId: "att-123",
        examMode: "practice",
        timestamp: "2026-09-01T10:00:00Z",
      },
      mockBlueprint,
    );

    state = sessionReducer(
      state,
      {
        type: "SAVE_RESPONSE",
        contentItemId: "item-1",
        rawAnswer: "A",
        timestamp: "2026-09-01T10:01:00Z",
      },
      mockBlueprint,
    );

    expect(state.responses["item-1"]).toBeDefined();
    expect(state.responses["item-1"].rawAnswer).toBe("A");
    expect(state.responses["item-1"].isAnswered).toBe(true);

    state = sessionReducer(state, { type: "TOGGLE_FLAG", contentItemId: "item-1" }, mockBlueprint);
    expect(state.responses["item-1"].isFlagged).toBe(true);
  });

  it("guards against invalid navigation index and state transitions", () => {
    const state = sessionReducer(
      initialIdleState,
      {
        type: "START",
        attemptId: "att-123",
        examMode: "practice",
        timestamp: "2026-09-01T10:00:00Z",
      },
      mockBlueprint,
    );

    expect(() => {
      sessionReducer(state, { type: "NAVIGATE_ITEM", itemIndex: 99 }, mockBlueprint);
    }).toThrow("Item index out of bounds");

    expect(() => {
      sessionReducer(
        state,
        { type: "START", attemptId: "att-2", examMode: "practice", timestamp: "..." },
        mockBlueprint,
      );
    }).toThrow("Invalid state transition");
  });

  it("advances sections and locks previous section", () => {
    let state = sessionReducer(
      initialIdleState,
      {
        type: "START",
        attemptId: "att-123",
        examMode: "practice",
        timestamp: "2026-09-01T10:00:00Z",
      },
      mockBlueprint,
    );

    state = sessionReducer(
      state,
      { type: "ADVANCE_SECTION", nextSectionIndex: 1, timestamp: "2026-09-01T10:30:00Z" },
      mockBlueprint,
    );

    expect(state.currentSectionIndex).toBe(1);
    expect(state.sectionRemainingSeconds).toBe(1200);

    // Advancing past last section finalizes attempt
    state = sessionReducer(
      state,
      { type: "ADVANCE_SECTION", nextSectionIndex: 2, timestamp: "2026-09-01T11:00:00Z" },
      mockBlueprint,
    );

    expect(state.status).toBe("finalized");
    expect(state.isSectionLocked).toBe(true);
  });

  it("handles section timeout cleanly", () => {
    let state = sessionReducer(
      initialIdleState,
      {
        type: "START",
        attemptId: "att-123",
        examMode: "practice",
        timestamp: "2026-09-01T10:00:00Z",
      },
      mockBlueprint,
    );

    state = sessionReducer(
      state,
      { type: "SECTION_TIMEOUT", timestamp: "2026-09-01T10:30:00Z" },
      mockBlueprint,
    );

    expect(state.status).toBe("section_transition");
    expect(state.isSectionLocked).toBe(true);
  });

  it("calculates remaining seconds and expiry accurately", () => {
    const startIso = new Date(Date.now() - 50000).toISOString(); // 50s ago
    const res = calculateRemainingSeconds(startIso, 60, true); // 60s total

    expect(res.isExpired).toBe(false);
    expect(res.remainingSeconds).toBeGreaterThanOrEqual(10);

    const expiredStartIso = new Date(Date.now() - 70000).toISOString(); // 70s ago
    const expiredRes = calculateRemainingSeconds(expiredStartIso, 60, true);
    expect(expiredRes.isExpired).toBe(true);
    expect(expiredRes.remainingSeconds).toBe(0);
  });

  it("scores deterministic objective items correctly", () => {
    const correctRes = scoringService.scoreObjective({
      contentItemId: "item-1",
      itemType: "read_daily_life",
      rawAnswer: "B",
      correctKey: "B",
    });
    expect(correctRes.isCorrect).toBe(true);
    expect(correctRes.score).toBe(1.0);

    const wrongRes = scoringService.scoreObjective({
      contentItemId: "item-1",
      itemType: "read_daily_life",
      rawAnswer: "A",
      correctKey: "B",
    });
    expect(wrongRes.isCorrect).toBe(false);
    expect(wrongRes.score).toBe(0);

    const clozeRes = scoringService.scoreObjective({
      contentItemId: "item-2",
      itemType: "complete_words",
      rawAnswer: "library",
      acceptedAnswers: ["library", "libraries"],
    });
    expect(clozeRes.isCorrect).toBe(true);
    expect(clozeRes.score).toBe(1.0);
  });

  it("supports jump navigation across items in active section", () => {
    let state = sessionReducer(
      initialIdleState,
      {
        type: "START",
        attemptId: "att-123",
        examMode: "practice",
        timestamp: "2026-09-01T10:00:00Z",
      },
      mockBlueprint,
    );

    expect(state.currentItemIndex).toBe(0);

    // Jump to item index 1
    state = sessionReducer(state, { type: "NAVIGATE_ITEM", itemIndex: 1 }, mockBlueprint);
    expect(state.currentItemIndex).toBe(1);

    // Jump back to item index 0
    state = sessionReducer(state, { type: "NAVIGATE_ITEM", itemIndex: 0 }, mockBlueprint);
    expect(state.currentItemIndex).toBe(0);
  });

  it("makes duplicate start and save requests idempotent", () => {
    let state = sessionReducer(
      initialIdleState,
      {
        type: "START",
        attemptId: "att-123",
        examMode: "practice",
        timestamp: "2026-09-01T10:00:00Z",
      },
      mockBlueprint,
    );

    // Duplicate save of same answer produces consistent response
    state = sessionReducer(
      state,
      {
        type: "SAVE_RESPONSE",
        contentItemId: "item-1",
        rawAnswer: "A",
        timestamp: "2026-09-01T10:01:00Z",
      },
      mockBlueprint,
    );
    state = sessionReducer(
      state,
      {
        type: "SAVE_RESPONSE",
        contentItemId: "item-1",
        rawAnswer: "A",
        timestamp: "2026-09-01T10:01:05Z",
      },
      mockBlueprint,
    );

    expect(state.responses["item-1"].rawAnswer).toBe("A");
    expect(state.responses["item-1"].isAnswered).toBe(true);
  });

  it("preserves response state across section navigation and recovery", () => {
    let state = sessionReducer(
      initialIdleState,
      {
        type: "START",
        attemptId: "att-123",
        examMode: "practice",
        timestamp: "2026-09-01T10:00:00Z",
      },
      mockBlueprint,
    );

    state = sessionReducer(
      state,
      {
        type: "SAVE_RESPONSE",
        contentItemId: "item-1",
        rawAnswer: "A",
        timestamp: "2026-09-01T10:01:00Z",
      },
      mockBlueprint,
    );
    state = sessionReducer(
      state,
      {
        type: "SAVE_RESPONSE",
        contentItemId: "item-2",
        rawAnswer: "growth",
        timestamp: "2026-09-01T10:02:00Z",
      },
      mockBlueprint,
    );

    // Navigate to next section
    state = sessionReducer(
      state,
      { type: "ADVANCE_SECTION", nextSectionIndex: 1, timestamp: "2026-09-01T10:30:00Z" },
      mockBlueprint,
    );

    // Previous responses are safely preserved
    expect(state.responses["item-1"].rawAnswer).toBe("A");
    expect(state.responses["item-2"].rawAnswer).toBe("growth");
    expect(state.currentSectionIndex).toBe(1);
    expect(state.currentItemIndex).toBe(0);
  });
});
