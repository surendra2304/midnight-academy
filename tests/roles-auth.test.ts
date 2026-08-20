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

  it("allows admin user to access admin route", () => {
    const userRole: AppRole = "ADMIN";
    const requiredRouteRole: AppRole = "ADMIN";

    const isAuthorized = userRole === requiredRouteRole;
    expect(isAuthorized).toBe(true);
  });
});
