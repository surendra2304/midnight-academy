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
    normalizedAnswer?: Record<string, unknown> | undefined;
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

  // 2. Action: Select / Save Answer for Current Item
  const handleAnswerChange = useCallback(
    (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => {
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
    await flushPendingSave();
    const nextSecIndex = stateRef.current.currentSectionIndex + 1;
    const nowIso = new Date().toISOString();

    try {
      setIsSaving(true);
      const res = await advanceToeflSection({
        data: {
          attemptId: stateRef.current.attemptId,
          currentSectionIndex: stateRef.current.currentSectionIndex,
        },
      });

      dispatch({
        type: "ADVANCE_SECTION",
        nextSectionIndex: res.nextSectionIndex,
        timestamp: nowIso,
      });

      if (res.isFinalized && onFinalized) {
        onFinalized(stateRef.current.attemptId);
      }
    } catch (err) {
      console.error("Failed to advance section:", err);
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, onFinalized]);

  // 6. Action: Finalize Attempt
  const handleFinalize = useCallback(async () => {
    const nowIso = new Date().toISOString();
    dispatch({ type: "FINALIZE", timestamp: nowIso });

    try {
      setIsSaving(true);
      await finalizeToeflAttempt({
        data: { attemptId: stateRef.current.attemptId },
      });
      if (onFinalized) {
        onFinalized(stateRef.current.attemptId);
      }
    } catch (err) {
      console.error("Failed to finalize attempt:", err);
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, onFinalized]);

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
