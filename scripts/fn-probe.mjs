import { readFileSync } from "node:fs";
import { toJSONAsync, fromCrossJSON } from "seroval";
import * as routerCore from "@tanstack/router-core";

const plugins = [...routerCore.defaultSerovalPlugins];
const env = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}
const SITE = "https://midnight-academy-one.vercel.app";

export async function getToken(email, password = "E2eTest#2026") {
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });
  const b = await r.json();
  if (!b.access_token) throw new Error("signin failed: " + JSON.stringify(b).slice(0, 200));
  return b.access_token;
}

export async function callFn(fnId, data, token, method = "POST") {
  const headers = {
    Origin: SITE,
    Accept: "application/json",
    "x-tsr-serverFn": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let url = `${SITE}/_serverFn/${fnId}`;
  let body;
  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(await toJSONAsync({ data }, { plugins }));
  } else if (data) {
    const enc = routerCore.encode({
      payload: JSON.stringify(await toJSONAsync({ data }, { plugins })),
    });
    url += `?${enc}`;
  }
  const res = await fetch(url, { method, headers, body });
  const text = await res.text();
  if (!res.ok) return { __http: res.status, raw: text.slice(0, 400) };
  try {
    const j = JSON.parse(text);
    return "t" in j
      ? { __http: res.status, result: fromCrossJSON(j, { plugins }) }
      : { __http: res.status, result: j };
  } catch {
    return { __http: res.status, raw: text.slice(0, 400) };
  }
}
