import { describe, it, expect } from 'vitest';
import { audioAssetService } from '../src/lib/audio/audio-service';
import { readingScoringService } from '../src/lib/scoring/reading-scoring';
import { adaptiveRouter } from '../src/lib/adaptive/adaptive-router';

describe('TOEFL Listening System & Audio Pipeline Suite', () => {
  describe('Audio Asset Health & Mime Validation', () => {
    it('validates supported audio MIME types correctly', () => {
      expect(audioAssetService.validateAssetHealth({ storage_path: 'tracks/audio.mp3', mime_type: 'audio/mpeg' })).toBe(true);
      expect(audioAssetService.validateAssetHealth({ storage_path: 'tracks/audio.ogg', mime_type: 'audio/ogg' })).toBe(true);
      expect(audioAssetService.validateAssetHealth({ storage_path: 'tracks/audio.wav', mime_type: 'audio/wav' })).toBe(true);
      expect(audioAssetService.validateAssetHealth({ storage_path: 'tracks/video.mp4', mime_type: 'video/mp4' })).toBe(false);
      expect(audioAssetService.validateAssetHealth({ storage_path: '', mime_type: 'audio/mpeg' })).toBe(false);
    });
  });

  describe('Deterministic Scoring for Listening Items', () => {
    const listeningRule = {
      itemType: 'listen_academic_talk' as const,
      options: [
        { optionKey: 'A', optionText: 'Volcanic vents only', isCorrect: false, distractorRationale: 'EGS expands to non-volcanic regions.' },
        { optionKey: 'B', optionText: 'High pressure can induce micro-seismic activity', isCorrect: true },
        { optionKey: 'C', optionText: 'Large CO2 emissions', isCorrect: false, distractorRationale: 'Geothermal systems emit minimal CO2.' },
      ],
    };

    it('scores audio comprehension response accurately', () => {
      const res = readingScoringService.scoreItem('B', listeningRule);
      expect(res.isCorrect).toBe(true);
      expect(res.score).toBe(1.0);
    });

    it('scores wrong selection with distractor rationale for listening review', () => {
      const res = readingScoringService.scoreItem('C', listeningRule);
      expect(res.isCorrect).toBe(false);
      expect(res.score).toBe(0.0);
      expect(res.distractorRationale).toBe('Geothermal systems emit minimal CO2.');
    });
  });

  describe('Listening Adaptive Router', () => {
    const listeningRoutingRule = {
      thresholds: {
        upperMinScorePercent: 75,
        lowerMaxScorePercent: 50,
      },
      targetModules: {
        upperModuleId: 'ls-upper-mod',
        middleModuleId: 'ls-mid-mod',
        lowerModuleId: 'ls-lower-mod',
      },
    };

    it('routes listening stage 1 score to upper module when threshold met', () => {
      const result = adaptiveRouter.evaluateRouting(
        {
          totalItems: 4,
          correctItems: 4,
          earnedPoints: 4,
          maxPoints: 4,
          percentageScore: 100,
          timeSpentSeconds: 90,
        },
        listeningRoutingRule,
      );

      expect(result.selectedBand).toBe('upper');
      expect(result.nextModuleId).toBe('ls-upper-mod');
    });
  });
});
