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
