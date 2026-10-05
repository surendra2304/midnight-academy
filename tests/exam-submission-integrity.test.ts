/**
 * Exam timer & submission integrity regressions.
 *
 * These tests lock in the server-authoritative behavior of the TOEFL attempt
 * lifecycle (advance, expire, finalize, retry, resume) against the local
 * Supabase engine, mirroring the real full-flow suite. They exist because the
 * evaluation pipeline must run exactly once per submission, timers must never
 * be extendable by replayed requests, and submitted attempts must never resume
 * as an editable runner.
 */
import { describe, it, expect } from "vitest";
import { createLocalSupabaseClient } from "../src/integrations/supabase/local-db";
import {
  attemptSessionService,
  PENDING_EVALUATION_STALE_MS,
} from "../src/lib/tests/session-service.server";
import { sessionReducer, type SessionSnapshot } from "../src/lib/tests/session-state";
import { ALL_TESTGLIDER_BLUEPRINTS } from "../src/data/testglider-2026-catalog";

const STUDENT_ID = "00000000-0000-4000-8000-000000000001";
const MOON_VERSION_ID = ALL_TESTGLIDER_BLUEPRINTS[0].id;

async function startFullAttempt() {
  return attemptSessionService.startAttempt({
    studentId: STUDENT_ID,
    testVersionId: MOON_VERSION_ID,
    examMode: "full",
    allowRetake: true,
  });
}

async function startReadingSectionAttempt() {
  return attemptSessionService.startAttempt({
    studentId: STUDENT_ID,
    testVersionId: MOON_VERSION_ID,
    examMode: "section",
    sectionTypeFilter: "reading",
    allowRetake: true,
  });
}

async function setAttemptRow(
  supabase: ReturnType<typeof createLocalSupabaseClient>,
  attemptId: string,
  values: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("attempts")
    .update(values as never)
    .eq("id", attemptId);
  if (error) throw error;
}

async function scoreReportCount(
  supabase: ReturnType<typeof createLocalSupabaseClient>,
  attemptId: string,
) {
  const { data, error } = await supabase
    .from("score_reports")
    .select("id")
    .eq("attempt_id", attemptId);
  if (error) throw error;
  return (data ?? []).length;
}

