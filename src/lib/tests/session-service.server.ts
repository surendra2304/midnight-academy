import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadTestBlueprint } from "./blueprint-loader";
import {
  calculateRemainingSeconds,
  type SessionSnapshot,
  type ItemResponseState,
} from "./session-state";
import type { ToeflExamMode, ToeflSectionType } from "@/types/toefl";

export interface StartAttemptOptions {
  testVersionId: string;
  studentId: string;
  examMode?: ToeflExamMode;
  sectionTypeFilter?: ToeflSectionType | undefined;
  allowRetake?: boolean;
}

export class AttemptSessionService {
  async startAttempt(options: StartAttemptOptions) {
    const {
      testVersionId,
      studentId,
      examMode = "practice",
      sectionTypeFilter,
      allowRetake = true,
    } = options;

    const { data: version, error: versionErr } = await supabaseAdmin
      .from("test_versions")
      .select("id, test_id, status")
      .eq("id", testVersionId)
      .single();

    if (versionErr || !version) {
      throw new Error("Selected test version does not exist.");
    }
    if (version.status !== "published") {
      throw new Error("Selected test version is not published.");
    }

    // Verify requested section exists before creating the attempt.
    if (sectionTypeFilter) {
      const { data: matchingSection, error: sectionCheckErr } = await supabaseAdmin
        .from("sections")
        .select("id")
        .eq("test_version_id", testVersionId)
        .eq("section_type", sectionTypeFilter)
        .maybeSingle();

      if (sectionCheckErr) {
        throw new Error(`Failed to validate selected section: ${sectionCheckErr.message}`);
      }
      if (!matchingSection) {
        throw new Error(`This test has no ${sectionTypeFilter} section.`);
      }
    }

    if (!allowRetake) {
      const { data: existing, error: existingErr } = await supabaseAdmin
        .from("attempts")
        .select("id, status")
        .eq("test_version_id", testVersionId)
        .eq("student_id", studentId)
        .eq("status", "in_progress")
        .maybeSingle();

      if (existingErr) {
        throw new Error(`Failed to check existing attempt: ${existingErr.message}`);
      }
      if (existing) {
        return this.resumeAttempt(existing.id, studentId);
      }
    }

    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from("attempts")
      .insert({
        test_id: version.test_id ?? version.id,
        test_version_id: version.id,
        exam_mode: examMode,
        student_id: studentId,
        status: "in_progress",
        started_at: new Date().toISOString(),
        ...(sectionTypeFilter ? { selected_section_type: sectionTypeFilter } : {}),
        evaluation_status: "not_started",
      })
      .select("id")
      .single();

    if (attemptErr || !attempt) {
      throw new Error(
        `Failed to create attempt: ${attemptErr?.message ?? "unknown database error"}`,
      );
    }

    let sectionQuery = supabaseAdmin
      .from("sections")
      .select("id, section_order")
      .eq("test_version_id", version.id)
      .order("section_order", { ascending: true });

    if (sectionTypeFilter) {
      sectionQuery = sectionQuery.eq("section_type", sectionTypeFilter);
    }

    const { data: sections, error: sectionsErr } = await sectionQuery;
    if (sectionsErr || !sections || sections.length === 0) {
      await supabaseAdmin.from("attempts").delete().eq("id", attempt.id);
      throw new Error(
        `Failed to initialize test sections: ${sectionsErr?.message ?? "none found"}`,
      );
    }

    const sectionPayload = sections.map((section, index) => ({
      attempt_id: attempt.id,
      section_id: section.id,
      status: (index === 0 ? "in_progress" : "not_started") as "in_progress" | "not_started",
      started_at: index === 0 ? new Date().toISOString() : null,
    }));

    const { error: attemptSectionErr } = await supabaseAdmin
      .from("attempt_sections")
      .insert(sectionPayload);

    if (attemptSectionErr) {
      await supabaseAdmin.from("attempts").delete().eq("id", attempt.id);
      throw new Error(`Failed to initialize attempt sections: ${attemptSectionErr.message}`);
    }

    return this.resumeAttempt(attempt.id, studentId);
  }

