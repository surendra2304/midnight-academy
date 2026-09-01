/**
 * Deterministic Analytics Engine & Weakness Profiling
 * Calculates skill accuracy, task-type performance, timing efficiency, error classifications, and weakness scores.
 * All computations are 100% deterministic and rule-based.
 */

import type { ToeflItemType, ToeflSectionType } from '@/types/toefl';

export interface RawAttemptMetricInput {
  attemptId: string;
  completedAt: string;
  sectionType: ToeflSectionType;
  itemType: ToeflItemType;
  difficulty: string;
  skillTags: string[];
  isCorrect: boolean | null;
  score: number | null;
  timeSpentMs: number;
  distractorRationale?: string | null;
  evaluationTraits?: Record<string, number>;
}

export interface SkillPerformanceMetric {
  skillName: string;
  sectionType: ToeflSectionType;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercent: number;
  averageTimeSpentSeconds: number;
  weaknessScore: number; // 0 (Strongest) to 100 (Weakest)
}

export interface TaskTypePerformanceMetric {
  itemType: ToeflItemType;
  sectionType: ToeflSectionType;
  totalItems: number;
  accuracyPercent: number;
  averageTimeSeconds: number;
}

export interface LongitudinalTrendPoint {
  attemptId: string;
  date: string;
  overallBand: number;
  readingBand: number;
  listeningBand: number;
  writingBand: number;
  speakingBand: number;
}

export interface ErrorPatternSummary {
  taskType: ToeflItemType;
  skillName: string;
  frequencyCount: number;
  commonDistractorNote?: string;
}

export interface StudentWeaknessProfile {
  studentId: string;
  calculatedAt: string;
  totalTestsCompleted: number;
  bestOverallBand: number;
  averageOverallBand: number;
  latestOverallBand: number;
  sectionAverages: Record<ToeflSectionType, number>;
  topWeakSkills: SkillPerformanceMetric[];
  topStrongSkills: SkillPerformanceMetric[];
  taskTypeBreakdown: TaskTypePerformanceMetric[];
  errorPatterns: ErrorPatternSummary[];
  longitudinalTrends: LongitudinalTrendPoint[];
}

export class AnalyticsEngine {
  /**
   * Computes a weakness score combining accuracy, frequency weight, and penalty.
   * Formula: weaknessScore = (100 - accuracyPercent) * recencyAndVolumeFactor
   */
  calculateWeaknessScore(accuracyPercent: number, totalAttempts: number): number {
    const errorRate = Math.max(0, 100 - accuracyPercent);
    // Give higher confidence/weight to skills attempted at least 3 times
    const volumeFactor = totalAttempts >= 3 ? 1.0 : totalAttempts === 2 ? 0.8 : 0.6;
    return Number((errorRate * volumeFactor).toFixed(1));
  }