async function attemptRow(
  supabase: ReturnType<typeof createLocalSupabaseClient>,
  attemptId: string,
) {
  const { data, error } = await supabase
    .from("attempts")
    .select("id, status, evaluation_status, completed_at")
    .eq("id", attemptId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function sectionRows(
  supabase: ReturnType<typeof createLocalSupabaseClient>,
  attemptId: string,
) {
  const { data, error } = await supabase
    .from("attempt_sections")
    .select("id, status, started_at, completed_at, sections(id, section_order)")
    .eq("attempt_id", attemptId);
  if (error) throw error;
  return [...(data ?? [])].sort(
    (a, b) =>
      ((a.sections as { section_order?: number } | null)?.section_order ?? 0) -
      ((b.sections as { section_order?: number } | null)?.section_order ?? 0),
  );
}

function expireSectionStart(
  supabase: ReturnType<typeof createLocalSupabaseClient>,
  attemptSectionId: string,
  timingSeconds: number,
) {
  const expiredAt = new Date(Date.now() - (timingSeconds + 120) * 1000).toISOString();
  return supabase
    .from("attempt_sections")
    .update({ started_at: expiredAt } as never)
    .eq("id", attemptSectionId);
}

describe("Exam timer & submission integrity", () => {
  it("replaying advance cannot re-stamp the next section's started_at or skip ahead", async () => {
    const supabase = createLocalSupabaseClient();
    const { snapshot } = await startFullAttempt();
    const attemptId = snapshot.attemptId;

    const first = await attemptSessionService.advanceSection(attemptId, STUDENT_ID, 0);
    expect(first).toEqual({ nextSectionIndex: 1, isFinalized: false });

    const rowsAfterFirst = await sectionRows(supabase, attemptId);
    const secondRow = rowsAfterFirst[1];
    expect(secondRow?.status).toBe("in_progress");
    const originalStartedAt = secondRow?.started_at;
    expect(originalStartedAt).toBeTruthy();

    // A duplicate/replayed advance for the same section must be a no-op: it may
    // not restart the already-running section (timer extension exploit) and it
    // may not start the section after it.
    const replay = await attemptSessionService.advanceSection(attemptId, STUDENT_ID, 0);
    expect(replay.isFinalized).toBe(false);
    expect(replay.nextSectionIndex).toBe(1);

    const rowsAfterReplay = await sectionRows(supabase, attemptId);
    expect(rowsAfterReplay[1]?.status).toBe("in_progress");
    expect(rowsAfterReplay[1]?.started_at).toBe(originalStartedAt);
    expect(rowsAfterReplay[2]?.status).toBe("not_started");

    // Attempting to skip to a future section index is rejected too: it neither
    // completes a never-started section nor activates the next one.
    const skip = await attemptSessionService.advanceSection(attemptId, STUDENT_ID, 2);
    expect(skip).toEqual({ nextSectionIndex: 1, isFinalized: false });
    const rowsAfterSkip = await sectionRows(supabase, attemptId);
    expect(rowsAfterSkip[2]?.status).toBe("not_started");
  });

  it("advancing past the final section never half-submits; finalize owns evaluation start", async () => {
    const supabase = createLocalSupabaseClient();
    const { blueprint, snapshot } = await startFullAttempt();
    const attemptId = snapshot.attemptId;
    const sectionCount = blueprint.sections.length;
    expect(sectionCount).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < sectionCount; i += 1) {
      const res = await attemptSessionService.advanceSection(attemptId, STUDENT_ID, i);
      if (i < sectionCount - 1) {
        expect(res).toEqual({ nextSectionIndex: i + 1, isFinalized: false });
      } else {
        expect(res.isFinalized).toBe(true);
      }
    }

    // Advancing beyond the last section used to flip the attempt to
    // `evaluating/pending` without ever running the pipeline (dead submission).
    const row = await attemptRow(supabase, attemptId);
    expect(row?.status).toBe("in_progress");
    expect(row?.evaluation_status).toBe("not_started");

    const finalized = await attemptSessionService.finalizeAttempt(attemptId, STUDENT_ID);
    expect(finalized.status).toBe("evaluated");
    expect(await scoreReportCount(supabase, attemptId)).toBe(1);
  });

  it("rejects saving a response once the server-side section clock expired, and resumes locked", async () => {
    const supabase = createLocalSupabaseClient();
    const { blueprint, snapshot } = await startReadingSectionAttempt();
    const attemptId = snapshot.attemptId;
    const section = blueprint.sections[0];

    const rows = await sectionRows(supabase, attemptId);
    const active = rows.find((r) => r.status === "in_progress");
    expect(active).toBeTruthy();

    await expireSectionStart(supabase, active!.id, section.timingSeconds);

    const resumed = await attemptSessionService.resumeAttempt(attemptId, STUDENT_ID);
    expect(resumed.snapshot.status).toBe("section_transition");
    expect(resumed.snapshot.isSectionLocked).toBe(true);

    const itemId = section.items[0].id;
    await expect(
      attemptSessionService.saveResponse({
        attemptId,
        studentId: STUDENT_ID,
        contentItemId: itemId,
        rawAnswer: "late answer",
      }),
    ).rejects.toThrow(/expired/i);
  });

  it("concurrent finalize cannot double-run the evaluation pipeline", async () => {
    const supabase = createLocalSupabaseClient();
    const { blueprint, snapshot } = await startReadingSectionAttempt();
    const attemptId = snapshot.attemptId;

    await attemptSessionService.saveResponse({
      attemptId,
      studentId: STUDENT_ID,
      contentItemId: blueprint.sections[0].items[0].id,
      rawAnswer: "some answer",
    });

    const settled = await Promise.allSettled([
      attemptSessionService.finalizeAttempt(attemptId, STUDENT_ID),
      attemptSessionService.finalizeAttempt(attemptId, STUDENT_ID),
    ]);

    const fulfilled = settled.filter((r) => r.status === "fulfilled");
    const rejected = settled.filter(
      (r) => r.status === "rejected" && /already in progress/i.test(String(r.reason)),
    );
    // Either both callers learn the attempt was evaluated, or exactly one runs
    // the evaluation while the other is refused — never two pipeline runs.
    expect(fulfilled.length + rejected.length).toBe(settled.length);
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);

    const row = await attemptRow(supabase, attemptId);
    expect(row?.status).toBe("evaluated");
    expect(await scoreReportCount(supabase, attemptId)).toBe(1);
  });

  it("finalize refuses to steal an evaluation that is actively pending, but recovers a stale one", async () => {
    const supabase = createLocalSupabaseClient();
    const { snapshot } = await startReadingSectionAttempt();
    const attemptId = snapshot.attemptId;

    // Simulate an evaluation in flight (claimed but not finished).
    await setAttemptRow(supabase, attemptId, {
      status: "evaluating",
      evaluation_status: "pending",
      completed_at: new Date().toISOString(),
    });
    await expect(attemptSessionService.finalizeAttempt(attemptId, STUDENT_ID)).rejects.toThrow(
      /already in progress/i,
    );

    // A pending evaluation older than the stale window is abandoned work and
    // must be recoverable by a plain finalize (crash recovery path).
    await setAttemptRow(supabase, attemptId, {
      completed_at: new Date(Date.now() - PENDING_EVALUATION_STALE_MS - 60_000).toISOString(),
    });
    const recovered = await attemptSessionService.finalizeAttempt(attemptId, STUDENT_ID);
    expect(recovered.status).toBe("evaluated");
    expect(await scoreReportCount(supabase, attemptId)).toBe(1);
  });

  it("resuming a submitted-but-unscored attempt returns a locked scoring snapshot, never an editable runner", async () => {
    const supabase = createLocalSupabaseClient();
    const { snapshot } = await startReadingSectionAttempt();
    const attemptId = snapshot.attemptId;

    await setAttemptRow(supabase, attemptId, {
      status: "evaluating",
      evaluation_status: "pending",
      completed_at: new Date().toISOString(),
    });

    const scoring = await attemptSessionService.resumeAttempt(attemptId, STUDENT_ID);
    expect(scoring.snapshot.status).toBe("scoring");
    expect(scoring.snapshot.isSectionLocked).toBe(true);
    expect(scoring.snapshot.sectionRemainingSeconds).toBe(0);

    // Saves against a submitted attempt must fail closed, not silently corrupt.
    await expect(
      attemptSessionService.saveResponse({
        attemptId,
        studentId: STUDENT_ID,
        contentItemId: scoring.blueprint.sections[0].items[0].id,
        rawAnswer: "post-submit write",
      }),
    ).rejects.toThrow(/not writable/i);
  });

  it("resuming an attempt with all sections completed but still in_progress reports finalized", async () => {
    const { blueprint, snapshot } = await startFullAttempt();
    const attemptId = snapshot.attemptId;

    for (let i = 0; i < blueprint.sections.length; i += 1) {
      await attemptSessionService.advanceSection(attemptId, STUDENT_ID, i);
    }

    const resumed = await attemptSessionService.resumeAttempt(attemptId, STUDENT_ID);
    expect(resumed.snapshot.status).toBe("finalized");
    expect(resumed.snapshot.isSectionLocked).toBe(true);
  });

  it("retryEvaluation will not double-run a pending evaluation and recovers a failed one", async () => {
    const supabase = createLocalSupabaseClient();
    const { snapshot } = await startReadingSectionAttempt();
    const attemptId = snapshot.attemptId;

    await setAttemptRow(supabase, attemptId, {
      status: "evaluating",
      evaluation_status: "pending",
      completed_at: new Date().toISOString(),
    });

    const noop = await attemptSessionService.retryEvaluation(attemptId, STUDENT_ID);
    expect(noop.status).toBe("evaluating");
    expect(await scoreReportCount(supabase, attemptId)).toBe(0);

    await setAttemptRow(supabase, attemptId, { evaluation_status: "failed" });
    const retried = await attemptSessionService.retryEvaluation(attemptId, STUDENT_ID);
    expect(retried.status).toBe("evaluated");
    expect(await scoreReportCount(supabase, attemptId)).toBe(1);
  });

  it("the student-facing blueprint never carries answer keys or model responses", async () => {
    const { blueprint } = await startFullAttempt();

    const forbidden = new Set([
      "answer",
      "answers",
      "answerkey",
      "answerkeyjson",
      "correctanswer",
      "correctanswers",
      "correctoption",
      "correctoptionid",
      "correcttokens",
      "acceptedanswers",
      "acceptedsequences",
      "distractorrationale",
      "explanation",
      "expectedkeyphrases",
      "fullwords",
      "hint",
      "iscorrect",
      "keypointstocover",
      "modelanswer",
      "sampleanswer",
      "samplehighscoringresponse",
      "targetsentence",
    ]);
    const norm = (k: string) => k.replace(/[_-]/g, "").toLowerCase();

    const leaks: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (Array.isArray(value)) {
        value.forEach((entry, i) => walk(entry, `${path}[${i}]`));
        return;
      }
      if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          if (forbidden.has(norm(k))) leaks.push(`${path}.${k}`);
          walk(v, `${path}.${k}`);
        }
      }
    };

    for (const section of blueprint.sections) {
      for (const item of section.items) {
        walk(item.payload, `${item.id}.payload`);
        walk(item.options, `${item.id}.options`);
      }
    }
    expect(leaks).toEqual([]);
  });

  it("pure reducer guards: no backward section navigation, timeout on final section locks", () => {
    const base: SessionSnapshot = {
      attemptId: "00000000-0000-4000-8000-000000000000",
      status: "in_progress",
      examMode: "full",
      currentSectionIndex: 2,
      currentItemIndex: 0,
      sectionStartedAt: new Date().toISOString(),
      sectionRemainingSeconds: 10,
      isSectionLocked: false,
      responses: {},
    };
    const fakeBlueprint = {
      testVersionId: "t",
      testId: "t",
      name: "t",
      examMode: "full" as const,
      blueprintVersion: "1",
      sections: [
        {
          id: "s0",
          sectionType: "reading" as const,
          sectionOrder: 0,
          timingSeconds: 100,
          instructions: "",
          isTimed: true,
          items: [],
        },
        {
          id: "s1",
          sectionType: "listening" as const,
          sectionOrder: 1,
          timingSeconds: 100,
          instructions: "",
          isTimed: true,
          items: [],
        },
        {
          id: "s2",
          sectionType: "writing" as const,
          sectionOrder: 2,
          timingSeconds: 100,
          instructions: "",
          isTimed: true,
          items: [],
        },
      ],
    };

    expect(() =>
      sessionReducer(
        base,
        { type: "ADVANCE_SECTION", nextSectionIndex: 1, timestamp: new Date().toISOString() },
        fakeBlueprint,
      ),
    ).toThrow(/backward|locked/i);

    const timedOut = sessionReducer(
      { ...base, currentSectionIndex: 2 },
      { type: "SECTION_TIMEOUT", timestamp: new Date().toISOString() },
      fakeBlueprint,
    );
    expect(timedOut.status).toBe("finalized");
    expect(timedOut.isSectionLocked).toBe(true);

    const midTimeout = sessionReducer(
      { ...base, currentSectionIndex: 0 },
      { type: "SECTION_TIMEOUT", timestamp: new Date().toISOString() },
      fakeBlueprint,
    );
    expect(midTimeout.status).toBe("section_transition");
    expect(midTimeout.isSectionLocked).toBe(true);
  });
});
