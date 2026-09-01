import { describe, it, expect } from 'vitest';
import { calculateAudioChecksum } from '../src/lib/speaking/speaking-upload.server';
import { speechToTextProvider } from '../src/lib/speaking/transcription-service.server';
import { EvaluationContractSchema } from '../src/lib/evaluation/evaluation-service.server';

describe('TOEFL Speaking System & Audio Pipeline Suite', () => {
  describe('Audio Checksum Verification', () => {
    it('generates consistent deterministic checksum for base64 audio string', () => {
      const sampleAudioBase64 = 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwE=';
      const chk1 = calculateAudioChecksum(sampleAudioBase64);
      const chk2 = calculateAudioChecksum(sampleAudioBase64);

      expect(chk1).toBe(chk2);
      expect(chk1.startsWith('chk_')).toBe(true);
    });
  });

  describe('Pluggable Speech-to-Text Interface', () => {
    it('returns empty transcription result when no audio payload is provided', async () => {
      const result = await speechToTextProvider.transcribe({});
      expect(result.transcript).toBe('');
      expect(result.confidence).toBe(0);
      expect(result.provider).toBe('gemini');
    });
  });

  describe('Speaking Evaluation Schema Validation', () => {
    it('validates structured speaking evaluation output with 5 trait dimensions', () => {
      const speakingEvaluationOutput = {
        score_band: 5.0,
        task_score: 83,
        traits: {
          task_fulfillment: 5.5,
          organization: 5.0,
          language_use: 5.0,
          delivery: 4.5,
          pronunciation: 5.0,
        },
        strengths: ['Clearly articulated stance with two well-developed arguments', 'High intelligibility and natural intonation'],
        issues: ['Brief hesitation before introducing the second supporting point'],
        corrections: [],
        improved_response: 'I strongly support mandatory on-campus housing for freshmen...',
        next_actions: ['Practice rapid transitions using phrases like "Furthermore" and "In addition".'],
        confidence: 0.95,
        rubric_version: '2026.1',
        model: 'gemini-2.5-flash',
      };

      const parsed = EvaluationContractSchema.safeParse(speakingEvaluationOutput);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.score_band).toBe(5.0);
        expect(parsed.data.traits.delivery).toBe(4.5);
        expect(parsed.data.traits.pronunciation).toBe(5.0);
      }
    });
  });
});
