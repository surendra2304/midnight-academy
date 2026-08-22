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

const AXIS_KEYS = ["objective", "constraint", "io", "concept", "interpretation"] as const;

/** Computes the student's weakest comprehension axis across attempts (0-100 axes). */
export function weakestAxis(attempts: Array<{ axes: unknown }>): (typeof AXIS_KEYS)[number] | null {
  const sums = new Map<string, { total: number; count: number }>();
  for (const attempt of attempts) {
    const axes = attempt.axes as Record<string, number> | null;
    if (!axes) continue;
    for (const key of AXIS_KEYS) {
      const value = axes[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        const entry = sums.get(key) ?? { total: 0, count: 0 };
        entry.total += value;
        entry.count += 1;
        sums.set(key, entry);
      }
    }
  }
  // No evaluated attempts -> no weakest axis (do not fall back to a fake one)
  if (sums.size === 0) return null;

  let weakest: (typeof AXIS_KEYS)[number] | null = null;
  let lowest = Infinity;
  for (const key of AXIS_KEYS) {
    const entry = sums.get(key);
    if (!entry) continue;
    const avg = entry.total / entry.count;
    if (avg < lowest) {
      lowest = avg;
      weakest = key;
    }
  }
  return weakest;
}
