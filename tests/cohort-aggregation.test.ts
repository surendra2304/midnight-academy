import { describe, it, expect } from 'vitest';
import {
  computePercentileRank,
  computeDistributionQuartiles,
  aggregatePeerComparison,
  MIN_COHORT_THRESHOLD,
} from '../src/lib/analytics/cohort-aggregation.server';

describe('Cohort Aggregation & Peer Percentile Engine', () => {
  it('computes accurate percentile ranks against sorted cohort distributions', () => {
    const cohort = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    expect(computePercentileRank(10, cohort)).toBe(5);
    expect(computePercentileRank(55, cohort)).toBe(50);
    expect(computePercentileRank(100, cohort)).toBe(95);
  });

  it('handles ties and identical values properly', () => {
    const cohort = [50, 50, 50, 50, 50];
    const rank = computePercentileRank(50, cohort);
    expect(rank).toBe(50);
  });

  it('computes exact quartiles (p25, median, p75, p90)', () => {
    const cohort = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const quartiles = computeDistributionQuartiles(cohort);

    expect(quartiles).not.toBeNull();
    expect(quartiles?.median).toBe(55);
    expect(quartiles?.p25).toBe(32.5);
    expect(quartiles?.p75).toBe(77.5);
  });

  it('enforces privacy guardrails and minimum cohort thresholds', () => {
    const resultBelowThreshold = aggregatePeerComparison(
      { reading: 75, listening: 80, writing: 70, speaking: 65 },
      {},
      15, // Below minimum 30
    );

    expect(resultBelowThreshold.hasSufficientData).toBe(false);
    expect(resultBelowThreshold.minCohortThreshold).toBe(MIN_COHORT_THRESHOLD);

    const resultSufficient = aggregatePeerComparison(
      { reading: 75, listening: 80, writing: 70, speaking: 65 },
      {},
      50,
    );

    expect(resultSufficient.hasSufficientData).toBe(true);
    expect(resultSufficient.learnerPercentiles.sectionPercentiles.reading).toBeGreaterThan(0);
  });
});
