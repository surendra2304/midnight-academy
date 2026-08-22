import { readFileSync } from "node:fs";
import { toJSON, fromCrossJSON } from "seroval";
import * as routerCore from "@tanstack/router-core";

// run from project dir; load .env
const env = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}
const SUPA_URL = env.SUPABASE_URL;
const SECRET = env.SUPABASE_SECRET_KEY;
const SITE = "https://midnight-academy-one.vercel.app";
const plugins = [...routerCore.defaultSerovalPlugins];

const FN = {
  draftTest: "606ab637502c7813f66640a8ec44e77e42344e4901c9cf9e1eea42c3fbf226a0",
  saveQuestions: "b2ef489dd3fe44a2374b6ba5a07e6225930f869691ed6e0a49755d552174ba3d",
  publishTest: "49892078c0dfc3fdc4179910493c8364eda3b2449871dd30860abb5b254177b4",
  getAdminOverview: "98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01",
  getAdminTest: "18abd73ebae49d8df468dfd2c938c619f88a2c14231cfdd399596517ed844316",
  startAttempt: "7f44b131ac5237be09aa1cf5bda704454356692cbeeca201f0598c846683f427",
  revealQuestion: "ec7bf1c68aff5bdbd707d50ee3297660344901e7bd978aff8f42ef52baa6ce6e",
  submitAnswer: "2771377074258cb41768ea767cabf26c719bf4ec636557f98c1cf7a6a16cc0b3",
  finishAttempt: "8be16cd2721ba43277a1ddb7f2d9098dfcd59c7ddf65592b193057d63159dacd",
  getResult: "0b0e020f48e2e2f177c4f3e463336c7adf12802da02f52d591ee137602fd1e9e",
  getStudentDashboard: "5bd881302a23be2a7d16d7994ce97eab92075a13f2ae0b0ec3f2fac42b9a51cf",
};

async function callFn(name, data, token, method = "POST") {
  const headers = {
    Origin: SITE,
    Accept: "application/json",
    "x-tsr-serverFn": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let url = `${SITE}/_serverFn/${FN[name]}`;
  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    var body = JSON.stringify(toJSON({ data }, { plugins }));
  } else if (data) {
    const enc = "payload=" + encodeURIComponent(JSON.stringify(toJSON({ data }, { plugins })));
    url += "?" + enc;
  }
  const res = await fetch(url, { method, headers, body });
  const text = await res.text();
  if (!res.ok) return { __http: res.status, raw: text.slice(0, 500) };
  try {
    const j = JSON.parse(text);
    const isCross = j && typeof j === "object" && "t" in j;
    return { __http: res.status, result: isCross ? fromCrossJSON(j, { plugins }) : j };
  } catch {
    return { __http: res.status, raw: text.slice(0, 500) };
  }
}

