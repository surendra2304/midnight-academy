/**
 * TOEFL iBT 2026-Style Practice Test Catalog
 * Aggregates nine original practice sets written for Midnight Academy in the
 * TOEFL iBT 2026 task format (structure and item types only; every passage,
 * transcript, prompt, option, and answer key is authored in-repo and none of
 * it is copied from ETS, TestGlider, or the public mock-test playlist once
 * used as a format reference:
 * https://youtube.com/playlist?list=PLoDNaUsnugSqgJGJKo59X49nkQbwcksMV),
 * plus Dictation, Shadowing, Vocabulary, Lessons, and Practice banks.
 */

import type { SeedBlueprintRow, SeedQuestionItemRow } from "./tests/types";
import { MOON_BLUEPRINT, MOON_ITEMS, MOON_BLUEPRINT_ID } from "./tests/test-1-moon";
import { MARS_BLUEPRINT, MARS_ITEMS, MARS_BLUEPRINT_ID } from "./tests/test-2-mars";
import { VENUS_BLUEPRINT, VENUS_ITEMS, VENUS_BLUEPRINT_ID } from "./tests/test-3-venus";
import { JUPITER_BLUEPRINT, JUPITER_ITEMS, JUPITER_BLUEPRINT_ID } from "./tests/test-4-jupiter";
import { SATURN_BLUEPRINT, SATURN_ITEMS, SATURN_BLUEPRINT_ID } from "./tests/test-5-saturn";
import { MERCURY_BLUEPRINT, MERCURY_ITEMS, MERCURY_BLUEPRINT_ID } from "./tests/test-6-mercury";
import { NEPTUNE_BLUEPRINT, NEPTUNE_ITEMS, NEPTUNE_BLUEPRINT_ID } from "./tests/test-7-neptune";
import { URANUS_BLUEPRINT, URANUS_ITEMS, URANUS_BLUEPRINT_ID } from "./tests/test-8-uranus";
import { PLUTO_BLUEPRINT, PLUTO_ITEMS, PLUTO_BLUEPRINT_ID } from "./tests/test-9-pluto";
import {
  SEED_DICTATION_PASSAGES,
  SEED_SHADOWING_DRILLS,
  SEED_VOCABULARY_WORDS,
  SEED_LESSONS,
  SEED_COMPREHENSION_QUESTIONS,
} from "./practice-datasets";

export {
  MOON_BLUEPRINT_ID,
  MARS_BLUEPRINT_ID,
  VENUS_BLUEPRINT_ID,
  JUPITER_BLUEPRINT_ID,
  SATURN_BLUEPRINT_ID,
  MERCURY_BLUEPRINT_ID,
  NEPTUNE_BLUEPRINT_ID,
  URANUS_BLUEPRINT_ID,
  PLUTO_BLUEPRINT_ID,
  SEED_DICTATION_PASSAGES,
  SEED_SHADOWING_DRILLS,
  SEED_VOCABULARY_WORDS,
  SEED_LESSONS,
  SEED_COMPREHENSION_QUESTIONS,
};

export const ALL_TESTGLIDER_BLUEPRINTS: SeedBlueprintRow[] = [
  MOON_BLUEPRINT,
  MARS_BLUEPRINT,
  VENUS_BLUEPRINT,
  JUPITER_BLUEPRINT,
  SATURN_BLUEPRINT,
  MERCURY_BLUEPRINT,
  NEPTUNE_BLUEPRINT,
  URANUS_BLUEPRINT,
  PLUTO_BLUEPRINT,
];

export const ALL_TESTGLIDER_QUESTION_ITEMS: SeedQuestionItemRow[] = [
  ...MOON_ITEMS,
  ...MARS_ITEMS,
  ...VENUS_ITEMS,
  ...JUPITER_ITEMS,
  ...SATURN_ITEMS,
  ...MERCURY_ITEMS,
  ...NEPTUNE_ITEMS,
  ...URANUS_ITEMS,
  ...PLUTO_ITEMS,
];
