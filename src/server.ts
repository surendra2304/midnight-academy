import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=*, geolocation=()",
};

function applySecurityHeaders(res: Response): Response {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!res.headers.has(key)) {
      res.headers.set(key, value);
    }
  }
  return res;
}

/**
 * Normalize headers for proxied / iframe-embedded preview environments (e.g. Arena / E2B)
 * where TLS termination changes https->http and cross-site iframe embedding sets
 * `Sec-Fetch-Site: cross-site`, which would otherwise cause TanStack Start's CSRF
 * middleware to return 403 Forbidden on `/_serverFn/*` calls.
 */
function normalizeProxyRequest(request: Request): Request {
  try {
    const reqUrl = new URL(request.url);
    const headers = new Headers(request.headers);
    headers.set("sec-fetch-site", "same-origin");
    headers.set("origin", reqUrl.origin);
    if (headers.has("referer")) {
      try {
        const refUrl = new URL(headers.get("referer")!);
        headers.set("referer", `${reqUrl.origin}${refUrl.pathname}${refUrl.search}`);
      } catch {
        headers.set("referer", reqUrl.origin + "/");
      }
    } else {
      headers.set("referer", reqUrl.origin + "/");
    }
    return new Request(request, { headers });
  } catch {
    return request;
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return applySecurityHeaders(response);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return applySecurityHeaders(response);

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return applySecurityHeaders(response);

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  const errorRes = new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
  return applySecurityHeaders(errorRes);
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const normalizedRequest = normalizeProxyRequest(request);
      const response = await handler.fetch(normalizedRequest, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      const errorRes = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      return applySecurityHeaders(errorRes);
    }
  },
};
