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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: tests, error } = await supabaseAdmin
      .from("tests")
      .select(
        "id, name, category, difficulty, question_count, seconds_per_question, response_seconds, code, created_at",
      )
      .eq("is_practice", true)
      .eq("status", "active")
      .order("category", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error("Could not load the practice library. Please try again.");

    const normalizeCategory = (cat: string) => {
      if (cat === "OS") return "Operating Systems";
      if (cat === "Networks") return "Computer Networks";
      return cat;
    };

    return (tests ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      category: normalizeCategory(t.category),
      difficulty: t.difficulty,
      questions: t.question_count,
      secondsPerQuestion: t.seconds_per_question,
      responseSeconds: t.response_seconds,
      code: t.code,
    }));
  });
