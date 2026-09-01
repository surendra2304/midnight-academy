/**
 * TanStack Start Server Functions for TOEFL Test Engine
 * Provides authenticated, validated, server-side session operations.
 */

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const startToeflAttempt = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        testVersionId: z.string(),
        examMode: z.enum(['full', 'section', 'practice', 'diagnostic']).optional(),
        allowRetake: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import('./session-service.server');
    return attemptSessionService.startAttempt({
      testVersionId: data.testVersionId,
      studentId: context.userId,
      examMode: data.examMode,
      allowRetake: data.allowRetake,
    });
  });

export const resumeToeflAttempt = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import('./session-service.server');
    return attemptSessionService.resumeAttempt(data.attemptId, context.userId);
  });

export const saveToeflResponse = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z
      .object({
        attemptId: z.string().uuid(),
        contentItemId: z.string().uuid(),
        rawAnswer: z.string().nullable(),
        normalizedAnswer: z.record(z.string(), z.unknown()).optional(),
        timeSpentMs: z.number().int().nonnegative().optional(),
        flagged: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import('./session-service.server');
    return attemptSessionService.saveResponse({
      attemptId: data.attemptId,
      studentId: context.userId,
      contentItemId: data.contentItemId,
      rawAnswer: data.rawAnswer,
      normalizedAnswer: data.normalizedAnswer,
      timeSpentMs: data.timeSpentMs,
      flagged: data.flagged,
    });
  });

export const advanceToeflSection = createServerFn({ method: 'POST' })
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
    const { attemptSessionService } = await import('./session-service.server');
    return attemptSessionService.advanceSection(data.attemptId, context.userId, data.currentSectionIndex);
  });

export const finalizeToeflAttempt = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ attemptId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { attemptSessionService } = await import('./session-service.server');
    return attemptSessionService.finalizeAttempt(data.attemptId, context.userId);
  });
