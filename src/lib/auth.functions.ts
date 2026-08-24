import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * 1. Request OTP Code for registration
 */
export const requestRegistrationOtp = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        email: z.string().email(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { normalizeEmail, generateOtp, hashOtp, getLatestOtpRecord, saveOtpRecord } =
      await import("./otp.server");
    const { sendEmail, renderOtpVerificationEmail } = await import("./email.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = normalizeEmail(data.email);

    // Check if email already registered in Supabase auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = (existingUsers?.users ?? []).find((u) => u.email?.toLowerCase() === email);

    if (existingUser) {
      return {
        error: "already_registered" as const,
        message: "An account with this email already exists. Please sign in instead.",
      };
    }

    // Check resend rate limits
    const existingRecord = await getLatestOtpRecord(email);
    const now = new Date();

    if (existingRecord && existingRecord.resendAvailableAt > now) {
      const waitSeconds = Math.ceil(
        (existingRecord.resendAvailableAt.getTime() - now.getTime()) / 1000,
      );
      return {
        error: "rate_limited" as const,
        message: `Please wait ${waitSeconds} seconds before requesting another code.`,
        waitSeconds,
      };
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const id = crypto.randomUUID();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

    const emailHtml = renderOtpVerificationEmail({ otp, expiresInMinutes: 10 });
    const emailResult = await sendEmail({
      to: email,
      subject: "Your Midnight Academy Verification Code",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error(
        "[requestRegistrationOtp] Failed to deliver verification code:",
        emailResult.error,
      );
      return {
        error: "delivery_failed" as const,
        message: "Unable to send the verification email right now. Please try again.",
      };
    }

    // ONLY AFTER SUCCESS: Save to DB to begin the cooldown
    await saveOtpRecord({
      id,
      email,
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

    return {
      success: true,
      email,
      expiresInSeconds: 600,
      resendInSeconds: 60,
    };
  });

/**
 * 2. Verify OTP Code submitted by user
 */
export const verifyRegistrationOtp = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        email: z.string().email(),
        otp: z.string().min(6).max(8),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const {
      normalizeEmail,
      hashOtp,
      secureCompare,
      generateVerificationToken,
      hashVerificationToken,
      getLatestOtpRecord,
      updateOtpRecord,
    } = await import("./otp.server");

    const email = normalizeEmail(data.email);
    const record = await getLatestOtpRecord(email);
    const now = new Date();

    if (!record) {
      return {
        error: "invalid_otp" as const,
        message: "No verification code requested for this email. Please request a code.",
      };
    }

    if (record.used) {
      return {
        error: "already_used" as const,
        message: "This verification code has already been used. Please request a new code.",
      };
    }

    if (record.expiresAt < now) {
      return {
        error: "expired" as const,
        message: "This verification code has expired. Please request a new code.",
      };
    }

    if (record.attemptsCount >= record.maxAttempts) {
      return {
        error: "max_attempts" as const,
        message: "Too many incorrect attempts. Please request a new verification code.",
      };
    }

    const submittedHash = hashOtp(data.otp);
    const isMatch = secureCompare(submittedHash, record.otpHash);

    if (!isMatch) {
      record.attemptsCount += 1;
      await updateOtpRecord(record);
      const remaining = record.maxAttempts - record.attemptsCount;
      return {
        error: "incorrect_otp" as const,
        message:
          remaining > 0
            ? `Invalid code. ${remaining} attempt(s) remaining.`
            : "Too many incorrect attempts. Please request a new code.",
        remainingAttempts: Math.max(0, remaining),
      };
    }

    // OTP is valid: generate short-lived verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenHash = hashVerificationToken(verificationToken);

    record.verified = true;
    record.verifiedAt = now;
    record.verificationTokenHash = verificationTokenHash;
    // Invalidate OTP hash so it cannot be matched again
    record.otpHash = "INVALIDATED";
    await updateOtpRecord(record);

    return {
      success: true,
      email,
      verificationToken,
    };
  });

/**
 * 3. Complete Registration with Password (authorized only via verified token)
 */
export const completeRegistrationWithPassword = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        email: z.string().email(),
        verificationToken: z.string().min(32),
        password: z.string().min(6).max(72),
        fullName: z.string().max(120).optional(),
        role: z.enum(["student", "admin"]).default("student"),
        year: z.string().max(30).optional(),
        branch: z.string().max(60).optional(),
        regdNumber: z
          .string()
          .regex(/^[A-Za-z0-9]{10}$/, "Registration number must be exactly 10 characters.")
          .optional(),
        institution: z.string().max(160).optional(),
        subject: z.string().max(120).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const {
      normalizeEmail,
      hashVerificationToken,
      secureCompare,
      getLatestOtpRecord,
      updateOtpRecord,
    } = await import("./otp.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = normalizeEmail(data.email);
    const record = await getLatestOtpRecord(email);

    if (!record || !record.verified || !record.verificationTokenHash) {
      throw new Error("Email verification is required before creating a password.");
    }

    if (record.used) {
      throw new Error("This verification token has already been used to create an account.");
    }

    const submittedTokenHash = hashVerificationToken(data.verificationToken);
    const isTokenValid = secureCompare(submittedTokenHash, record.verificationTokenHash);

    if (!isTokenValid) {
      throw new Error("Invalid or expired verification token.");
    }

    // Mark record as used immediately to prevent multiple registrations
    record.used = true;
    record.usedAt = new Date();
    await updateOtpRecord(record);

    // Create user in Supabase Auth via Admin API with email confirmed.
    // Role is chosen at signup: "student" or "admin" (instructor).
    const displayName = data.fullName?.trim() || email.split("@")[0] || "Student";
    const { data: createdUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        role: data.role,
      },
    });

    if (authError || !createdUser.user) {
      throw new Error(authError?.message || "Could not create account in Supabase Auth.");
    }

    const userId = createdUser.user.id;

    // Create/update profile (with basic details) and the selected role
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email,
      full_name: displayName,
      ...(data.year ? { year: data.year } : {}),
      ...(data.branch ? { branch: data.branch } : {}),
      ...(data.regdNumber ? { code_number: data.regdNumber.trim().toUpperCase() } : {}),
      ...(data.institution ? { institution: data.institution } : {}),
      ...(data.subject ? { subject: data.subject } : {}),
      onboarded: false,
    });
    if (profileError) {
      throw new Error(profileError.message || "Could not save the profile details.");
    }

    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({
      user_id: userId,
      role: data.role,
    });
    if (roleError) {
      throw new Error(roleError.message || "Could not assign the selected role.");
    }

    return {
      success: true,
      userId,
      email,
      role: data.role,
    };
  });

