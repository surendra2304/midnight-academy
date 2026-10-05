import { GoogleGenAI } from "@google/genai";

export interface TranscriptionRequest {
  audioBase64?: string;
  mimeType?: string;
  taskType?: string;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  provider: string;
  model: string;
}

function getOptionalKey(): string | null {
  const key = process.env["GEMINI_API_KEY"] || process.env["GEMINI_API_KEYS"]?.split(",")[0];
  return key?.trim() || null;
}

function parseTranscript(raw: string): { transcript: string; confidence?: number } {
  let content = raw.trim();
  if (!content) throw new Error("The transcription provider returned an empty response.");
  if (content.startsWith("```")) {
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start < 0 || end <= start) {
      throw new Error("The transcription provider returned malformed JSON.");
    }
    parsed = JSON.parse(content.slice(start, end + 1));
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("The transcription provider returned an invalid response.");
  }
  const record = parsed as Record<string, unknown>;
  if (typeof record["transcript"] !== "string") {
    throw new Error("The transcription provider did not return a transcript.");
  }
  return {
    transcript: record["transcript"].trim(),
    ...(typeof record["confidence"] === "number" ? { confidence: record["confidence"] } : {}),
  };
}

export class GeminiSpeechToTextProvider {
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    if (!request.audioBase64?.trim()) {
      return { transcript: "", confidence: 0, provider: "none", model: "none" };
    }

    const apiKey = getOptionalKey();
    if (!apiKey) {
      throw new Error("Speech transcription is unavailable: GEMINI_API_KEY is not configured.");
    }

    const base64 = request.audioBase64.includes(",")
      ? request.audioBase64.split(",", 2)[1]!
      : request.audioBase64;
    const model = process.env["GEMINI_MODEL"] || "gemini-2.5-flash";
    const ai = new GoogleGenAI({ apiKey });
    const timeoutMs = Number(process.env["GEMINI_TIMEOUT_MS"] || 45000);
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    `Transcribe the student's spoken English exactly for this TOEFL practice task (${request.taskType ?? "speaking"}). ` +
                    "Return JSON only with keys transcript and confidence. Do not summarize, improve, or invent words.",
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
          config: { responseMimeType: "application/json", httpOptions: { timeout: timeoutMs } },
        }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("Speech transcription timed out.")),
            timeoutMs + 5000,
          );
        }),
      ]);

      const parsed = parseTranscript(response.text || "");
      return {
        transcript: parsed.transcript,
        confidence:
          typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0,
        provider: "gemini",
        model,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Speech transcription failed: ${message}`);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

export const speechToTextProvider = new GeminiSpeechToTextProvider();
