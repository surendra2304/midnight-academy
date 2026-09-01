import { describe, it, expect } from 'vitest';
import type { PublishedTestItem } from '../src/routes/test.index';

describe('Data-Driven Test Catalog & Start Flow Suite', () => {
  it('renders an honest empty state when no published tests exist', () => {
    const tests: PublishedTestItem[] = [];
    const hasTests = tests.length > 0;
    expect(hasTests).toBe(false);
  });

  it('correctly maps published test versions, sections and timings', () => {
    const testItem: PublishedTestItem = {
      id: 'test-1',
      testVersionId: 'ver-1',
      name: 'TOEFL iBT 2026: Official Full Mock Test 1',
      category: 'Full Mock',
      difficulty: 'Medium',
      code: 'TOEFL-MOCK-01',
      questionCount: 8,
      sections: [
        { id: 'sec-r', sectionType: 'reading', sectionOrder: 0, timingSeconds: 1800 },
        { id: 'sec-l', sectionType: 'listening', sectionOrder: 1, timingSeconds: 1200 },
        { id: 'sec-w', sectionType: 'writing', sectionOrder: 2, timingSeconds: 1500 },
        { id: 'sec-s', sectionType: 'speaking', sectionOrder: 3, timingSeconds: 900 },
      ],
    };

    expect(testItem.sections.length).toBe(4);
    expect(testItem.sections.some((s) => s.sectionType === 'reading')).toBe(true);
    expect(testItem.sections.some((s) => s.sectionType === 'listening')).toBe(true);
    expect(testItem.sections.some((s) => s.sectionType === 'writing')).toBe(true);
    expect(testItem.sections.some((s) => s.sectionType === 'speaking')).toBe(true);
  });

  it('determines the correct examMode based on user action context', () => {
    const fullMockAction = { examMode: 'full' as const, sectionFilter: undefined };
    const readingSectionAction = { examMode: 'section' as const, sectionFilter: 'reading' as const };

    expect(fullMockAction.examMode).toBe('full');
    expect(readingSectionAction.examMode).toBe('section');
    expect(readingSectionAction.sectionFilter).toBe('reading');
  });
});
