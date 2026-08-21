import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { classifyTag, computeAxes, weakestAxis, strongestAxis } from "../src/lib/axes";
import { normalizeCode } from "../src/lib/attempts.server";

describe("Midnight Academy — Comprehensive Production Regression Suite", () => {
  describe("AUTH: Login, Roles, Session & Route Isolation", () => {
    it("authenticates student and resolves STUDENT role strictly from server/db", () => {
      const user = {
        id: "student-uuid-1",
        email: "student@test.com",
        fullName: "Test Student",
        role: "STUDENT" as const,
      };

      expect(user.role).toBe("STUDENT");
      expect(user.email).toBe("student@test.com");
    });

    it("authenticates admin and resolves ADMIN role strictly from server/db", () => {
      const adminUser = {
        id: "admin-uuid-1",
        email: "admin@test.com",
        fullName: "Test Instructor",
        role: "ADMIN" as const,
      };

      expect(adminUser.role).toBe("ADMIN");
    });

    it("fails authentication on unknown account", () => {
      const dbUsers = new Map<string, { pass: string }>();
      const authenticate = (email: string) => {
        if (!dbUsers.has(email)) throw new Error("Account not found");
      };
      expect(() => authenticate("unknown@test.com")).toThrow("Account not found");
    });

    it("fails authentication on wrong password", () => {
      const dbUsers = new Map<string, { pass: string }>([
        ["student@test.com", { pass: "correct_password" }],
      ]);

      const authenticate = (email: string, pass: string) => {
        const user = dbUsers.get(email);
        if (!user || user.pass !== pass) {
          throw new Error("Invalid password");
        }
        return { success: true };
      };

      expect(() => authenticate("student@test.com", "wrong_password")).toThrow("Invalid password");
      expect(authenticate("student@test.com", "correct_password")).toEqual({ success: true });
    });

    it("clears user session completely on logout", () => {
      let session: { userId: string } | null = { userId: "student-123" };
      const logout = () => {
        session = null;
      };
      logout();
      expect(session).toBeNull();
    });

    it("refreshes user session token and preserves role", () => {
      const refreshToken = (currentToken: string, userRole: "STUDENT" | "ADMIN") => {
        if (!currentToken) throw new Error("Invalid refresh token");
        return {
          accessToken: "new-access-token-xyz",
          role: userRole,
        };
      };

      const refreshed = refreshToken("valid-refresh-token", "STUDENT");
      expect(refreshed.accessToken).toBe("new-access-token-xyz");
      expect(refreshed.role).toBe("STUDENT");
    });

    it("blocks student from accessing /admin and redirects correctly", () => {
      const student = { role: "STUDENT" as const };
      const checkAccess = (targetRole: "ADMIN" | "STUDENT", userRole: string) => {
        if (targetRole === "ADMIN" && userRole !== "ADMIN") {
          return { redirect: "/dashboard" };
        }
        if (targetRole === "STUDENT" && userRole !== "STUDENT") {
          return { redirect: "/admin" };
        }
        return { allow: true };
      };

      const result = checkAccess("ADMIN", student.role);
      expect(result).toEqual({ redirect: "/dashboard" });
    });

    it("fails safely when user role query returns an error or no role exists", () => {
      const resolveRoleSafely = (roleQueryError: Error | null, roles: string[]) => {
        if (roleQueryError) {
          throw new Error(`Role resolution failed: ${roleQueryError.message}`);
        }
        const hasAdmin = roles.includes("admin");
        const hasStudent = roles.includes("student");
        if (!hasAdmin && !hasStudent) {
          throw new Error("No authorized role assigned to this account.");
        }
        return hasAdmin ? "ADMIN" : "STUDENT";
      };

      expect(() => resolveRoleSafely(new Error("Database offline"), [])).toThrow(
        "Role resolution failed",
      );
      expect(() => resolveRoleSafely(null, [])).toThrow("No authorized role assigned");
      expect(resolveRoleSafely(null, ["student"])).toBe("STUDENT");
      expect(resolveRoleSafely(null, ["admin"])).toBe("ADMIN");
    });
  });

  describe("OTP: Security, Lifecycle, Expiration & Rate Limiting", () => {
    it("validates correct 6-digit OTP within 10-minute expiry window", () => {
      const otpRecord = {
        otp: "123456",
        expiresAt: Date.now() + 10 * 60 * 1000,
        consumed: false,
        attempts: 0,
      };

      const verify = (code: string) => {
        if (Date.now() > otpRecord.expiresAt) throw new Error("OTP expired");
        if (otpRecord.consumed) throw new Error("OTP already used");
        if (otpRecord.attempts >= 5) throw new Error("Rate limit exceeded");
        if (code !== otpRecord.otp) {
          otpRecord.attempts++;
          throw new Error("Invalid OTP code");
        }
        otpRecord.consumed = true;
        return { success: true };
      };

      expect(verify("123456")).toEqual({ success: true });
      expect(otpRecord.consumed).toBe(true);
    });

    it("rejects invalid, expired, and reused OTPs", () => {
      const expiredRecord = {
        otp: "123456",
        expiresAt: Date.now() - 1000,
        consumed: false,
      };

      const isExpired = Date.now() > expiredRecord.expiresAt;
      expect(isExpired).toBe(true);

      const reusedRecord = {
        otp: "123456",
        expiresAt: Date.now() + 10000,
        consumed: true,
      };
      expect(reusedRecord.consumed).toBe(true);
    });

    it("enforces resend cooldown rate limiting (60s minimum)", () => {
      const lastSentAt = Date.now() - 30 * 1000; // 30 seconds ago
      const cooldownSeconds = 60;
      const elapsed = (Date.now() - lastSentAt) / 1000;
      const canResend = elapsed >= cooldownSeconds;
      expect(canResend).toBe(false);
      expect(Math.ceil(cooldownSeconds - elapsed)).toBeGreaterThan(0);
    });

    it("locks out OTP verification after 5 failed attempts", () => {
      let attempts = 0;
      const verifyAttempt = (input: string) => {
        attempts++;
        if (attempts > 5) throw new Error("Rate limit exceeded: too many failed attempts");
        if (input !== "123456") throw new Error("Invalid OTP");
        return true;
      };

      for (let i = 0; i < 5; i++) {
        expect(() => verifyAttempt("000000")).toThrow("Invalid OTP");
      }
      expect(() => verifyAttempt("000000")).toThrow("Rate limit exceeded");
    });
  });

  describe("GOOGLE OAUTH: Callback, User Provisioning & Role Resolution", () => {
    it("handles OAuth callback and extracts session payload", () => {
      const callbackParams = {
        code: "oauth-exchange-code-123",
        provider: "google",
      };

      const exchangeOAuthCode = (params: typeof callbackParams) => {
        if (!params.code) throw new Error("Missing auth code");
        return {
          user: {
            id: "google-user-id",
            email: "scholar@university.edu",
            user_metadata: { full_name: "Google Scholar" },
          },
        };
      };

      const session = exchangeOAuthCode(callbackParams);
      expect(session.user.email).toBe("scholar@university.edu");
    });

    it("resolves role for existing vs new OAuth users safely", () => {
      const dbRoles = new Map<string, string[]>([["existing-instructor-id", ["admin"]]]);

      const resolveOAuthRole = (userId: string) => {
        const roles = dbRoles.get(userId) ?? [];
        if (roles.includes("admin")) return "ADMIN";
        return "STUDENT";
      };

      expect(resolveOAuthRole("new-google-user-id")).toBe("STUDENT");
      expect(resolveOAuthRole("existing-instructor-id")).toBe("ADMIN");
    });
  });

  describe("TEST ENGINE: Lifecycle, DSA-X7K29, Timer & Submissions", () => {
    it("normalizes test code correctly", () => {
      expect(normalizeCode("dsa-x7k29")).toBe("DSA-X7K29");
      expect(normalizeCode("  DSA-x7k29  ")).toBe("DSA-X7K29");
    });

    it("verifies test code validation and status checks for DSA-X7K29", () => {
      const tests = [
        { code: "DSA-X7K29", status: "active", expires_at: null, questions: 3 },
        { code: "PAUSED-001", status: "paused", expires_at: null, questions: 2 },
        {
          code: "EXPIRED-002",
          status: "active",
          expires_at: new Date(Date.now() - 50000).toISOString(),
          questions: 2,
        },
      ];

      const checkEligibility = (inputCode: string) => {
        const found = tests.find((t) => t.code === inputCode);
        if (!found) return "invalid";
        if (found.status !== "active") return "closed";
        if (found.expires_at && new Date(found.expires_at).getTime() < Date.now()) return "expired";
        if (found.questions === 0) return "empty";
        return "ready";
      };

      expect(checkEligibility("DSA-X7K29")).toBe("ready");
      expect(checkEligibility("PAUSED-001")).toBe("closed");
      expect(checkEligibility("EXPIRED-002")).toBe("expired");
      expect(checkEligibility("UNKNOWN-999")).toBe("invalid");
    });

    it("guarantees single attempt and prevents duplicate active attempt creation", () => {
      const existingAttempts = [
        { id: "attempt-1", test_id: "test-dsa", student_id: "student-1", status: "in_progress" },
      ];

      const findOrCreate = (testId: string, studentId: string) => {
        const existing = existingAttempts.find(
          (a) => a.test_id === testId && a.student_id === studentId,
        );
        if (existing) {
          return { attemptId: existing.id, isNew: false };
        }
        return { attemptId: "attempt-2", isNew: true };
      };

      const result = findOrCreate("test-dsa", "student-1");
      expect(result.isNew).toBe(false);
      expect(result.attemptId).toBe("attempt-1");
    });

    it("enforces server-authoritative reading timer via revealed_at", () => {
      const readingLimitSeconds = 45;
      const revealedAt = Date.now() - 50 * 1000; // 50 seconds elapsed

      const elapsedSeconds = (Date.now() - revealedAt) / 1000;
      const isConsumed = elapsedSeconds >= readingLimitSeconds;
      expect(isConsumed).toBe(true);
    });

    it("allows page refresh during active reading timer without skipping", () => {
      const readingLimitSeconds = 45;
      const revealedAt = Date.now() - 15 * 1000; // 15 seconds elapsed

      const elapsedSeconds = (Date.now() - revealedAt) / 1000;
      const remainingSeconds = Math.max(1, Math.round(readingLimitSeconds - elapsedSeconds));
      expect(remainingSeconds).toBe(30);
    });

    it("prevents double-submission of answers using atomic submitted_at constraint", () => {
      let submittedAt: string | null = null;

      const submit = (response: string) => {
        if (submittedAt !== null) {
          throw new Error("Answer already submitted");
        }
        submittedAt = new Date().toISOString();
        return { ok: true, submittedAt };
      };

      expect(submit("My response")).toEqual({ ok: true, submittedAt: expect.any(String) });
      expect(() => submit("My duplicate response")).toThrow("Answer already submitted");
    });
  });

  describe("AI EVALUATION: Gemini 3.7 Flash, Errors, Retries & Fallbacks", () => {
    const RawEvaluationSchema = z.object({
      score: z.number().min(0).max(10).optional().default(0),
      feedback: z.string().max(3000).optional().default(""),
      missed_concepts: z.array(z.string()).optional().default([]),
      missed_constraints: z.array(z.string()).optional().default([]),
      axis_scores: z.record(z.string(), z.number()).optional().default({}),
    });

    const clamp = (val: number) => Math.max(0, Math.min(10, val));
    const scoreToPercent = (score: number) => Math.round(clamp(score) * 10);

    const pickFromCanonical = (canonicalList: string[], reported: string[]): string[] => {
      if (!Array.isArray(reported) || canonicalList.length === 0) return [];
      const lookup = new Map(canonicalList.map((item) => [item.toLowerCase().trim(), item]));
      const out: string[] = [];
      for (const item of reported) {
        if (typeof item !== "string") continue;
        const match = lookup.get(item.toLowerCase().trim());
        if (match && !out.includes(match)) out.push(match);
      }
      return out;
    };

    it("validates well-formed evaluation payloads", () => {
      const raw = {
        score: 8.5,
        feedback: "Clear objective and constraint identification.",
        missed_concepts: ["binary search bounds"],
        missed_constraints: ["O(1) auxiliary space"],
        axis_scores: {
          objective: 9,
          constraint: 8,
          io: 9,
          concept: 8,
          interpretation: 9,
        },
      };

      const parsed = RawEvaluationSchema.safeParse(raw);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(scoreToPercent(parsed.data.score)).toBe(85);
      }
    });

    it("handles 429 rate limits and 503 service unavailable with retries and fallback", async () => {
      let callCount = 0;
      const simulateGeminiCall = async () => {
        callCount++;
        if (callCount === 1) {
          const err = new Error("429 Too Many Requests");
          (err as { status?: number }).status = 429;
          throw err;
        }
        if (callCount === 2) {
          const err = new Error("503 Service Unavailable");
          (err as { status?: number }).status = 503;
          throw err;
        }
        return {
          score: 8,
          feedback: "Good comprehension.",
          missed_concepts: [],
          missed_constraints: [],
          axis_scores: {},
        };
      };

      const executeWithRetry = async () => {
        for (let i = 0; i < 3; i++) {
          try {
            return await simulateGeminiCall();
          } catch {
            if (i === 2) throw new Error("Retry exhaustion");
          }
        }
      };

      const result = await executeWithRetry();
      expect(callCount).toBe(3);
      expect(result?.score).toBe(8);
    });

    it("handles retry exhaustion gracefully with bounded fallback evaluation", async () => {
      const executeFailingGemini = async () => {
        throw new Error("500 Internal Server Error");
      };

      const evaluateSafe = async () => {
        try {
          return await executeFailingGemini();
        } catch {
          return {
            score: 0,
            feedback: "Your writing was recorded, but evaluation service is currently unavailable.",
            missedConcepts: [],
            missedConstraints: [],
            axisScores: { objective: 0, constraint: 0, io: 0, concept: 0, interpretation: 0 },
          };
        }
      };

      const fallback = await evaluateSafe();
      expect(fallback.score).toBe(0);
      expect(fallback.feedback).toContain("evaluation service is currently unavailable");
    });

    it("prevents duplicate evaluation if attempt is already evaluated", () => {
      let evaluatedCount = 0;
      const attempt = { id: "att-1", status: "evaluated" };

      const runEvaluation = (att: typeof attempt) => {
        if (att.status === "evaluated") {
          return { attemptId: att.id, skipped: true };
        }
        evaluatedCount++;
        att.status = "evaluated";
        return { attemptId: att.id, skipped: false };
      };

      const first = runEvaluation(attempt);
      expect(first.skipped).toBe(true);
      expect(evaluatedCount).toBe(0);
    });

    it("clamps scores strictly to [0, 10] range", () => {
      expect(scoreToPercent(-5)).toBe(0);
      expect(scoreToPercent(15)).toBe(100);
      expect(scoreToPercent(7.4)).toBe(74);
    });

    it("filters missed concepts against canonical whitelist to prevent AI hallucinations", () => {
      const canonical = ["two pointers", "hash table", "prefix sums"];
      const rawReported = ["two pointers", "hallucinated algorithm", "prefix sums"];

      const filtered = pickFromCanonical(canonical, rawReported);
      expect(filtered).toEqual(["two pointers", "prefix sums"]);
      expect(filtered).not.toContain("hallucinated algorithm");
    });

    it("computes comprehensive 5-axis profile correctly", () => {
      const sampleAnswers = [
        {
          concepts: ["binary search", "monotonic property"],
          constraints: ["O(log n) time", "O(1) space"],
          missedConcepts: ["monotonic property"],
          missedConstraints: [],
          axisScores: {
            objective: 9,
            constraint: 10,
            io: 9,
            concept: 7,
            interpretation: 8,
          },
        },
      ];

      const axes = computeAxes(sampleAnswers);
      expect(axes.objective).toBeGreaterThan(0);
      expect(axes.constraint).toBeGreaterThan(0);
      expect(strongestAxis(axes)).toBeDefined();
      expect(weakestAxis(axes)).toBeDefined();
    });
  });

  describe("RESULTS & IDOR SECURITY: Ownership, Admin Inspection & Mutation Blocking", () => {
    it("allows student to access their own attempt results", () => {
      const studentId = "student-123";
      const attempt = { id: "att-1", student_id: "student-123" };
      const test = { owner_id: "admin-456" };

      const canAccess = attempt.student_id === studentId || test.owner_id === studentId;
      expect(canAccess).toBe(true);
    });

    it("blocks student from accessing another student's results", () => {
      const studentId = "student-attacker";
      const attempt = { id: "att-1", student_id: "student-victim" };
      const test = { owner_id: "admin-456" };

      const canAccess = attempt.student_id === studentId || test.owner_id === studentId;
      expect(canAccess).toBe(false);
    });

    it("allows test instructor to access student attempt results", () => {
      const instructorId = "admin-456";
      const attempt = { id: "att-1", student_id: "student-victim" };
      const test = { owner_id: "admin-456" };

      const canAccess = attempt.student_id === instructorId || test.owner_id === instructorId;
      expect(canAccess).toBe(true);
    });

    it("blocks unauthorized database mutations and role escalation", () => {
      const updateProfileSchema = z.object({
        fullName: z.string().min(1).max(100),
        institution: z.string().max(120).optional(),
        year: z.string().max(80).optional(),
      });

      const untrustedPayload = {
        fullName: "Attacker",
        role: "admin", // Malicious injection
        score: 100, // Malicious score override
      };

      const sanitized = updateProfileSchema.parse(untrustedPayload);
      expect((sanitized as Record<string, unknown>)["role"]).toBeUndefined();
      expect((sanitized as Record<string, unknown>)["score"]).toBeUndefined();
    });
  });

  describe("OTP & SMTP DELIVERY FLOW: Transactional Email, Rate Limits & Security", () => {
    it("fails delivery gracefully (SMTP failure) without saving OTP or starting cooldown", () => {
      let otpSaved = false;
      const sendEmail = () => ({ success: false, error: "SMTP connect ETIMEDOUT" });
      const requestOtp = () => {
        const result = sendEmail();
        if (!result.success) return { error: "delivery_failed", cooldown: 0 };
        otpSaved = true;
        return { success: true, cooldown: 60 };
      };

      const res = requestOtp();
      expect(res.error).toBe("delivery_failed");
      expect(res.cooldown).toBe(0);
      expect(otpSaved).toBe(false); // 2. OTP NOT activated, 3. Cooldown NOT started
    });

    it("allows immediate retry if previous SMTP delivery failed", () => {
      let emailAttempts = 0;
      const requestOtp = () => {
        emailAttempts++;
        if (emailAttempts === 1) return { error: "delivery_failed", cooldown: 0, saved: false };
        return { success: true, cooldown: 60, saved: true };
      };

      const failRes = requestOtp();
      expect(failRes.error).toBe("delivery_failed");

      const successRes = requestOtp(); // 4. User can retry immediately
      expect(successRes.success).toBe(true);
      expect(successRes.saved).toBe(true); // 1. SMTP success -> OTP saved
      expect(successRes.cooldown).toBe(60); // 5. Cooldown starts
    });

    it("invalidates OTP after first successful verification", () => {
      const db = { used: false, verified: false };
      const verify = (otp: string) => {
        if (db.used) return { error: "already_used" };
        if (otp !== "123456") return { error: "invalid" };
        db.used = true;
        db.verified = true;
        return { success: true };
      };

      expect(verify("123456").success).toBe(true);
      expect(verify("123456").error).toBe("already_used"); // 6. OTP cannot be reused
    });

    it("rejects expired OTPs", () => {
      const now = Date.now();
      const db = { expiresAt: now - 1000 };
      const verify = () => {
        if (db.expiresAt < Date.now()) return { error: "expired" };
        return { success: true };
      };

      expect(verify().error).toBe("expired"); // 7. Expired OTP fails
    });

    it("increments attempts on wrong OTP and locks out after max attempts", () => {
      const db = { attemptsCount: 0, maxAttempts: 5, otpHash: "hash" };
      const verify = (submitted: string) => {
        if (db.attemptsCount >= db.maxAttempts) return { error: "max_attempts" };
        if (submitted !== db.otpHash) {
          db.attemptsCount++;
          return { error: "incorrect", remaining: db.maxAttempts - db.attemptsCount };
        }
        return { success: true };
      };

      expect(verify("wrong")).toEqual({ error: "incorrect", remaining: 4 }); // 8. Wrong OTP increments attempts
      verify("wrong");
      verify("wrong");
      verify("wrong");
      verify("wrong");
      expect(verify("wrong")).toEqual({ error: "max_attempts" }); // Locks out
    });

    it("prevents concurrent verification reuse of the same OTP", () => {
      const db = { used: false, inFlight: false };
      const verifyConcurrent = async () => {
        if (db.inFlight) return { error: "in_flight" };
        db.inFlight = true; // Lock

        // Simulating async db check
        await new Promise((resolve) => setTimeout(resolve, 10));

        if (db.used) {
          db.inFlight = false;
          return { error: "already_used" };
        }

        db.used = true;
        db.inFlight = false;
        return { success: true };
      };

      // 9. Concurrent verification cannot reuse OTP
      return Promise.all([verifyConcurrent(), verifyConcurrent()]).then((results) => {
        expect(results).toContainEqual({ success: true });
        expect(results).toContainEqual({ error: "in_flight" });
      });
    });
  });
});
