/**
 * Admin Studio Server Functions
 * Versioned test builder, AI drafting with human review approval, content validation, and publish/retire lifecycle.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { contentValidator, type ValidationBlueprintSpec } from "./content-validator";
import { chatJson } from "@/lib/ai.server";
import type { ToeflBlueprintStatus, ToeflItemType, ToeflSectionType } from "@/types/toefl";

// 1. AI Question Drafting (Admin-only, lands in Review state, NEVER auto-published)
export const generateAiQuestionDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        sectionType: z.enum(["reading", "listening", "writing", "speaking"]),
        itemType: z.enum([
          "complete_words",
          "read_daily_life",
          "read_academic",
          "listen_choose_response",
          "listen_conversation",
          "listen_announcement",
          "listen_academic_talk",
          "build_sentence",
          "write_email",
          "academic_discussion",
          "listen_repeat",
          "take_interview",
        ]),
        topic: z.string().min(2),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        skillTags: z.array(z.string()).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    // Check admin/instructor role
    const { data: userRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .single();

    if (!userRole || userRole.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const systemPrompt = `You are the official TOEFL iBT 2026 Test Content Designer.
Generate a high-quality, completely original TOEFL test question draft following ETS 2026 specifications.
Output valid JSON strictly following this schema:
{
  "title": "<Concise passage or task title>",
  "prompt": "<Exact student prompt/question text>",
  "passage": "<Reading passage text or conversation scenario context>",
  "wordBank": ["<optional array of words for Build a Sentence>"],
  "options": [
    { "optionKey": "A", "optionText": "<text>", "isCorrect": true, "distractorRationale": "<explanation>" },
    { "optionKey": "B", "optionText": "<text>", "isCorrect": false, "distractorRationale": "<explanation>" }
  ],
  "modelAnswer": "<Exemplary model response for writing/speaking/reading>",
  "keyConcepts": ["<concept1>", "<concept2>"]
}`;

    const draft = await chatJson<Record<string, any>>([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Create a ${data.difficulty} difficulty TOEFL ${data.sectionType} task of type "${data.itemType}" on the academic topic: "${data.topic}". Tags: [${(data.skillTags || []).join(", ")}]`,
      },
    ]);

    return {
      status: "draft_review_required" as const,
      draft,
      generatedAt: new Date().toISOString(),
    };
  });

// 2. Validate Test Version Completeness & Balance Workflow
export const validateTestVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ testVersionId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    // Fetch complete blueprint structure from DB
    const { data: version, error: vErr } = await supabaseAdmin
      .from("test_versions")
      .select("id, test_id, blueprint_version, status, tests(name)")
      .eq("id", data.testVersionId)
      .single();

    if (vErr || !version) throw new Error("Test version not found");

    const { data: sections } = await supabaseAdmin
      .from("sections")
      .select(
        "id, section_type, timing_seconds, modules(id, content_items(id, item_type, section_type, question_options(id, option_key, option_text, is_correct)))",
      )
      .eq("test_version_id", version.id);

    const spec: ValidationBlueprintSpec = {
      testVersionId: version.id,
      name: (version.tests as { name?: string })?.name || "Untitled Test",
      sections: (sections || []).map((s: any) => {
        const items = (s.modules || []).flatMap((m: any) => m.content_items || []);
        return {
          id: s.id,
          sectionType: s.section_type as ToeflSectionType,
          timingSeconds: s.timing_seconds,
          items: items.map((i: any) => ({
            id: i.id,
            itemType: i.item_type as ToeflItemType,
            sectionType: i.section_type as ToeflSectionType,
            options: (i.question_options || []).map((o: any) => ({
              optionKey: o.option_key,
              optionText: o.option_text,
              isCorrect: o.is_correct,
            })),
          })),
        };
      }),
    };

    return contentValidator.validateBlueprint(spec);
  });

// 3. Publish Test Version Workflow (Draft -> Published; Enforces Immutability)
export const publishTestVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ testVersionId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: userRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .single();

    if (!userRole || userRole.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Validate first before publishing
    const validation = await validateTestVersion({ data: { testVersionId: data.testVersionId } });
    if (!validation.isValid) {
      throw new Error(`Cannot publish: ${validation.errors.map((e) => e.message).join("; ")}`);
    }

    // Update status to published
    const { data: updated, error } = await supabaseAdmin
      .from("test_versions")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", data.testVersionId)
      .select("id, status, published_at")
      .single();

    if (error) throw new Error(`Publish failed: ${error.message}`);
    return { testVersionId: updated.id, status: updated.status };
  });

// 4. Retire Test Version Workflow
export const retireTestVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ testVersionId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: userRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .single();

    if (!userRole || userRole.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const { data: updated, error } = await supabaseAdmin
      .from("test_versions")
      .update({ status: "retired" })
      .eq("id", data.testVersionId)
      .select("id, status")
      .single();

    if (error) throw new Error(`Retire failed: ${error.message}`);
    return { testVersionId: updated.id, status: updated.status };
  });
