/** Server-only helpers for calling Google Gemini using the official @google/genai SDK. */
import { GoogleGenAI, type GenerateContentConfig, ThinkingLevel } from "@google/genai";

const MODEL_NAME = process.env["GEMINI_MODEL"] || "gemini-3.5-flash-lite";
/** Upper bound for a single Gemini call so serverless functions never hang. */
const REQUEST_TIMEOUT_MS = Number(process.env["GEMINI_TIMEOUT_MS"] || 15000);
/** How long a quota-limited key is skipped before it is tried again. */
const KEY_COOLDOWN_MS = 60_000;

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

type Message = { role: "system" | "user"; content: string };

/**
 * Resolves the Gemini key pool.
 *
 * Preferred: GEMINI_API_KEYS — a comma-separated list ("key1,key2,...") that
 * is rotated when a key hits quota (429) or is unavailable (503/504).
 * Backwards compatible: a single GEMINI_API_KEY (plus the legacy
 * GEMINI_FALLBACK_API_KEY) is used when the pool variable is not set.
 */
function getApiKeys(): string[] {
  const pool = (process.env["GEMINI_API_KEYS"] || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (pool.length > 0) return [...new Set(pool)];

  const legacy = [process.env["GEMINI_API_KEY"], process.env["GEMINI_FALLBACK_API_KEY"]]
    .map((k) => (k || "").trim())
    .filter(Boolean);
  return [...new Set(legacy)];
}

// Per-instance cooldown state: key -> timestamp (ms) until which it is skipped
const keyCooldowns = new Map<string, number>();

function isCoolingDown(key: string): boolean {
  const until = keyCooldowns.get(key);
  return typeof until === "number" && until > Date.now();
}

function markCooldown(key: string): void {
  keyCooldowns.set(key, Date.now() + KEY_COOLDOWN_MS);
}

function isQuotaOrUnavailable(errorMsg: string): boolean {
  const lower = errorMsg.toLowerCase();
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("503") ||
    errorMsg.includes("504") ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("unavailable") ||
    lower.includes("high demand") ||
    lower.includes("deadline")
  );
}

/** Calls Google Gemini and parses the model's reply as JSON. */
export async function chatJson<T>(messages: Message[]): Promise<T> {
  const allKeys = getApiKeys();
  if (allKeys.length === 0) {
    throw new AiError(
      "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEYS in your environment.",
      500,
    );
  }

  const systemInstruction = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const userPrompt = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n\n");

  let lastError: unknown;

  // Rotate over the pool: cooled-down keys are skipped unless every key is
  // cooling down, in which case we still try them rather than failing fast.
  const rotation = [...allKeys.filter((k) => !isCoolingDown(k)), ...allKeys.filter(isCoolingDown)];
  const keysToTry = rotation.length > 0 ? rotation : allKeys;

  for (let keyIdx = 0; keyIdx < keysToTry.length; keyIdx++) {
    const currentApiKey = keysToTry[keyIdx]!;
    const ai = new GoogleGenAI({ apiKey: currentApiKey });

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt)));
        }

        const config: GenerateContentConfig = {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          ...(systemInstruction ? { systemInstruction } : {}),
        };

        const response = await Promise.race([
          ai.models.generateContent({
            model: MODEL_NAME,
            contents: userPrompt,
            config: { ...config, httpOptions: { timeout: REQUEST_TIMEOUT_MS } },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new AiError("Gemini request timed out.", 504)),
              REQUEST_TIMEOUT_MS + 5000,
            ),
          ),
        ]);

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
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(
          `[gemini key ${keyIdx + 1}/${keysToTry.length}] attempt ${attempt + 1} error:`,
          errorMsg,
        );

        // Quota/unavailable: cool this key down and rotate to the next key now
        if (isQuotaOrUnavailable(errorMsg)) {
          markCooldown(currentApiKey);
          break;
        }

        if (attempt === 1 && keyIdx === keysToTry.length - 1) {
          throw new AiError("The evaluator could not be reached.", 502);
        }
      }
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  if (isQuotaOrUnavailable(msg)) {
    throw new AiError("The evaluator is busy right now. Please try again in a moment.", 429);
  }
  throw new AiError("The evaluator could not be reached.", 502);
}
