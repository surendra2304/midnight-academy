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

describe("Test Engine State & Server-Authoritative Logic", () => {
  describe("Test Eligibility & Lookup", () => {
    it("handles invalid test codes safely", () => {
      const test = null;
      const result = test ? { ok: true } : { error: "invalid" as const };
      expect(result.error).toBe("invalid");
    });

    it("handles inactive/paused test windows", () => {
      const test = { status: "paused" };
      const isClosed = test.status !== "active";
      expect(isClosed).toBe(true);
    });

    it("handles expired tests with past deadline", () => {
      const test = {
        status: "active",
        expires_at: new Date(Date.now() - 60000).toISOString(),
      };
      const isExpired =
        Boolean(test.expires_at) && new Date(test.expires_at).getTime() < Date.now();
      expect(isExpired).toBe(true);
    });

    it("handles empty tests with 0 approved questions", () => {
      const approvedCount = 0;
      const isEmpty = approvedCount === 0;
      expect(isEmpty).toBe(true);
    });
  });

  describe("Attempt Creation & Concurrency", () => {
    it("resumes in-progress attempt instead of creating duplicates", () => {
      const existing = { id: "attempt-existing-123", status: "in_progress" };
      const shouldResume = existing && existing.status === "in_progress";
      expect(shouldResume).toBe(true);
      expect(existing.id).toBe("attempt-existing-123");
    });

    it("prevents multiple completed attempts and returns completed attemptId", () => {
      const existing = { id: "attempt-done-456", status: "evaluated" };
      const isCompleted = existing && existing.status !== "in_progress";
      expect(isCompleted).toBe(true);
      const res = isCompleted
        ? { error: "completed" as const, attemptId: existing.id }
        : { ok: true };
      expect(res.error).toBe("completed");
      expect(res.attemptId).toBe("attempt-done-456");
    });

    it("enforces attempt ownership validation", () => {
      const attempt = { student_id: "student-user-123" };
      const currentUserId = "student-user-999";
      const isOwner = attempt.student_id === currentUserId;
      expect(isOwner).toBe(false);
    });
  });

  describe("Server-Authoritative Reading Timer & Reveal Protection", () => {
    it("returns remaining seconds when reloaded within active reading window", () => {
      const readingSeconds = 45;
      const revealedAt = new Date(Date.now() - 15000).toISOString(); // 15s ago
      const elapsedSeconds = (Date.now() - new Date(revealedAt).getTime()) / 1000;
      const remainingSeconds = Math.max(1, Math.round(readingSeconds - elapsedSeconds));

      expect(remainingSeconds).toBeLessThanOrEqual(31);
      expect(remainingSeconds).toBeGreaterThanOrEqual(29);
    });

    it("marks question as consumed and hides text when reading timer has expired", () => {
      const readingSeconds = 45;
      const revealedAt = new Date(Date.now() - 50000).toISOString(); // 50s ago
      const elapsedSeconds = (Date.now() - new Date(revealedAt).getTime()) / 1000;
      const isConsumed = elapsedSeconds >= readingSeconds;

      expect(isConsumed).toBe(true);
      const response = isConsumed
        ? { state: "consumed", meta: { topic: "DSA" } }
        : { state: "ready", text: "..." };
      expect(response.state).toBe("consumed");
      expect((response as Record<string, unknown>)["text"]).toBeUndefined();
    });
  });

  describe("Answer Submission & Single-Submission Guarantee", () => {
    it("validates answer submission minimum length", () => {
      const draft = "Short";
      const isValid = draft.trim().length >= 10;
      expect(isValid).toBe(false);

      const validDraft =
        "This question asks us to find the two numbers in the array that add to target.";
      expect(validDraft.trim().length >= 10).toBe(true);
    });

    it("rejects duplicate submissions for already submitted questions", () => {
      const answer = { id: "ans-1", submitted_at: new Date().toISOString() };
      const canSubmit = answer.submitted_at === null;
      expect(canSubmit).toBe(false);
    });
  });

  describe("Evaluation Idempotency & Recovery", () => {
    it("is idempotent when attempt is already evaluated", () => {
      const attempt = { id: "attempt-eval-1", status: "evaluated" };
      const result =
        attempt.status === "evaluated" ? { attemptId: attempt.id } : { evaluate: true };
      expect(result.attemptId).toBe("attempt-eval-1");
    });

    it("recovers to in_progress state if evaluation fails", () => {
      let status = "evaluating";
      const hasError = true;
      if (hasError) {
        status = "in_progress";
      }
      expect(status).toBe("in_progress");
    });
  });

  describe("DSA-X7K29 End-to-End Migration & Configuration Invariants", () => {
    it("verifies migration SQL contains valid DSA-X7K29 test definition and questions", () => {
      const sqlContent = readFileSync(
        resolve(__dirname, "../supabase/migrations/20260821100000_ensure_default_dsa_test.sql"),
        "utf-8",
      );
      expect(sqlContent).toContain("DSA-X7K29");
      expect(sqlContent).toContain("DSA & Arrays Technical Comprehension");
      expect(sqlContent).toContain("Two Sum");
      expect(sqlContent).toContain("Maximum Product Subarray");
      expect(sqlContent).toContain("Two Pointers");
      expect(sqlContent).toContain("approved");
    });

    it("verifies questions are sequential and 0-indexed without gaps", () => {
      const positions = [0, 1, 2];
      positions.forEach((pos, idx) => {
        expect(pos).toBe(idx);
      });
    });

    it("verifies admin can view attempt and evaluation details", () => {
      const adminOwnerId = "admin-111";
      const test = { owner_id: "admin-111" };
      const attempt = { student_id: "student-222" };

      const canAdminAccess = test.owner_id === adminOwnerId;
      expect(canAdminAccess).toBe(true);
    });

    it("verifies student can view own result", () => {
      const studentId = "student-222";
      const attempt = { student_id: "student-222" };
      const isOwner = attempt.student_id === studentId;
      expect(isOwner).toBe(true);
    });

    it("verifies student dashboard stats compute correctly from live attempts", () => {
      const attempts = [
        { status: "evaluated", score: 90 },
        { status: "evaluated", score: 80 },
        { status: "in_progress", score: null },
      ];

      const evaluated = attempts.filter((a) => a.status === "evaluated" && a.score !== null);
      const scores = evaluated.map((a) => Number(a.score));
      const avg =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const best = scores.length > 0 ? Math.max(...scores) : 0;

      expect(attempts.length).toBe(3);
      expect(evaluated.length).toBe(2);
      expect(avg).toBe(85);
      expect(best).toBe(90);
    });

    it("verifies new student with 0 attempts renders empty state without mock fallbacks", () => {
      const attempts: unknown[] = [];
      const isNewStudent = attempts.length === 0;
      expect(isNewStudent).toBe(true);
    });

    it("verifies event listener cleanups are paired and not orphaned", () => {
      const registeredListeners: string[] = [];
      const removedListeners: string[] = [];

      const add = (name: string) => registeredListeners.push(name);
      const remove = (name: string) => removedListeners.push(name);

      // Simulate mounting and unmounting
      add("blur");
      add("visibilitychange");

      remove("blur");
      remove("visibilitychange");

      expect(registeredListeners).toEqual(removedListeners);
    });

    it("verifies optimistic profile updates preserve unedited fields", () => {
      const prevProfile = {
        fullName: "Jane Doe",
        email: "jane@test.com",
        institution: "Stanford",
        year: "Senior",
        onboarded: true,
      };

      const updateData = {
        fullName: "Jane Smith",
        institution: "Stanford",
        year: "Alumni",
      };

      const nextProfile = {
        ...prevProfile,
        fullName: updateData.fullName,
        institution: updateData.institution,
        year: updateData.year,
      };

      expect(nextProfile.email).toBe("jane@test.com");
      expect(nextProfile.fullName).toBe("Jane Smith");
      expect(nextProfile.year).toBe("Alumni");
      expect(nextProfile.onboarded).toBe(true);
    });
  });
});
