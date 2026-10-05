-- Practice-only scoring can be unavailable when one or more sections cannot be
-- evaluated (for example, audio could not be transcribed). NULL is distinct
-- from a real minimum score and prevents fabricated 1.0/0 comparison values.
ALTER TABLE public.score_reports
  ALTER COLUMN overall_band DROP NOT NULL,
  ALTER COLUMN reading_band DROP NOT NULL,
  ALTER COLUMN listening_band DROP NOT NULL,
  ALTER COLUMN writing_band DROP NOT NULL,
  ALTER COLUMN speaking_band DROP NOT NULL,
  ALTER COLUMN comparable_score DROP NOT NULL;