async function supa(path, opts = {}, attempt = 0) {
  const res = await fetch(`${SUPA_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  if (!text && attempt < 2) return supa(path, opts, attempt + 1);
  return { status: res.status, body: text ? JSON.parse(text) : {} };
}

const PASSWORD = "E2eTest#2026";
async function ensureUser(email, name, role) {
  const search = await supa("/auth/v1/admin/users?page=1&per_page=1000");
  const existing = (search.body.users || []).find((u) => u.email === email);
  if (existing) {
    console.log(`user ${email} already exists, reusing`);
    return existing.id;
  }
  const created = await supa("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: name, role },
    }),
  });
  const id = created.body.id;
  if (!id) throw new Error("create user failed: " + JSON.stringify(created.body).slice(0, 300));
  await supa("/rest/v1/profiles", {
    method: "POST",
    body: JSON.stringify({
      id,
      email,
      full_name: name,
      onboarded: true,
      year: role === "student" ? "3rd Year" : undefined,
      branch: role === "student" ? "CSE" : undefined,
    }),
  });
  await supa("/rest/v1/user_roles", {
    method: "POST",
    body: JSON.stringify({ user_id: id, role }),
  });
  console.log(`created ${email} (${role}) -> ${id}`);
  return id;
}

async function signin(email) {
  const res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
    },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const body = await res.json();
  if (!body.access_token) throw new Error(`signin failed: ${JSON.stringify(body).slice(0, 200)}`);
  return body.access_token;
}

const stamp = Date.now().toString(36);
const INSTR = `instructor.e2e.${stamp}@midnightacademy.dev`;
const STUD = `student.e2e.${stamp}@midnightacademy.dev`;
await ensureUser(INSTR, "E2E Instructor", "admin");
await ensureUser(STUD, "E2E Student", "student");
const iTok = await signin(INSTR);
const sTok = await signin(STUD);
console.log("both users signed in");

const show = (label, v) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  console.log(`\n=== ${label} ===\n${s.length > 900 ? s.slice(0, 900) + " ...[truncated]" : s}`);
};

// STEP 1: instructor drafts a test with Gemini
const draft = await callFn(
  "draftTest",
  {
    name: `E2E Comprehension Test ${stamp}`,
    category: "DSA",
    difficulty: "Medium",
    secondsPerQuestion: 30,
    responseSeconds: 120,
    source:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nGiven a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets must be closed by the same type in the correct order and every close bracket has a corresponding open bracket of the same type.",
  },
  iTok,
);
show("1. draftTest", draft);
if (draft.__http !== 200 || draft.result?.error) {
  console.log("DRAFT FAILED — stopping");
  process.exit(1);
}
const d = draft.result?.result ?? draft.result;
const testId = d.testId;

// STEP 2: approve + save questions
const questions = d.questions.map((q) => ({
  id: q.id,
  text: q.text,
  topic: q.topic || "General",
  difficulty: q.difficulty || "Medium",
  concepts: q.concepts || [],
  constraints: q.constraints || [],
  referenceAnswer: q.reference_answer || "",
  approved: true,
}));
show("2. saveQuestions", await callFn("saveQuestions", { testId, questions }, iTok));

// STEP 3: publish
const pub = await callFn("publishTest", { testId }, iTok);
show("3. publishTest", pub);
const code = pub.result?.result?.code ?? pub.result?.code;
if (!code) {
  console.log("PUBLISH FAILED");
  process.exit(1);
}

// STEP 4: student starts attempt
const start = await callFn("startAttempt", { code }, sTok);
const R = (x) => x?.result ?? x;
show("4. startAttempt", start);
const attemptId = R(start.result)?.attemptId;

// STEP 5: reveal + answer each question
for (let pos = 0; pos < R(start.result).total; pos++) {
  const rev = await callFn("revealQuestion", { attemptId, position: pos }, sTok);
  const q = rev.result?.question;
  show(`5.${pos} revealQuestion p${pos}`, {
    state: rev.result?.state,
    questionText: (q?.text || "").slice(0, 80),
  });
  const answer =
    pos === 0
      ? "The question gives an integer array nums and a target integer. We must return the indices of the two numbers in the array whose sum equals the target. Each input has exactly one solution and the same element cannot be used twice. Input is an array of integers and an integer target; output is an array of two indices. Concepts: hashing, one-pass map lookup."
      : "The question asks whether a string s containing only bracket characters is valid. Valid means every open bracket is closed by the same bracket type in the correct order, and every close bracket matches an open one. Input is a string of brackets; output is a boolean. A stack tracks unmatched open brackets.";
  show(
    `5.${pos} submitAnswer p${pos}`,
    await callFn("submitAnswer", { attemptId, position: pos, response: answer }, sTok),
  );
}

// STEP 6: finish attempt (triggers Gemini evaluation)
const t0 = Date.now();
const fin = await callFn("finishAttempt", { attemptId }, sTok);
show(`6. finishAttempt (${((Date.now() - t0) / 1000).toFixed(1)}s)`, fin);

// STEP 7: result
const res = await callFn("getResult", { attemptId }, sTok, "GET");
show("7. getResult", {
  status: res.result?.attempt?.status ?? res.result?.status,
  score: res.result?.attempt?.score ?? res.result?.score,
  axes: res.result?.attempt?.axes ?? res.result?.axes,
  answers: (res.result?.answers || []).map((a) => ({
    score: a.score,
    feedback: (a.feedback || "").slice(0, 120),
  })),
});

// STEP 8: instructor overview shows the submission
const ov = await callFn("getAdminOverview", undefined, iTok, "GET");
show("8. getAdminOverview", {
  totals: ov.result?.totals,
  recentSubmissions: ov.result?.recentSubmissions,
});

// STEP 9: student dashboard data
const dash = await callFn("getStudentDashboard", undefined, sTok, "GET");
show("9. studentDashboard", {
  stats: dash.result?.stats,
  recent: dash.result?.recentAttempts?.length,
});

console.log("\n########## E2E COMPLETE ##########");

// ---------- Cleanup: remove throwaway probe accounts ----------
if (!process.env["E2E_KEEP"]) {
  try {
    const { body: allUsers } = await supa("/auth/v1/admin/users?per_page=1000");
    const probeUsers = (allUsers?.users ?? []).filter(
      (u) =>
        (u.email || "").includes(".e2e.") ||
        (u.email || "").startsWith("gflow.") ||
        (u.email || "").startsWith("googleflow."),
    );
    let deleted = 0;
    for (const u of probeUsers) {
      const r = await supa(`/auth/v1/admin/users/${u.id}`, { method: "DELETE" });
      if (r.status < 300) deleted += 1;
    }
    console.log(`cleanup: removed ${deleted} probe accounts (set E2E_KEEP=1 to keep them)`);
  } catch (e) {
    console.log("cleanup skipped:", e.message);
  }
}
