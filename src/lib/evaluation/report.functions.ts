/**
 * TOEFL Unified Score Report Data Loader (Server-Side)
 * Aggregates published score reports, section breakdowns, error patterns, and practice recommendations.
 * Strictly verifies attempt ownership against student session.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { canRevealScoreReportAnswers } from "./report-access";

const SECTION_ORDER_WEIGHT: Record<string, number> = {
  reading: 0,
  listening: 1,
  writing: 2,
  speaking: 3,
};

export const getToeflScoreReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { attemptId } = data;

    // 1. Fetch Attempt & Parent Test
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("attempts")
      .select(
        "id, test_id, test_version_id, student_id, status, exam_mode, selected_section_type, evaluation_status, score, started_at, completed_at, tests(id, name, category, difficulty, code)",
      )
      .eq("id", attemptId)
      .single();

    if (aErr || !attempt) {
      throw new Error("Attempt not found");
    }

    // Ownership check
    if (attempt.student_id !== context.userId) {
      throw new Error("Unauthorized: You do not have access to this score report.");
    }

    // The report endpoint also serves the answer key for review. Do not fetch response
    // payloads, correct options, or explanations while an attempt is active or scoring.
    if (!canRevealScoreReportAnswers(attempt.status, attempt.evaluation_status)) {
      return {
        attempt: { ...attempt, score: null },
        report: null,
        userEmail: "Signed-in learner",
        targetScore: null,
        attemptSections: [],
        responses: [],
        recommendations: [],
      };
    }

    // 2. Fetch Score Report
    const { data: report, error: reportError } = await supabaseAdmin
      .from("score_reports")
      .select("*")
      .eq("attempt_id", attemptId)
      .maybeSingle();
    if (reportError) throw new Error(`Failed to load score report: ${reportError.message}`);

    // 3. Fetch Attempt Sections
    const { data: attemptSections, error: sectionsError } = await supabaseAdmin
      .from("attempt_sections")
      .select(
        "id, section_id, status, raw_score, section_band, time_spent_seconds, sections(id, section_type, timing_seconds, section_order)",
      )
      .eq("attempt_id", attemptId)
      .order("created_at", { ascending: true });
    if (sectionsError) throw new Error(`Failed to load attempt sections: ${sectionsError.message}`);

    // 4. Fetch Responses, Items, and Evaluations
    const attemptSecIds = (attemptSections || []).map((s) => s.id);

    const { data: responses, error: responsesError } = await supabaseAdmin
      .from("responses")
      .select(
        "id, attempt_section_id, content_item_id, raw_answer, normalized_answer, is_correct, score, time_spent_ms, flagged, answered_at, content_items(id, section_type, item_type, difficulty, skill_tags, payload, item_order)",
      )
      .in("attempt_section_id", attemptSecIds);
    if (responsesError)
      throw new Error(`Failed to load response review: ${responsesError.message}`);

    const respIds = (responses || []).map((r) => r.id);

    const { data: evaluations, error: evaluationsError } = await supabaseAdmin
      .from("evaluations")
      .select("*")
      .in("response_id", respIds.length > 0 ? respIds : ["00000000-0000-0000-0000-000000000000"]);
    if (evaluationsError)
      throw new Error(`Failed to load response evaluations: ${evaluationsError.message}`);

    const evalByResp = new Map<string, NonNullable<typeof evaluations>[number]>();
    for (const ev of evaluations || []) {
      evalByResp.set(ev.response_id, ev);
    }

    // 5. Fetch Question Options for Objective Items
    const contentItemIds = (responses || []).map((r) => r.content_item_id);
    const { data: options, error: optionsError } = await supabaseAdmin
      .from("question_options")
      .select("id, content_item_id, option_key, option_text, is_correct, distractor_rationale")
      .in(
        "content_item_id",
        contentItemIds.length > 0 ? contentItemIds : ["00000000-0000-0000-0000-000000000000"],
      );
    if (optionsError) throw new Error(`Failed to load answer options: ${optionsError.message}`);

    const optionsByItem = new Map<string, NonNullable<typeof options>>();
    for (const opt of options || []) {
      const list = optionsByItem.get(opt.content_item_id) || [];
      list.push(opt);
      optionsByItem.set(opt.content_item_id, list);
    }

    // 6. Fetch Practice Recommendations
    const { data: recommendations, error: recommendationsError } = await supabaseAdmin
      .from("recommendations")
      .select("*")
      .eq("student_id", context.userId)
      .limit(6);
    if (recommendationsError) {
      throw new Error(`Failed to load practice recommendations: ${recommendationsError.message}`);
    }

    // 7. Fetch Candidate Email
    let userEmail = "Signed-in learner";
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(context.userId);
      if (userData?.user?.email) {
        userEmail = userData.user.email;
      }
    } catch {
      // Fallback if auth admin fails
    }

    // 8. Generate Signed URLs for Speaking Voice Recordings & Sort
    const enhancedResponses = await Promise.all(
      (responses || []).map(async (r) => {
        let audioPlayUrl: string | null = null;
        const normalizedAnswer = (r.normalized_answer as Record<string, unknown> | null) ?? {};
        const storagePath = normalizedAnswer["storagePath"];
        if (r.content_items?.section_type === "speaking" && typeof storagePath === "string") {
          try {
            const { data: signed } = await supabaseAdmin.storage
              .from("speaking-recordings")
              .createSignedUrl(storagePath, 7200);
            if (signed?.signedUrl) {
              audioPlayUrl = signed.signedUrl;
            }
          } catch (e) {
            console.error("Failed to generate signed url for speaking recording:", e);
          }
        } else if (r.raw_answer?.startsWith("http") || r.raw_answer?.startsWith("data:")) {
          audioPlayUrl = r.raw_answer;
        }

        return {
          ...r,
          audioPlayUrl,
          evaluation: evalByResp.get(r.id) || null,
          options: optionsByItem.get(r.content_item_id) || [],
        };
      }),
    );

    enhancedResponses.sort((a, b) => {
      const secA = SECTION_ORDER_WEIGHT[a.content_items?.section_type || "reading"] ?? 99;
      const secB = SECTION_ORDER_WEIGHT[b.content_items?.section_type || "reading"] ?? 99;
      if (secA !== secB) return secA - secB;
      const ordA = (a.content_items as { item_order?: number } | null)?.item_order ?? 0;
      const ordB = (b.content_items as { item_order?: number } | null)?.item_order ?? 0;
      return ordA - ordB;
    });

    return {
      attempt,
      report,
      userEmail,
      targetScore: report?.target_score ?? null,
      attemptSections: attemptSections || [],
      responses: enhancedResponses,
      recommendations: recommendations || [],
    };
  });
