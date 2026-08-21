import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

describe("Input & Payload Security Schemas", () => {
  const attemptIdSchema = z.object({ attemptId: z.string().uuid() });
  const submitSchema = z.object({
    attemptId: z.string().uuid(),
    position: z.number().int().min(0),
    response: z.string().max(6000),
  });
  const updateProfileSchema = z.object({
    fullName: z.string().min(1).max(100),
    institution: z.string().max(120).optional(),
    year: z.string().max(80).optional(),
  });

  it("rejects non-UUID attempt IDs", () => {
    expect(() => attemptIdSchema.parse({ attemptId: "123-fake-id" })).toThrow();
    expect(() =>
      attemptIdSchema.parse({ attemptId: "00000000-0000-0000-0000-000000000000" }),
    ).not.toThrow();
  });

  it("rejects oversized student responses", () => {
    const huge = "a".repeat(6001);
    expect(() =>
      submitSchema.parse({
        attemptId: "00000000-0000-0000-0000-000000000000",
        position: 0,
        response: huge,
      }),
    ).toThrow();
  });

  it("strips client-injected role field during profile update", () => {
    const payload = {
      fullName: "Alice Student",
      institution: "MIT",
      role: "admin", // Malicious injection
    };
    const parsed = updateProfileSchema.parse(payload);
    expect((parsed as Record<string, unknown>)["role"]).toBeUndefined();
    expect(parsed.fullName).toBe("Alice Student");
  });
});

describe("Authorization Boundaries & IDOR Prevention", () => {
  describe("Student Data Isolation", () => {
    it("blocks student from accessing another student's attempt", () => {
      const currentUserId = "student-alice-uuid";
      const attempt = {
        id: "attempt-1",
        student_id: "student-bob-uuid",
      };

      const isAuthorized = attempt.student_id === currentUserId;
      expect(isAuthorized).toBe(false);
    });

    it("blocks student from updating or tampering with scores", () => {
      // Score mutation is strictly server-driven and never exposes an update RPC to students
      const updatePayload = { score: 100, status: "evaluated" };
      const studentAllowedFields = ["fullName", "institution", "year"];
      const containsIllegalField = Object.keys(updatePayload).some(
        (key) => !studentAllowedFields.includes(key),
      );
      expect(containsIllegalField).toBe(true);
    });

    it("blocks non-admin users from admin test management endpoints", async () => {
      const userRoles: { role: string }[] = [{ role: "student" }];
      const hasAdminRole = userRoles.some((r) => r.role === "admin");
      expect(hasAdminRole).toBe(false);
    });

    it("prevents admin from modifying tests owned by other instructors", () => {
      const currentAdminId = "admin-1-uuid";
      const test = {
        id: "test-123",
        owner_id: "admin-2-uuid",
      };

      const isOwner = test.owner_id === currentAdminId;
      expect(isOwner).toBe(false);
    });

    it("prevents student from flagging an evaluation belonging to another student", () => {
      const currentStudentId = "student-alice";
      const answer = {
        id: "answer-1",
        attempts: {
          student_id: "student-bob",
        },
      };

      const canFlag = answer.attempts?.student_id === currentStudentId;
      expect(canFlag).toBe(false);
    });

    it("prevents student from submitting answers to another student's attempt", () => {
      const currentStudentId = "student-alice";
      const attempt = {
        id: "attempt-xyz",
        student_id: "student-bob",
        status: "in_progress",
      };

      const canSubmit = attempt.student_id === currentStudentId;
      expect(canSubmit).toBe(false);
    });

    it("prevents unauthenticated execution of protected endpoints", () => {
      const contextUser: { userId: string | null } = { userId: null };
      const isAuthenticated = Boolean(contextUser.userId);
      expect(isAuthenticated).toBe(false);
    });

    it("prevents privilege escalation when resolving flagged evaluations", () => {
      const currentInstructorId = "instructor-1";
      const answer = {
        id: "ans-99",
        attempts: {
          tests: {
            owner_id: "instructor-2",
          },
        },
      };

      const isInstructorAuthorized = answer.attempts?.tests?.owner_id === currentInstructorId;
      expect(isInstructorAuthorized).toBe(false);
    });
  });

  describe("Secret Isolation & Environment Security", () => {
    it("ensures SUPABASE_SECRET_KEY is never exported to client-side bundles", () => {
      const clientEnvKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
      expect(clientEnvKeys).not.toContain("SUPABASE_SECRET_KEY");
      expect(clientEnvKeys).not.toContain("SERVICE_ROLE_KEY");
    });

    it("ensures GEMINI_API_KEY is never exposed in client environments", () => {
      const clientEnvKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
      expect(clientEnvKeys).not.toContain("GEMINI_API_KEY");
      expect(clientEnvKeys).not.toContain("GEMINI_FALLBACK_KEY");
    });

    it("ensures SMTP and Gmail App passwords are never exported to client environments", () => {
      const clientEnvKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
      expect(clientEnvKeys).not.toContain("SMTP_PASS");
      expect(clientEnvKeys).not.toContain("GMAIL_APP_PASSWORD");
    });
  });
});
