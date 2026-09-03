import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const sectionTypeSchema = z.enum(["reading", "listening", "writing", "speaking"]);

const startSchema = z.object({
  testVersionId: z.string().uuid(),
  examMode: z.enum(["full", "section", "practice", "diagnostic"]).default("practice"),
  sectionTypeFilter: sectionTypeSchema.optional(),
  allowRetake: z.boolean().default(true),
});

export const startToeflAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => startSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import("./session-service.server");
    return attemptSessionService.startAttempt({
      testVersionId: data.testVersionId,
      studentId: context.userId,
      examMode: data.examMode,
      sectionTypeFilter: data.sectionTypeFilter,
      allowRetake: data.allowRetake,
    });
  });

export const resumeToeflAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import("./session-service.server");
    return attemptSessionService.resumeAttempt(data.attemptId, context.userId);
  });

export const saveToeflResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        attemptId: z.string().uuid(),
        contentItemId: z.string().uuid(),
        rawAnswer: z.string().nullable(),
        normalizedAnswer: z.record(z.string(), z.unknown()).default({}),
        timeSpentMs: z.number().int().nonnegative().default(0),
        flagged: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import("./session-service.server");
    return attemptSessionService.saveResponse({
      ...data,
      studentId: context.userId,
    });
  });

export const advanceToeflSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        attemptId: z.string().uuid(),
        currentSectionIndex: z.number().int().nonnegative(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import("./session-service.server");
    return attemptSessionService.advanceSection(
      data.attemptId,
      context.userId,
      data.currentSectionIndex,
    );
  });

export const finalizeToeflAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import("./session-service.server");
    return attemptSessionService.finalizeAttempt(data.attemptId, context.userId);
  });

export const retryToeflEvaluation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import("./session-service.server");
    return attemptSessionService.retryEvaluation(data.attemptId, context.userId);
  });
