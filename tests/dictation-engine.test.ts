import { describe, it, expect } from 'vitest';
import { computeWordDiff, cleanWord, areHomophones } from '../src/lib/dictation/word-diff-engine';

describe('Dictation Word-Diff & Scoring Engine', () => {
  it('handles cleanWord and punctuation normalization', () => {
    expect(cleanWord(' "Hello," ')).toBe('hello');
    expect(cleanWord("don't.")).toBe("don't");
    expect(cleanWord('campus!')).toBe('campus');
  });

  it('detects common English homophones', () => {
    expect(areHomophones('their', 'there')).toBe(true);
    expect(areHomophones("they're", 'their')).toBe(true);
    expect(areHomophones('accept', 'except')).toBe(true);
    expect(areHomophones('apple', 'banana')).toBe(false);
  });

  it('scores exact matches at 100% accuracy', () => {
    const ref = 'The library will extend its operating hours during finals week.';
    const stu = 'The library will extend its operating hours during finals week.';
    const result = computeWordDiff(stu, ref);

    expect(result.accuracyPercent).toBe(100);
    expect(result.isPerfectMatch).toBe(true);
    expect(result.missingWordCount).toBe(0);
    expect(result.wrongWordCount).toBe(0);
    expect(result.extraWordCount).toBe(0);
    expect(result.correctWordCount).toBe(10);
  });

  it('tolerates case and punctuation differences in exact matches', () => {
    const ref = 'Professor Martinez canceled Friday’s lecture.';
    const stu = "professor martinez canceled fridays lecture";
    const result = computeWordDiff(stu, ref);

    expect(result.accuracyPercent).toBe(100);
    expect(result.isPerfectMatch).toBe(true);
  });

  it('correctly calculates missing words', () => {
    const ref = 'Students must submit their assignments before midnight.';
    const stu = 'Students submit their assignments.';
    const result = computeWordDiff(stu, ref);

    // 4 correct out of 7 reference words
    expect(result.correctWordCount).toBe(4);
    expect(result.missingWordCount).toBe(3); // 'must', 'before', 'midnight'
    expect(result.isPerfectMatch).toBe(false);
    expect(result.accuracyPercent).toBe(57); // round(4/7 * 100)
  });

  it('correctly calculates wrong word substitutions', () => {
    const ref = 'The laboratory equipment requires careful calibration.';
    const stu = 'The library equipment requires fast calibration.';
    const result = computeWordDiff(stu, ref);

    expect(result.wrongWordCount).toBe(2); // 'laboratory' -> 'library', 'careful' -> 'fast'
    expect(result.correctWordCount).toBe(4);
    expect(result.isPerfectMatch).toBe(false);
  });

  it('tolerates homophones when configured', () => {
    const ref = 'They are looking for their lost textbooks over there.';
    const stu = 'They are looking for there lost textbooks over their.';
    const result = computeWordDiff(stu, ref, { allowHomophones: true });

    expect(result.accuracyPercent).toBe(100);
    expect(result.tokens.some((t) => t.isHomophone)).toBe(true);
  });

  it('handles empty student inputs gracefully', () => {
    const ref = 'Academic integrity is strictly enforced.';
    const stu = '';
    const result = computeWordDiff(stu, ref);

    expect(result.accuracyPercent).toBe(0);
    expect(result.isPerfectMatch).toBe(false);
    expect(result.missingWordCount).toBe(5);
    expect(result.correctWordCount).toBe(0);
  });
});
