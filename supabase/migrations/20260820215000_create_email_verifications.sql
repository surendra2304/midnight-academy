-- Create email_verifications table for OTP verification flow
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_hash text NOT NULL,
  verification_token_hash text,
  attempts_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  expires_at timestamptz NOT NULL,
  resend_available_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick email lookups of active OTPs
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_created ON public.email_verifications(created_at DESC);

-- Enable RLS and grant service_role full access
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.email_verifications TO service_role;
REVOKE ALL ON public.email_verifications FROM anon, authenticated;
