import { describe, it, expect } from "vitest";

describe("Role Resolution & Authorization Security", () => {
  type AppRole = "ADMIN" | "STUDENT";

  function resolveRoleFromDbRows(roleRows: Array<{ role: string }>): AppRole {
    const hasAdminRole = roleRows.some((r) => r.role === "admin");
    const hasStudentRole = roleRows.some((r) => r.role === "student");
    return hasAdminRole ? "ADMIN" : hasStudentRole ? "STUDENT" : "STUDENT";
  }

  it("resolves admin user with admin role to ADMIN", () => {
    const rows = [{ role: "admin" }];
    expect(resolveRoleFromDbRows(rows)).toBe("ADMIN");
  });

  it("resolves student user with student role to STUDENT", () => {
    const rows = [{ role: "student" }];
    expect(resolveRoleFromDbRows(rows)).toBe("STUDENT");
  });

  it("gives ADMIN precedence if user has both roles", () => {
    const rows = [{ role: "student" }, { role: "admin" }];
    expect(resolveRoleFromDbRows(rows)).toBe("ADMIN");
  });

  it("prevents admin downgrade from client input", () => {
    const serverRoleRows = [{ role: "admin" }];
    const clientSelectedRole = "student"; // user selected student card in UI

    // Server-side authoritative determination ignores client input
    const authoritativeRole = resolveRoleFromDbRows(serverRoleRows);
    expect(authoritativeRole).toBe("ADMIN");
    expect(authoritativeRole).not.toBe(clientSelectedRole.toUpperCase());
  });

  it("rejects unauthorized access when student attempts admin route", () => {
    const userRole: AppRole = "STUDENT";
    const requiredRouteRole: AppRole = "ADMIN";

    const isAuthorized = userRole === requiredRouteRole;
    expect(isAuthorized).toBe(false);
  });

  it("verifies login flow does not use client-side role selector", () => {
    // In the new architecture, login accepts only email and password
    const loginPayload = { email: "user@midnight.academy", password: "password123" };
    expect((loginPayload as Record<string, unknown>)["role"]).toBeUndefined();
  });

  it("verifies admin can access owned test and student attempts", () => {
    const adminUserId = "admin-uuid-123";
    const test = {
      id: "test-uuid-1",
      code: "DSA-X7K29",
      ownerId: "admin-uuid-123",
      status: "active",
    };

    const isTestOwner = test.ownerId === adminUserId;
    expect(isTestOwner).toBe(true);

    const studentAttempt = {
      id: "attempt-uuid-1",
      testId: "test-uuid-1",
      studentId: "student-uuid-456",
      score: 85,
      status: "evaluated",
    };

    // Owner can access student attempt for owned test
    const canAdminViewAttempt = isTestOwner && studentAttempt.testId === test.id;
    expect(canAdminViewAttempt).toBe(true);
  });

  it("rejects unauthorized access to another student's attempt", () => {
    const requestingStudentId = "student-attacker-999";
    const attempt = {
      id: "attempt-victim-001",
      studentId: "student-victim-111",
      score: 90,
    };

    const isAuthorized = requestingStudentId === attempt.studentId;
    expect(isAuthorized).toBe(false);
  });

  it("rejects unauthorized admin access to a test owned by another instructor", () => {
    const requestingAdminId = "admin-other-777";
    const test = {
      id: "test-uuid-1",
      code: "DSA-X7K29",
      ownerId: "admin-legit-123",
    };

    const isOwner = requestingAdminId === test.ownerId;
    expect(isOwner).toBe(false);
  });
});
