import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Production Flow Verification (No Mock-Data Dependencies in Live Flows)", () => {
  it("verifies /test/index.tsx uses live startAttempt RPC and no hardcoded mock codes", () => {
    const content = readFileSync(resolve(__dirname, "../src/routes/test.index.tsx"), "utf-8");
    expect(content).toContain("startAttempt");
    expect(content).not.toContain("sampleTest.code");
  });

  it("verifies /test/run.tsx uses real server functions and no testQuestions mock array", () => {
    const content = readFileSync(resolve(__dirname, "../src/routes/test.run.tsx"), "utf-8");
    expect(content).toContain("revealQuestion");
    expect(content).toContain("submitAnswer");
    expect(content).toContain("finishAttempt");
    expect(content).not.toContain("testQuestions[index]");
  });

  it("verifies /result/$attemptId.tsx uses getResult RPC", () => {
    const content = readFileSync(
      resolve(__dirname, "../src/routes/result.$attemptId.tsx"),
      "utf-8",
    );
    expect(content).toContain("getResult");
    expect(content).toContain("flagEvaluation");
    expect(content).not.toContain("sampleResult");
  });

  it("verifies /dashboard.tsx loads from getStudentDashboardData RPC", () => {
    const content = readFileSync(resolve(__dirname, "../src/routes/dashboard.tsx"), "utf-8");
    expect(content).toContain("getStudentDashboardData");
    expect(content).not.toContain("studentStats.");
    expect(content).not.toContain("studentAxes.");
  });

  it("verifies /admin/index.tsx loads from getAdminOverview RPC", () => {
    const content = readFileSync(resolve(__dirname, "../src/routes/admin.index.tsx"), "utf-8");
    expect(content).toContain("getAdminOverview");
    expect(content).not.toContain("adminStats.");
  });

  it("verifies /admin/tests/$testId.tsx loads from getAdminTest RPC", () => {
    const content = readFileSync(
      resolve(__dirname, "../src/routes/admin.tests.$testId.tsx"),
      "utf-8",
    );
    expect(content).toContain("getAdminTest");
    expect(content).not.toContain("adminTests[0]");
  });
});