/**
 * 4. OAuth (e.g. Google) post-login status check.
 * Runs server-side with the service role because RLS forbids clients from
 * reading arbitrary user_roles rows. Does NOT create anything: an existing
 * account (role assigned) signs straight in; a first-time Google identity is
 * routed to the signup continuation flow instead of being auto-registered.
 */
export const getOAuthAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const authUserId = context?.userId;
    if (!authUserId) throw new Error("Unauthorized.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authUserId);

    if (rolesError) {
      console.error("[getOAuthAccountStatus] roles query failed:", rolesError.message);
      throw new Error("Could not check the account status. Please try again.");
    }

    const roles = existingRoles ?? [];
    if (roles.length === 0) {
      return { hasAccount: false as const, email: null, fullName: null };
    }

    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(authUserId);
    if (userError || !userData?.user) {
      console.error("[getOAuthAccountStatus] getUserById failed:", userError?.message);
      throw new Error("Could not load the account. Please try again.");
    }
    const metadata = (userData.user.user_metadata ?? {}) as Record<string, unknown>;

    return {
      hasAccount: true as const,
      role: (roles[0]?.role ?? "student") as "admin" | "student",
      email: userData.user.email ?? null,
      fullName:
        typeof metadata["full_name"] === "string" && metadata["full_name"]
          ? metadata["full_name"]
          : null,
    };
  });

/**
 * 5. Complete registration for a first-time Google identity.
 * The OAuth callback deliberately leaves the account unregistered (no role);
 * this finishes signup with the chosen password, role and details, using the
 * service role for the password update and the RLS-protected writes.
 */
