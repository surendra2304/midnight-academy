-- Drop unique constraint on attempts table to allow students to take practice tests repeatedly
-- and retake tests when permitted.
ALTER TABLE public.attempts DROP CONSTRAINT IF EXISTS attempts_test_id_student_id_key;
ALTER TABLE public.attempts DROP CONSTRAINT IF EXISTS attempts_test_id_student_id_unique;
