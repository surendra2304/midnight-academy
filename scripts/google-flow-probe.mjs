import { readFileSync } from "node:fs";

const STATUS = "679afdcf2315afc19a9e66d1002fd55c9c3a13ad14b8d569d9b8cbaf93584df2";
const COMPLETE = "fd8454f974179756d57b69cb1405e43dc896f49ebda3b7a601c98c80604661ee";

const m = await import("./fn-probe.mjs");
const env = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const mm = line.match(/^([A-Z_]+)=(.*)$/);
  if (mm) env[mm[1]] = mm[2].replace(/^"(.*)"$/, "$1");
}
const stamp = Date.now().toString(36);
const email = `gflow.ok.${stamp}@midnightacademy.dev`;
await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: env.SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
  },
  body: JSON.stringify({
    email,
    password: "ProbePass#1",
    email_confirm: true,
    user_metadata: { full_name: "Final Google Probe" },
  }),
});
const tok = await m.getToken(email, "ProbePass#1");
const R = (x) => x?.result?.result ?? x?.result;

console.log("1. status before :", JSON.stringify(R(await m.callFn(STATUS, {}, tok))));
const c = await m.callFn(
  COMPLETE,
  {
    password: "NewPass#2026x",
    fullName: "Final Google Probe",
    role: "student",
    year: "3rd Year",
    branch: "ECE",
  },
  tok,
);
console.log("2. complete      :", JSON.stringify(R(c)).slice(0, 160));
console.log("3. status after  :", JSON.stringify(R(await m.callFn(STATUS, {}, tok))));
const c2 = await m.callFn(COMPLETE, { password: "x1234567", fullName: "X", role: "student" }, tok);
console.log("4. double blocked:", JSON.stringify(R(c2)).slice(0, 120), c2.result?.error ? "" : "");
const t2 = await m.getToken(email, "NewPass#2026x");
console.log("5. new password sign-in:", t2 ? "OK" : "FAIL");
