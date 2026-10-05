/**
 * React Hook: useAttemptSession
 * Manages client-side state machine, tick interval, autosave debouncing, and navigation.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  sessionReducer,
  type SessionSnapshot,
  type ClientTestBlueprint,
  type SessionEvent,
} from "./session-state";
import type { JsonRecord } from "@/types/serializable";
import { saveToeflResponse, advanceToeflSection, finalizeToeflAttempt } from "./engine.functions";

export interface UseAttemptSessionProps {
  initialBlueprint: ClientTestBlueprint;
  initialSnapshot: SessionSnapshot;
  onFinalized?: (attemptId: string) => void;
}

export function useAttemptSession({
  initialBlueprint,
  initialSnapshot,
  onFinalized,
}: UseAttemptSessionProps) {
  const [blueprint] = useState<ClientTestBlueprint>(initialBlueprint);
  const [state, setState] = useState<SessionSnapshot>(initialSnapshot);
  const [isSaving, setIsSaving] = useState(false);

  // Guarantees the server is told about a finalization exactly once, whether the
  // student clicked "Submit Exam" or the countdown expired on the final section.
  const finalizedSyncRef = useRef(
    initialSnapshot.status === "scoring" || initialSnapshot.status === "completed",
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = useCallback(
    (event: SessionEvent) => {
      setState((prev) => sessionReducer(prev, event, blueprint));
    },
    [blueprint],
  );

  // 1. Countdown timer interval (ticks every 1 second)
  useEffect(() => {
    if (state.status !== "in_progress" || state.isSectionLocked) return;

    const currentSection = blueprint.sections[state.currentSectionIndex];
    if (!currentSection || !currentSection.isTimed) return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.sectionRemainingSeconds <= 1) {
          clearInterval(timer);
          return sessionReducer(
            prev,
            { type: "SECTION_TIMEOUT", timestamp: new Date().toISOString() },
            blueprint,
          );
        }
        return {
          ...prev,
          sectionRemainingSeconds: prev.sectionRemainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.status, state.currentSectionIndex, state.isSectionLocked, blueprint]);

  const pendingSaveRef = useRef<{
    attemptId: string;
    contentItemId: string;
    rawAnswer: string;
    normalizedAnswer?: JsonRecord | undefined;
  } | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flushPendingSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const pending = pendingSaveRef.current;
    if (!pending) return;
    pendingSaveRef.current = null;
    try {
      setIsSaving(true);
      await saveToeflResponse({ data: pending });
    } catch (err) {
      console.error("Failed to autosave response:", err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (pendingSaveRef.current) {
        saveToeflResponse({ data: pendingSaveRef.current }).catch(() => {});
      }
    };
  }, []);

  // 1b. Server sync for timer-driven finalization. When the final section's
  // countdown expires, the reducer marks the session "finalized" locally only;
  // without this effect the attempt would stay `in_progress` in the database
  // forever and the evaluation would never start.
  useEffect(() => {
    if (state.status !== "finalized") return;
    if (finalizedSyncRef.current) return;
    finalizedSyncRef.current = true;

    void (async () => {
      try {
        await flushPendingSave();
        await finalizeToeflAttempt({ data: { attemptId: stateRef.current.attemptId } });
        if (onFinalized) {
          onFinalized(stateRef.current.attemptId);
        }
      } catch (err) {
        console.error("Failed to sync finalization with server:", err);
        // Allow an explicit re-submit through handleFinalize to recover.
        finalizedSyncRef.current = false;
      }
    })();
  }, [state.status, flushPendingSave, onFinalized]);

  // 2. Action: Select / Save Answer for Current Item
  const handleAnswerChange = useCallback(
    (rawAnswer: string, normalizedAnswer?: JsonRecord) => {
      const currentSec = blueprint.sections[stateRef.current.currentSectionIndex];
      const currentItem = currentSec?.items[stateRef.current.currentItemIndex];
      if (!currentItem) return;

      const nowIso = new Date().toISOString();

      // Local optimistic dispatch (instant UI update, zero latency)
      dispatch({
        type: "SAVE_RESPONSE",
        contentItemId: currentItem.id,
        rawAnswer,
        ...(normalizedAnswer ? { normalizedAnswer } : {}),
        timestamp: nowIso,
      });

      // Debounce server persistence by 400ms to eliminate typing freezes
      pendingSaveRef.current = {
        attemptId: stateRef.current.attemptId,
        contentItemId: currentItem.id,
        rawAnswer,
        normalizedAnswer,
      };

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        flushPendingSave();
      }, 400);
    },
    [blueprint, dispatch, flushPendingSave],
  );

  // 3. Action: Toggle Flag
  const handleToggleFlag = useCallback(() => {
    const currentSec = blueprint.sections[stateRef.current.currentSectionIndex];
    const currentItem = currentSec?.items[stateRef.current.currentItemIndex];
    if (!currentItem) return;

    dispatch({ type: "TOGGLE_FLAG", contentItemId: currentItem.id });
  }, [blueprint, dispatch]);

  // 4. Action: Navigate Item
  const handleNavigateItem = useCallback(
    (itemIndex: number) => {
      flushPendingSave();
      dispatch({ type: "NAVIGATE_ITEM", itemIndex });
    },
    [dispatch, flushPendingSave],
  );

  // 5. Action: Advance to Next Section
  const handleAdvanceSection = useCallback(async () => {
    const prevSecIndex = stateRef.current.currentSectionIndex;
    const nextSecIndex = prevSecIndex + 1;
    const nowIso = new Date().toISOString();

    // Optimistic immediate UI transition (0ms latency)
    if (nextSecIndex < blueprint.sections.length) {
      dispatch({
        type: "ADVANCE_SECTION",
        nextSectionIndex: nextSecIndex,
        timestamp: nowIso,
      });
    }

    try {
      await flushPendingSave();
      const res = await advanceToeflSection({
        data: {
          attemptId: stateRef.current.attemptId,
          currentSectionIndex: prevSecIndex,
        },
      });

      if (res.isFinalized) {
        // Advancing past the final section never submits by itself: route through
        // the single finalize path so the evaluation pipeline actually starts.
        finalizedSyncRef.current = true;
        await finalizeToeflAttempt({ data: { attemptId: stateRef.current.attemptId } });
        if (onFinalized) {
          onFinalized(stateRef.current.attemptId);
        }
        return;
      }

      if (res.nextSectionIndex !== nextSecIndex) {
        // Reconcile with the server's authoritative section when a replay or
        // race moved the attempt differently than the optimistic transition.
        try {
          dispatch({
            type: "ADVANCE_SECTION",
            nextSectionIndex: res.nextSectionIndex,
            timestamp: nowIso,
          });
        } catch {
          // Client is already ahead of the server's view; the reducer guards
          // backward navigation, so nothing further is safe to do here.
        }
      }
    } catch (err) {
      console.error("Failed to advance section on server:", err);
    }
  }, [blueprint.sections.length, dispatch, flushPendingSave, onFinalized]);

  // 6. Action: Finalize Attempt
  const handleFinalize = useCallback(async () => {
    const nowIso = new Date().toISOString();
    finalizedSyncRef.current = true;
    dispatch({ type: "FINALIZE", timestamp: nowIso });

    try {
      setIsSaving(true);
      await flushPendingSave();
      await finalizeToeflAttempt({
        data: { attemptId: stateRef.current.attemptId },
      });
      if (onFinalized) {
        onFinalized(stateRef.current.attemptId);
      }
    } catch (err) {
      console.error("Failed to finalize attempt:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, flushPendingSave, onFinalized]);

  const currentSection = blueprint.sections[state.currentSectionIndex];
  const currentItem = currentSection?.items[state.currentItemIndex];
  const currentResponse = currentItem ? state.responses[currentItem.id] : undefined;

  return {
    blueprint,
    state,
    currentSection,
    currentItem,
    currentResponse,
    isSaving,
    handleAnswerChange,
    handleToggleFlag,
    handleNavigateItem,
    handleAdvanceSection,
    handleFinalize,
  };
}
