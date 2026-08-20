/**
 * Server-only cryptographic utilities and in-memory fallback store for OTP email verification.
 */
import crypto from "node:crypto";

export interface StoredOtpRecord {
  id: string;
  email: string;
  otpHash: string;
  verificationTokenHash: string | null;
  attemptsCount: number;
  maxAttempts: number;
  verified: boolean;
  verifiedAt: Date | null;
  used: boolean;
  usedAt: Date | null;
  expiresAt: Date;
  resendAvailableAt: Date;
  createdAt: Date;
}

// In-memory thread-safe store for OTP records
const inMemoryStore = new Map<string, StoredOtpRecord>();

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
export function generateOtp(): string {
  // Generates integer between 100000 and 999999 inclusive
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hashes an OTP using SHA-256 with an HMAC salt to prevent rainbow table attacks.
 */
export function hashOtp(otp: string): string {
  const salt = process.env["SUPABASE_SECRET_KEY"] || "midnight-academy-otp-salt";
  return crypto.createHmac("sha256", salt).update(otp.trim()).digest("hex");
}

/**
 * Generates a cryptographically secure verification token (returned to the client after OTP verification).
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hashes a verification token before storage or comparison.
 */
export function hashVerificationToken(token: string): string {
  const salt = process.env["SUPABASE_SECRET_KEY"] || "midnight-academy-token-salt";
  return crypto.createHmac("sha256", salt).update(token.trim()).digest("hex");
}

/**
 * Constant-time string equality check to prevent timing attacks.
 */
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Normalizes email address (lowercase, trimmed).
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Saves or updates an OTP record for an email.
 */
export async function saveOtpRecord(record: StoredOtpRecord): Promise<void> {
  // 1. Always write to in-memory store
  inMemoryStore.set(record.email, record);

  // 2. Attempt DB write if email_verifications table exists
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const client = supabaseAdmin as unknown as {
      from: (table: string) => {
        insert: (data: Record<string, unknown>) => Promise<unknown>;
      };
    };
    await client.from("email_verifications").insert({
      id: record.id,
      email: record.email,
      otp_hash: record.otpHash,
      verification_token_hash: record.verificationTokenHash,
      attempts_count: record.attemptsCount,
      max_attempts: record.maxAttempts,
      verified: record.verified,
      verified_at: record.verifiedAt?.toISOString() ?? null,
      used: record.used,
      used_at: record.usedAt?.toISOString() ?? null,
      expires_at: record.expiresAt.toISOString(),
      resend_available_at: record.resendAvailableAt.toISOString(),
      created_at: record.createdAt.toISOString(),
    });
  } catch {
    // Falls back gracefully to server-side memory store
  }
}

/**
 * Retrieves the latest active OTP record for an email.
 */
export async function getLatestOtpRecord(email: string): Promise<StoredOtpRecord | null> {
  const normalized = normalizeEmail(email);

  // Try DB first
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const client = supabaseAdmin as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (
            col: string,
            val: string,
          ) => {
            order: (
              col: string,
              opts: { ascending: boolean },
            ) => {
              limit: (n: number) => {
                maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
              };
            };
          };
        };
      };
    };

    const { data } = await client
      .from("email_verifications")
      .select("*")
      .eq("email", normalized)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return {
        id: String(data["id"]),
        email: String(data["email"]),
        otpHash: String(data["otp_hash"]),
        verificationTokenHash: data["verification_token_hash"]
          ? String(data["verification_token_hash"])
          : null,
        attemptsCount: Number(data["attempts_count"] || 0),
        maxAttempts: Number(data["max_attempts"] || 5),
        verified: Boolean(data["verified"]),
        verifiedAt: data["verified_at"] ? new Date(String(data["verified_at"])) : null,
        used: Boolean(data["used"]),
        usedAt: data["used_at"] ? new Date(String(data["used_at"])) : null,
        expiresAt: new Date(String(data["expires_at"])),
        resendAvailableAt: new Date(String(data["resend_available_at"])),
        createdAt: new Date(String(data["created_at"])),
      };
    }
  } catch {
    // Fall back to memory store
  }

  return inMemoryStore.get(normalized) ?? null;
}

/**
 * Updates an existing OTP record.
 */
export async function updateOtpRecord(record: StoredOtpRecord): Promise<void> {
  inMemoryStore.set(record.email, record);

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const client = supabaseAdmin as unknown as {
      from: (table: string) => {
        update: (data: Record<string, unknown>) => {
          eq: (col: string, val: string) => Promise<unknown>;
        };
      };
    };
    await client
      .from("email_verifications")
      .update({
        otp_hash: record.otpHash,
        verification_token_hash: record.verificationTokenHash,
        attempts_count: record.attemptsCount,
        verified: record.verified,
        verified_at: record.verifiedAt?.toISOString() ?? null,
        used: record.used,
        used_at: record.usedAt?.toISOString() ?? null,
      })
      .eq("id", record.id);
  } catch {
    // Memory store is already updated
  }
}
