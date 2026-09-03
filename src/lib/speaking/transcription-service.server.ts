import { GoogleGenAI } from "@google/genai";

export interface TranscriptionRequest {
  audioBase64?: string;
  audioUrl?: string;
  mimeType?: string;
  taskType?: string;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  provider: string;
  model: string;
  durationSeconds?: number;
}

function requireKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS?.split(",")[0];
  if (!key) throw new Error("Gemini API key is not configured.");
  return key.trim();
}

export class GeminiSpeechToTextProvider {
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    if (!request.audioBase64) {
      return {
        transcript: "",
        confidence: 0,
        provider: "gemini",
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      };
    }

    const base64 = request.audioBase64.includes(",")
      ? request.audioBase64.split(",", 2)[1]!
      : request.audioBase64;

    const ai = new GoogleGenAI({ apiKey: requireKey() });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Transcribe the student's spoken English exactly. Return JSON only with keys transcript and confidence. " +
                "Do not summarize, improve, or invent words.",
            },
            {
              inlineData: {
                mimeType: request.mimeType || "audio/webm",
                data: base64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Transcription provider returned no text.");

    const parsed = JSON.parse(text) as {
      transcript?: string;
      confidence?: number;
    };

    const transcript = (parsed.transcript || "").trim();
    if (!transcript) throw new Error("Transcription provider returned an empty transcript.");

    return {
      transcript,
      confidence:
        typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      provider: "gemini",
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    };
  }
}

export const speechToTextProvider = new GeminiSpeechToTextProvider();