export const completeGoogleRegistration = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        password: z
          .string()
          .min(6)
          .max(72)
          .nullish()
          .transform((v) => (v === null ? undefined : v)),
        fullName: z.string().max(120),
        role: z.enum(["student", "admin"]),
        year: z.string().max(30).optional(),
        branch: z.string().max(60).optional(),
        regdNumber: z
          .string()
          .regex(/^[A-Za-z0-9]{10}$/, "Registration number must be exactly 10 characters.")
          .optional(),
        institution: z.string().max(160).optional(),
        subject: z.string().max(120).optional(),
      })
      .parse(data),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const authUserId = context?.userId;
    if (!authUserId) throw new Error("Unauthorized.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authUserId);

    if (rolesError) {
      console.error("[completeGoogleRegistration] roles query failed:", rolesError.message);
    }

    if (existingRoles && existingRoles.length > 0) {
      throw new Error("This Google account is already registered. Please sign in.");
    }

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(authUserId);
    const user = userData?.user;
    if (!user) throw new Error("Google account not found. Please try again.");

    // Google identities may skip the password entirely — they sign in with Google.
    if (data.password) {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: data.password,
      });
      if (passwordError) {
        throw new Error(passwordError.message || "Could not set the password.");
      }
    }

    const { error: googleProfileError } = await supabaseAdmin.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: data.fullName.trim(),
      ...(data.year ? { year: data.year } : {}),
      ...(data.branch ? { branch: data.branch } : {}),
      ...(data.regdNumber ? { code_number: data.regdNumber.trim().toUpperCase() } : {}),
      ...(data.institution ? { institution: data.institution } : {}),
      ...(data.subject ? { subject: data.subject } : {}),
      onboarded: false,
    });
    if (googleProfileError) {
      throw new Error(googleProfileError.message || "Could not save the profile details.");
    }

    const { error: googleRoleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: user.id,
      role: data.role,
    });
    if (googleRoleError) {
      throw new Error(googleRoleError.message || "Could not assign the selected role.");
    }

    return {
      success: true,
      userId: user.id,
      email: user.email ?? "",
      role: data.role,
    };
  });

/**
 * 6. Request Password Reset OTP Code
 */
export const requestPasswordResetOtp = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        email: z.string().email(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { normalizeEmail, generateOtp, hashOtp, getLatestOtpRecord, saveOtpRecord } =
      await import("./otp.server");
    const { sendEmail, renderPasswordResetEmail } = await import("./email.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = normalizeEmail(data.email);

    // Check if email actually exists in Supabase auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = (existingUsers?.users ?? []).find((u) => u.email?.toLowerCase() === email);

    if (!existingUser) {
      return {
        error: "not_found" as const,
        message: "No account found with this email. Please check your email or sign up.",
      };
    }

    // Check resend rate limits
    const existingRecord = await getLatestOtpRecord(email);
    const now = new Date();

    if (existingRecord && existingRecord.resendAvailableAt > now) {
      const waitSeconds = Math.ceil(
        (existingRecord.resendAvailableAt.getTime() - now.getTime()) / 1000,
      );
      return {
        error: "rate_limited" as const,
        message: `Please wait ${waitSeconds} seconds before requesting another code.`,
        waitSeconds,
      };
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const id = crypto.randomUUID();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

    const emailHtml = renderPasswordResetEmail({ otp, expiresInMinutes: 10 });
    const emailResult = await sendEmail({
      to: email,
      subject: "Reset Your Midnight Academy Password",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error(
        "[requestPasswordResetOtp] Failed to deliver reset code:",
        emailResult.error,
      );
      return {
        error: "delivery_failed" as const,
        message: "Unable to send password reset email right now. Please try again.",
      };
    }

    await saveOtpRecord({
      id,
      email,
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

    return {
      success: true,
      email,
      expiresInSeconds: 600,
      resendInSeconds: 60,
    };
  });

/**
 * 7. Complete Password Reset using verified token
 */
export const completePasswordReset = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        email: z.string().email(),
        verificationToken: z.string().min(32),
        newPassword: z.string().min(6).max(72),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const {
      normalizeEmail,
      hashVerificationToken,
      secureCompare,
      getLatestOtpRecord,
      updateOtpRecord,
    } = await import("./otp.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = normalizeEmail(data.email);
    const record = await getLatestOtpRecord(email);

    if (!record || !record.verified || !record.verificationTokenHash) {
      throw new Error("Email verification is required before resetting password.");
    }

    if (record.used) {
      throw new Error("This verification token has already been used.");
    }

    const submittedTokenHash = hashVerificationToken(data.verificationToken);
    const isTokenValid = secureCompare(submittedTokenHash, record.verificationTokenHash);

    if (!isTokenValid) {
      throw new Error("Invalid or expired reset token.");
    }

    // Mark as used
    record.used = true;
    record.usedAt = new Date();
    await updateOtpRecord(record);

    // Find user in auth.users
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const user = (userList?.users ?? []).find((u) => u.email?.toLowerCase() === email);

    if (!user) {
      throw new Error("User account not found.");
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: data.newPassword,
    });

    if (updateError) {
      throw new Error(updateError.message || "Failed to update password.");
    }

    return {
      success: true,
      email,
    };
  });
