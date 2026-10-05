-- Assessment answer keys are stored in trusted content payloads/options and are
-- served to learners only through server functions with stage-specific checks.
-- The client must never be able to select these tables directly.
BEGIN;

DROP POLICY IF EXISTS "Read content items for published tests" ON public.content_items;
DROP POLICY IF EXISTS "Read question options" ON public.question_options;

REVOKE SELECT ON TABLE public.content_items FROM PUBLIC, anon, authenticated;
REVOKE SELECT ON TABLE public.question_options FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.content_items, public.question_options TO service_role;

COMMENT ON TABLE public.content_items IS
  'Assessment content is read by trusted server functions; client access is restricted to prevent answer-key extraction from payloads.';
COMMENT ON TABLE public.question_options IS
  'Assessment options and answer flags are read by trusted server functions; client access is restricted to prevent answer-key extraction.';

COMMIT;
