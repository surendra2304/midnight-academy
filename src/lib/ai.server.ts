/** Server-only helpers for calling Google Gemini using the official @google/genai SDK. */
import { GoogleGenAI, type GenerateContentConfig, ThinkingLevel } from "@google/genai";

const MODEL_NAME = process.env["GEMINI_MODEL"] || "gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

type Message = { role: "system" | "user"; content: string };

/** Calls Google Gemini and parses the model's reply as JSON. */
export async function chatJson<T>(messages: Message[]): Promise<T> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    throw new AiError(
      "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your environment.",
      500,
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const userPrompt = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n\n");

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt)));
      }

      // Use the official ThinkingLevel enum from @google/genai
      const config: GenerateContentConfig = {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        ...(systemInstruction ? { systemInstruction } : {}),
      };

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: userPrompt,
        config,
      });

      const content = response.text;
      if (!content) {
        throw new AiError("The evaluator returned an empty response.", 502);
      }

      try {
        return JSON.parse(content) as T;
      } catch {
        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");
        if (start >= 0 && end > start) {
          return JSON.parse(content.slice(start, end + 1)) as T;
        }
        throw new AiError("The evaluator returned malformed output.", 502);
      }
    } catch (err: unknown) {
      lastError = err;
      if (err instanceof AiError) throw err;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[gemini] generation attempt ${attempt + 1} error:`, errorMsg);

      const isTransient =
        errorMsg.includes("503") ||
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("unavailable") ||
        errorMsg.toLowerCase().includes("high demand") ||
        errorMsg.toLowerCase().includes("quota");

      if (!isTransient || attempt === 2) {
        if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota")) {
          throw new AiError("The evaluator is busy right now. Please try again in a moment.", 429);
        }
        throw new AiError("The evaluator could not be reached.", 502);
      }
    }
  }
  throw lastError;
}
