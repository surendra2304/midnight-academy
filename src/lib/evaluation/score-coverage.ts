import type { ToeflSectionType } from "@/types/toefl";

export const TOEF_SCORE_SECTIONS: readonly ToeflSectionType[] = [
  "reading",
  "listening",
  "writing",
  "speaking",
];

export function hasFullToeflSectionCoverage(scoredSections: readonly string[]): boolean {
  const scored = new Set(scoredSections);
  return TOEF_SCORE_SECTIONS.every((section) => scored.has(section));
}
