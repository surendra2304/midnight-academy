/** Server-only helpers for admin/instructor server functions. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function assertAdmin(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Admin access required.");
}

/** Splits a pasted document or list into individual question strings. */
export function splitQuestions(raw: string): string[] {
  const byBlank = raw
    .split(/\n\s*\n/)
    .map((chunk) => chunk.replace(/^\s*(?:Q?\d+[).:]|[-*])\s*/i, "").trim())
    .filter((chunk) => chunk.length > 20);
  if (byBlank.length > 1) return byBlank.slice(0, 25);

  const byNumber = raw
    .split(/(?=(?:^|\n)\s*Q?\d+[).:]\s)/)
    .map((chunk) => chunk.replace(/^\s*Q?\d+[).:]\s*/i, "").trim())
    .filter((chunk) => chunk.length > 20);
  if (byNumber.length > 1) return byNumber.slice(0, 25);

  return raw.trim().length > 20 ? [raw.trim()] : [];
}

export function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