  /**
   * Aggregates raw attempt responses into a complete deterministic weakness profile.
   */
  computeStudentProfile(
    studentId: string,
    rawMetrics: RawAttemptMetricInput[],
    scoreReports: Array<{
      attemptId: string;
      generatedAt: string;
      overallBand: number;
      readingBand: number;
      listeningBand: number;
      writingBand: number;
      speakingBand: number;
    }> = [],
  ): StudentWeaknessProfile {
    const skillMap = new Map<
      string,
      {
        skillName: string;
        sectionType: ToeflSectionType;
        total: number;
        correct: number;
        totalTimeMs: number;
      }
    >();

    const taskMap = new Map<
      ToeflItemType,
      {
        itemType: ToeflItemType;
        sectionType: ToeflSectionType;
        total: number;
        correct: number;
        totalTimeMs: number;
      }
    >();

    const errorMap = new Map<string, { count: number; note?: string; taskType: ToeflItemType; skill: string }>();

    for (const item of rawMetrics) {
      const isCorrect = item.isCorrect === true || (item.score !== null && item.score >= 0.75);

      // 1. Aggregate Skill Tags
      for (const skill of item.skillTags || []) {
        const key = `${item.sectionType}:${skill}`;
        const prev = skillMap.get(key) || {
          skillName: skill,
          sectionType: item.sectionType,
          total: 0,
          correct: 0,
          totalTimeMs: 0,
        };

        prev.total += 1;
        if (isCorrect) prev.correct += 1;
        prev.totalTimeMs += item.timeSpentMs;
        skillMap.set(key, prev);
      }

      // 2. Aggregate Task Type Metrics
      const taskPrev = taskMap.get(item.itemType) || {
        itemType: item.itemType,
        sectionType: item.sectionType,
        total: 0,
        correct: 0,
        totalTimeMs: 0,
      };
      taskPrev.total += 1;
      if (isCorrect) taskPrev.correct += 1;
      taskPrev.totalTimeMs += item.timeSpentMs;
      taskMap.set(item.itemType, taskPrev);

      // 3. Error Classification
      if (!isCorrect) {
        const primarySkill = item.skillTags?.[0] || 'General';
        const errKey = `${item.itemType}:${primarySkill}`;
        const errPrev = errorMap.get(errKey) || {
          count: 0,
          taskType: item.itemType,
          skill: primarySkill,
          note: item.distractorRationale || undefined,
        };
        errPrev.count += 1;
        errorMap.set(errKey, errPrev);
      }
    }

    // Build Skill Metrics
    const skillMetrics: SkillPerformanceMetric[] = Array.from(skillMap.values()).map((s) => {
      const accuracyPercent = s.total > 0 ? Number(((s.correct / s.total) * 100).toFixed(1)) : 0;
      const averageTimeSpentSeconds = s.total > 0 ? Number((s.totalTimeMs / (s.total * 1000)).toFixed(1)) : 0;
      const weaknessScore = this.calculateWeaknessScore(accuracyPercent, s.total);

      return {
        skillName: s.skillName,
        sectionType: s.sectionType,
        totalAttempts: s.total,
        correctAttempts: s.correct,
        accuracyPercent,
        averageTimeSpentSeconds,
        weaknessScore,
      };
    });

    // Sort by weakness
    const sortedByWeakness = [...skillMetrics].sort((a, b) => b.weaknessScore - a.weaknessScore);
    const sortedByStrength = [...skillMetrics].sort((a, b) => a.weaknessScore - b.weaknessScore);

    // Build Task Type Breakdown
    const taskTypeBreakdown: TaskTypePerformanceMetric[] = Array.from(taskMap.values()).map((t) => ({
      itemType: t.itemType,
      sectionType: t.sectionType,
      totalItems: t.total,
      accuracyPercent: t.total > 0 ? Number(((t.correct / t.total) * 100).toFixed(1)) : 0,
      averageTimeSeconds: t.total > 0 ? Number((t.totalTimeMs / (t.total * 1000)).toFixed(1)) : 0,
    }));

    // Build Error Patterns
    const errorPatterns: ErrorPatternSummary[] = Array.from(errorMap.values()).map((e) => ({
      taskType: e.taskType,
      skillName: e.skill,
      frequencyCount: e.count,
      commonDistractorNote: e.note,
    }));

    // Build Longitudinal Trends from Score Reports
    const trends: LongitudinalTrendPoint[] = scoreReports.map((sr) => ({
      attemptId: sr.attemptId,
      date: sr.generatedAt,
      overallBand: sr.overallBand,
      readingBand: sr.readingBand,
      listeningBand: sr.listeningBand,
      writingBand: sr.writingBand,
      speakingBand: sr.speakingBand,
    }));

    const bands = scoreReports.map((s) => s.overallBand);
    const bestOverallBand = bands.length > 0 ? Math.max(...bands) : 0;
    const averageOverallBand = bands.length > 0 ? Number((bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(1)) : 0;
    const latestOverallBand = bands.length > 0 ? bands[bands.length - 1] : 0;

    // Section Averages
    const secAvg = (key: 'readingBand' | 'listeningBand' | 'writingBand' | 'speakingBand') => {
      const vals = scoreReports.map((s) => s[key]);
      return vals.length > 0 ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
    };

    return {
      studentId,
      calculatedAt: new Date().toISOString(),
      totalTestsCompleted: scoreReports.length,
      bestOverallBand,
      averageOverallBand,
      latestOverallBand,
      sectionAverages: {
        reading: secAvg('readingBand'),
        listening: secAvg('listeningBand'),
        writing: secAvg('writingBand'),
        speaking: secAvg('speakingBand'),
      },
      topWeakSkills: sortedByWeakness.slice(0, 5),
      topStrongSkills: sortedByStrength.slice(0, 5),
      taskTypeBreakdown,
      errorPatterns: errorPatterns.sort((a, b) => b.frequencyCount - a.frequencyCount).slice(0, 6),
      longitudinalTrends: trends,
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
