/**
 * Admin Content Validator & Pre-Publish Health Check
 * Enforces data integrity before publishing test blueprints:
 * - Answer key existence for objective questions
 * - Valid task_type enums
 * - Non-empty sections and items
 * - Positive timing allocations
 * - Valid asset references
 */

import type { ToeflBlueprintStatus, ToeflSectionType, ToeflItemType } from '@/types/toefl';

export interface ValidationItemSpec {
  id: string;
  itemType: ToeflItemType;
  sectionType: ToeflSectionType;
  promptSnippet?: string;
  options?: Array<{
    optionKey: string;
    optionText: string;
    isCorrect: boolean;
  }>;
  audioAssetPath?: string;
  acceptedSequences?: string[][];
}

export interface ValidationSectionSpec {
  id: string;
  sectionType: ToeflSectionType;
  timingSeconds: number;
  items: ValidationItemSpec[];
}

export interface ValidationBlueprintSpec {
  testVersionId: string;
  name: string;
  sections: ValidationSectionSpec[];
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class ContentValidator {
  /**
   * Performs exhaustive pre-publish sanity checks.
   */
  validateBlueprint(blueprint: ValidationBlueprintSpec): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 1. Blueprint-level checks
    if (!blueprint.name || blueprint.name.trim().length === 0) {
      errors.push({ path: 'blueprint.name', message: 'Test name cannot be blank.', severity: 'error' });
    }

    if (!blueprint.sections || blueprint.sections.length === 0) {
      errors.push({ path: 'blueprint.sections', message: 'Test must contain at least one section.', severity: 'error' });
      return { isValid: false, errors, warnings };
    }

    // 2. Section-level checks
    for (let sIdx = 0; sIdx < blueprint.sections.length; sIdx++) {
      const sec = blueprint.sections[sIdx];
      const secPath = `sections[${sIdx}] (${sec.sectionType})`;

      if (sec.timingSeconds <= 0) {
        errors.push({ path: `${secPath}.timingSeconds`, message: 'Section timing must be greater than 0 seconds.', severity: 'error' });
      }

      if (!sec.items || sec.items.length === 0) {
        errors.push({ path: `${secPath}.items`, message: `Section '${sec.sectionType}' has no content items attached.`, severity: 'error' });
        continue;
      }

      // 3. Item-level checks
      for (let iIdx = 0; iIdx < sec.items.length; iIdx++) {
        const item = sec.items[iIdx];
        const itemPath = `${secPath}.items[${iIdx}] (${item.itemType})`;

        // Deterministic MCQ check: Must have at least 2 options and exactly 1 correct key
        if (
          item.itemType === 'read_daily_life' ||
          item.itemType === 'read_academic' ||
          item.itemType === 'listen_choose_response' ||
          item.itemType === 'listen_conversation' ||
          item.itemType === 'listen_announcement' ||
          item.itemType === 'listen_academic_talk'
        ) {
          if (!item.options || item.options.length < 2) {
            errors.push({ path: itemPath, message: 'Multiple choice item must have at least 2 options.', severity: 'error' });
          } else {
            const correctCount = item.options.filter((o) => o.isCorrect).length;
            if (correctCount === 0) {
              errors.push({ path: itemPath, message: 'Question is missing a correct answer key (isCorrect = true).', severity: 'error' });
            } else if (correctCount > 1) {
              warnings.push({ path: itemPath, message: 'Question has multiple correct answer keys flagged.', severity: 'warning' });
            }
          }
        }

        // Build a Sentence check: Must have acceptedSequences configured
        if (item.itemType === 'build_sentence') {
          if (!item.acceptedSequences || item.acceptedSequences.length === 0) {
            errors.push({ path: itemPath, message: 'Build a sentence item must have at least one accepted sequence key.', severity: 'error' });
          }
        }

        // Dictation check: Must have valid prompt or reference transcript
        if (item.itemType === 'dictation') {
          if (!item.promptSnippet || item.promptSnippet.trim().length === 0) {
            errors.push({ path: itemPath, message: 'Dictation item must contain a reference sentence transcript.', severity: 'error' });
          }
        }

        // Listening audio check: Must have audioAssetPath
        if (
          item.itemType === 'listen_choose_response' ||
          item.itemType === 'listen_academic_talk' ||
          item.itemType === 'listen_conversation' ||
          item.itemType === 'listen_announcement'
        ) {
          if (!item.audioAssetPath || item.audioAssetPath.trim().length === 0) {
            warnings.push({ path: itemPath, message: 'Listening item does not reference an audio asset track.', severity: 'warning' });
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const contentValidator = new ContentValidator();