  async resumeAttempt(attemptId: string, studentId: string) {
    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, test_version_id, student_id, status, exam_mode, selected_section_type, evaluation_status",
      )
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptErr) {
      throw new Error(`Failed to load attempt: ${attemptErr.message}`);
    }
    if (!attempt) {
      throw new Error(`Attempt '${attemptId}' not found.`);
    }
    if (attempt.student_id !== studentId) {
      throw new Error("Unauthorized: you do not have access to this attempt.");
    }

    const { data: rawAttemptSections, error: attemptSectionsErr } = await supabaseAdmin
      .from("attempt_sections")
      .select(
        "id, section_id, status, started_at, completed_at, sections(id, section_type, section_order, timing_seconds)",
      )
      .eq("attempt_id", attempt.id);

    if (attemptSectionsErr) {
      throw new Error(`Failed to load attempt sections: ${attemptSectionsErr.message}`);
    }
    if (!rawAttemptSections || rawAttemptSections.length === 0) {
      throw new Error("Attempt contains no sections.");
    }

    const attemptSections = [...rawAttemptSections].sort((a, b) => {
      const orderA = (a.sections as { section_order?: number } | null)?.section_order ?? 0;
      const orderB = (b.sections as { section_order?: number } | null)?.section_order ?? 0;
      return orderA - orderB;
    });

    const firstSection = attemptSections[0];
    const derivedSectionFilter =
      (attempt.selected_section_type as ToeflSectionType | null) ??
      (attemptSections.length === 1 && firstSection
        ? ((firstSection.sections as { section_type?: ToeflSectionType } | null)?.section_type ??
          undefined)
        : undefined);

    if (!attempt.test_version_id) {
      throw new Error("Attempt has no test version.");
    }

    const blueprint = await loadTestBlueprint(
      attempt.test_version_id,
      attempt.exam_mode as ToeflExamMode,
      derivedSectionFilter,
    );

    const activeIndex = Math.max(
      0,
      attemptSections.findIndex((section) => section.status === "in_progress"),
    );

    const currentAttemptSection = attemptSections[activeIndex];
    const currentBlueprintSection = blueprint.sections[activeIndex];

    if (!currentAttemptSection || !currentBlueprintSection) {
      throw new Error("Attempt state and blueprint are inconsistent.");
    }

    const attemptSectionIds = attemptSections.map((section) => section.id);

    const { data: dbResponses, error: responseErr } = await supabaseAdmin
      .from("responses")
      .select("content_item_id, raw_answer, normalized_answer, time_spent_ms, flagged, answered_at")
      .in("attempt_section_id", attemptSectionIds);

    if (responseErr) {
      throw new Error(`Failed to load saved responses: ${responseErr.message}`);
    }

    const responses: Record<string, ItemResponseState> = {};
    for (const response of dbResponses ?? []) {
      responses[response.content_item_id] = {
        rawAnswer: response.raw_answer,
        normalizedAnswer: (response.normalized_answer as Record<string, unknown>) ?? {},
        isAnswered: Boolean(response.raw_answer?.trim()),
        isFlagged: Boolean(response.flagged),
        timeSpentMs: response.time_spent_ms ?? 0,
        lastSavedAt: response.answered_at,
      };
    }

    const timing = calculateRemainingSeconds(
      currentAttemptSection.started_at,
      currentBlueprintSection.timingSeconds,
      currentBlueprintSection.isTimed,
    );

    return {
      blueprint,
      snapshot: {
        attemptId: attempt.id,
        status:
          attempt.status === "evaluated"
            ? "completed"
            : timing.isExpired
              ? "section_transition"
              : "in_progress",
        examMode: attempt.exam_mode as ToeflExamMode,
        currentSectionIndex: activeIndex,
        currentItemIndex: 0,
        sectionStartedAt: currentAttemptSection.started_at,
        sectionRemainingSeconds: timing.remainingSeconds,
        isSectionLocked: timing.isExpired || attempt.status === "evaluated",
        responses,
      } satisfies SessionSnapshot,
    };
  }

  async saveResponse(params: {
    attemptId: string;
    studentId: string;
    contentItemId: string;
    rawAnswer: string | null;
    normalizedAnswer?: Record<string, unknown>;
    timeSpentMs?: number;
    flagged?: boolean;
  }) {
    const {
      attemptId,
      studentId,
      contentItemId,
      rawAnswer,
      normalizedAnswer = {},
      timeSpentMs = 0,
      flagged = false,
    } = params;

    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from("attempts")
      .select("id, student_id, status, test_version_id")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptErr) {
      throw new Error(`Failed to load attempt: ${attemptErr.message}`);
    }
    if (!attempt) throw new Error("Attempt not found.");
    if (attempt.student_id !== studentId) throw new Error("Unauthorized.");
    if (attempt.status !== "in_progress") {
      throw new Error("Attempt is not writable.");
    }

    const { data: active, error: activeErr } = await supabaseAdmin
      .from("attempt_sections")
      .select("id, section_id, status, started_at, sections(id, section_type, timing_seconds)")
      .eq("attempt_id", attemptId)
      .eq("status", "in_progress")
      .maybeSingle();

    if (activeErr) {
      throw new Error(`Failed to load active section: ${activeErr.message}`);
    }
    if (!active) throw new Error("No active section exists.");

    const section = active.sections as {
      id: string;
      section_type: ToeflSectionType;
      timing_seconds: number;
    } | null;

    if (!section) throw new Error("Active section metadata is missing.");

    const { isExpired } = calculateRemainingSeconds(
      active.started_at,
      section.timing_seconds,
      true,
    );
    if (isExpired) throw new Error("Section time has expired.");

    // AUTHORIZE THE CONTENT ITEM AGAINST THE CURRENT ACTIVE SECTION.
    const { data: item, error: itemErr } = await supabaseAdmin
      .from("content_items")
      .select("id, module_id")
      .eq("id", contentItemId)
      .maybeSingle();

    if (itemErr) {
      throw new Error(`Failed to validate content item: ${itemErr.message}`);
    }
    if (!item) throw new Error("Content item does not exist.");
    if (!item.module_id) throw new Error("Content item is not linked to a valid module.");

    const { data: module, error: moduleErr } = await supabaseAdmin
      .from("modules")
      .select("id, section_id")
      .eq("id", item.module_id)
      .maybeSingle();

    if (moduleErr || !module) {
      throw new Error("Content item is not linked to a valid module.");
    }
    if (module.section_id !== section.id) {
      throw new Error("Content item is not part of the active section.");
    }

    const { data: response, error: responseErr } = await supabaseAdmin
      .from("responses")
      .upsert(
        {
          attempt_section_id: active.id,
          content_item_id: contentItemId,
          student_id: studentId,
          raw_answer: rawAnswer,
          normalized_answer: JSON.parse(JSON.stringify(normalizedAnswer)),
          time_spent_ms: timeSpentMs,
          flagged,
          answered_at: new Date().toISOString(),
        },
        { onConflict: "attempt_section_id,content_item_id" },
      )
      .select("id")
      .single();

    if (responseErr || !response) {
      throw new Error(`Failed to save response: ${responseErr?.message ?? "unknown error"}`);
    }

    return { responseId: response.id, savedAt: new Date().toISOString() };
  }

  async advanceSection(attemptId: string, studentId: string, currentSectionIndex: number) {
    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from("attempts")
      .select("id, student_id, status")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptErr) throw new Error(`Failed to load attempt: ${attemptErr.message}`);
    if (!attempt) throw new Error("Attempt not found.");
    if (attempt.student_id !== studentId) throw new Error("Unauthorized.");
    if (attempt.status !== "in_progress") throw new Error("Attempt is not active.");

    const { data: rawSections, error: secErr } = await supabaseAdmin
      .from("attempt_sections")
      .select("id, status, section_id, sections(id, section_order)")
      .eq("attempt_id", attemptId);

    if (secErr || !rawSections || rawSections.length === 0) {
      throw new Error("No attempt sections found.");
    }

    const sortedSections = [...rawSections].sort((a, b) => {
      const orderA = (a.sections as { section_order?: number } | null)?.section_order ?? 0;
      const orderB = (b.sections as { section_order?: number } | null)?.section_order ?? 0;
      return orderA - orderB;
    });

    if (currentSectionIndex < 0 || currentSectionIndex >= sortedSections.length) {
      throw new Error(`Invalid section index: ${currentSectionIndex}`);
    }

    const currentSec = sortedSections[currentSectionIndex];
    if (!currentSec) {
      throw new Error(`Current section not found at index ${currentSectionIndex}`);
    }
    await supabaseAdmin
      .from("attempt_sections")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", currentSec.id);

    const nextSectionIndex = currentSectionIndex + 1;

    if (nextSectionIndex >= sortedSections.length) {
      await supabaseAdmin
        .from("attempts")
        .update({
          status: "evaluating",
          evaluation_status: "pending",
          completed_at: new Date().toISOString(),
        })
        .eq("id", attemptId);

      return { nextSectionIndex, isFinalized: true };
    }

    const nextSec = sortedSections[nextSectionIndex];
    if (!nextSec) {
      throw new Error(`Next section not found at index ${nextSectionIndex}`);
    }
    await supabaseAdmin
      .from("attempt_sections")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", nextSec.id);

    return { nextSectionIndex, isFinalized: false };
  }

  async finalizeAttempt(attemptId: string, studentId: string) {
    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from("attempts")
      .select("id, student_id, status")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptErr) throw new Error(`Failed to load attempt: ${attemptErr.message}`);
    if (!attempt) throw new Error("Attempt not found.");
    if (attempt.student_id !== studentId) throw new Error("Unauthorized.");

    if (attempt.status === "evaluated") {
      return { attemptId, status: "evaluated" as const };
    }
    if (attempt.status !== "in_progress" && attempt.status !== "evaluating") {
      throw new Error(`Attempt cannot be finalized from status '${attempt.status}'.`);
    }

    const { error: updateErr } = await supabaseAdmin
      .from("attempts")
      .update({
        status: "evaluating",
        evaluation_status: "pending",
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId)
      .eq("student_id", studentId)
      .eq("status", "in_progress");

    if (updateErr) {
      throw new Error(`Failed to finalize attempt: ${updateErr.message}`);
    }

    try {
      const { mockEvaluationPipelineService } = await import("../evaluation/mock-pipeline.server");
      await mockEvaluationPipelineService.processAttemptEvaluation(attemptId);
      return { attemptId, status: "evaluated" as const };
    } catch (error) {
      await supabaseAdmin
        .from("attempts")
        .update({
          evaluation_status: "failed",
        })
        .eq("id", attemptId)
        .eq("student_id", studentId);

      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Evaluation failed and is retryable: ${message}`);
    }
  }

  async retryEvaluation(attemptId: string, studentId: string) {
    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from("attempts")
      .select("id, student_id, status, evaluation_status")
      .eq("id", attemptId)
      .maybeSingle();

    if (attemptErr) throw new Error(`Failed to load attempt: ${attemptErr.message}`);
    if (!attempt) throw new Error("Attempt not found.");
    if (attempt.student_id !== studentId) throw new Error("Unauthorized.");

    if (attempt.status === "evaluated" && attempt.evaluation_status === "completed") {
      return { attemptId, status: "evaluated" as const };
    }

    await supabaseAdmin
      .from("attempts")
      .update({
        status: "evaluating",
        evaluation_status: "pending",
      })
      .eq("id", attemptId)
      .eq("student_id", studentId);

    try {
      const { mockEvaluationPipelineService } = await import("../evaluation/mock-pipeline.server");
      await mockEvaluationPipelineService.processAttemptEvaluation(attemptId);
      return { attemptId, status: "evaluated" as const };
    } catch (error) {
      await supabaseAdmin
        .from("attempts")
        .update({
          evaluation_status: "failed",
        })
        .eq("id", attemptId)
        .eq("student_id", studentId);

      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Evaluation retry failed: ${message}`);
    }
  }
}

export const attemptSessionService = new AttemptSessionService();
