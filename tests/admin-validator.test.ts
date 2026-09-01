import { describe, it, expect } from 'vitest';
import {
  contentValidator,
  type ValidationBlueprintSpec,
} from '../src/lib/admin/content-validator';

describe('Admin Studio Content Validation Suite', () => {
  it('validates correct blueprint structure and passes valid test', () => {
    const validBlueprint: ValidationBlueprintSpec = {
      testVersionId: 'v-1',
      name: 'TOEFL iBT Full Mock 1',
      sections: [
        {
          id: 'sec-1',
          sectionType: 'reading',
          timingSeconds: 1800,
          items: [
            {
              id: 'item-1',
              sectionType: 'reading',
              itemType: 'read_academic',
              options: [
                { optionKey: 'A', optionText: 'Option 1', isCorrect: true },
                { optionKey: 'B', optionText: 'Option 2', isCorrect: false },
              ],
            },
          ],
        },
      ],
    };

    const result = contentValidator.validateBlueprint(validBlueprint);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('fails pre-publish validation if multiple choice question is missing a correct key', () => {
    const invalidBlueprint: ValidationBlueprintSpec = {
      testVersionId: 'v-2',
      name: 'Broken Test',
      sections: [
        {
          id: 'sec-1',
          sectionType: 'reading',
          timingSeconds: 1800,
          items: [
            {
              id: 'item-1',
              sectionType: 'reading',
              itemType: 'read_academic',
              options: [
                { optionKey: 'A', optionText: 'Option 1', isCorrect: false },
                { optionKey: 'B', optionText: 'Option 2', isCorrect: false },
              ],
            },
          ],
        },
      ],
    };

    const result = contentValidator.validateBlueprint(invalidBlueprint);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('missing a correct answer key'))).toBe(true);
  });

  it('fails pre-publish validation if section timing is zero or items are empty', () => {
    const invalidBlueprint: ValidationBlueprintSpec = {
      testVersionId: 'v-3',
      name: 'Empty Section Test',
      sections: [
        {
          id: 'sec-1',
          sectionType: 'listening',
          timingSeconds: 0, // Invalid
          items: [], // Empty
        },
      ],
    };

    const result = contentValidator.validateBlueprint(invalidBlueprint);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('greater than 0'))).toBe(true);
    expect(result.errors.some((e) => e.message.includes('no content items attached'))).toBe(true);
  });
});
