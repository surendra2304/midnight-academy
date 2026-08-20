/** Server-only helpers for calling the AI Gateway or OpenAI-compatible endpoint. */

const GATEWAY_URL = process.env["AI_GATEWAY_URL"] || "https://api.openai.com/v1/chat/completions";
const MODEL = process.env["AI_MODEL"] || "gpt-4o-mini";

type Message = { role: "system" | "user"; content: string };

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

/** Calls the gateway and parses the model's reply as JSON. */
export async function chatJson<T>(messages: Message[]): Promise<T> {
  const apiKey = process.env["AI_API_KEY"] || process.env["OPENAI_API_KEY"];
  if (!apiKey) throw new AiError("AI API key is not configured. Please set AI_API_KEY or OPENAI_API_KEY in your environment.", 500);

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (response.status === 429) {
    throw new AiError("The evaluator is busy right now. Please try again in a moment.", 429);
  }
  if (response.status === 402) {
    throw new AiError("AI credits are exhausted for this account.", 402);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[ai] gateway error", response.status, detail.slice(0, 500));
    throw new AiError("The evaluator could not be reached.", 502);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new AiError("The evaluator returned an empty response.", 502);

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
}
