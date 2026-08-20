import { describe, it, expect, beforeEach } from "vitest";
import {
  generateOtp,
  hashOtp,
  generateVerificationToken,
  hashVerificationToken,
  secureCompare,
  normalizeEmail,
  saveOtpRecord,
  getLatestOtpRecord,
  updateOtpRecord,
} from "../src/lib/otp.server";

describe("OTP Server-Side Security & Flow Suite", () => {
  const testEmail = "test.verification@university.edu";

  it("generates a 6-digit numeric string", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
    expect(Number(otp)).toBeGreaterThanOrEqual(100000);
    expect(Number(otp)).toBeLessThanOrEqual(999999);
  });

  it("hashes OTP deterministically using HMAC-SHA256", () => {
    const otp = "849201";
    const hash1 = hashOtp(otp);
    const hash2 = hashOtp(otp);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
    expect(hash1).not.toBe(otp); // Never plaintext
  });

  it("securely compares identical hashes and rejects mismatches", () => {
    const hashA = hashOtp("123456");
    const hashB = hashOtp("123456");
    const hashC = hashOtp("654321");

    expect(secureCompare(hashA, hashB)).toBe(true);
    expect(secureCompare(hashA, hashC)).toBe(false);
  });

  it("normalizes email addresses cleanly", () => {
    expect(normalizeEmail("  Student@University.EDU  ")).toBe("student@university.edu");
  });

  it("stores, retrieves and validates OTP record lifecycle", async () => {
    const otp = "729104";
    const otpHash = hashOtp(otp);
    const id = "test-record-id-1";
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const resendAvailableAt = new Date(now.getTime() + 60 * 1000);

    await saveOtpRecord({
      id,
      email: testEmail,
      otpHash,
      verificationTokenHash: null,
      attemptsCount: 0,
      maxAttempts: 5,
      verified: false,
      verifiedAt: null,
      used: false,
      usedAt: null,
      expiresAt,
      resendAvailableAt,
      createdAt: now,
    });

    const record = await getLatestOtpRecord(testEmail);
    expect(record).not.toBeNull();
    expect(record?.email).toBe(testEmail);
    expect(record?.verified).toBe(false);
    expect(record?.attemptsCount).toBe(0);

    // Increment attempts on incorrect guess
    record!.attemptsCount += 1;
    await updateOtpRecord(record!);

    const updated = await getLatestOtpRecord(testEmail);
    expect(updated?.attemptsCount).toBe(1);

    // Verify OTP and generate token
    const token = generateVerificationToken();
    updated!.verified = true;
    updated!.verifiedAt = new Date();
    updated!.verificationTokenHash = hashVerificationToken(token);
    updated!.otpHash = "INVALIDATED";
    await updateOtpRecord(updated!);

    const verifiedRecord = await getLatestOtpRecord(testEmail);
    expect(verifiedRecord?.verified).toBe(true);
    expect(verifiedRecord?.otpHash).toBe("INVALIDATED");

    // Check token comparison
    const incomingTokenHash = hashVerificationToken(token);
    expect(secureCompare(incomingTokenHash, verifiedRecord!.verificationTokenHash!)).toBe(true);

    // Reject token reuse
    verifiedRecord!.used = true;
    verifiedRecord!.usedAt = new Date();
    await updateOtpRecord(verifiedRecord!);

    const usedRecord = await getLatestOtpRecord(testEmail);
    expect(usedRecord?.used).toBe(true);
  });
});
