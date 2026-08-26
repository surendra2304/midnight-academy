import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Structured practice library: predefined tests (is_practice = true) that any
 * signed-in student can take through the standard test flow without a code.
 * Read with the service role because general students have not attempted
 * these tests yet, so the "students read tests they attempted" policy does
 * not cover them.
 */
export const listPracticeTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    // Currently cleared per user request. New curated questions will be added later.
    return [];
  });
