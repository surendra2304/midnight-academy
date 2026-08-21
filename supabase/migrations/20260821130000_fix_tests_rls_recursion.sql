-- Fix infinite RLS recursion between tests / attempts / attempt_answers policies.
--
-- Cross-table EXISTS() subqueries in policies re-enter RLS on the referenced
-- table (tests -> attempts -> tests ...), which makes Supabase error with
-- "infinite recursion detected in policy for relation tests" and blocks test
-- creation entirely. SECURITY DEFINER helper functions bypass RLS when reading
-- the referenced rows, breaking the cycle.

-- Helpers (bypass RLS; owner checks stay in SQL)
CREATE OR REPLACE FUNCTION public.owns_test(_test_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tests t WHERE t.id = _test_id AND t.owner_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.has_attempt_on_test(_test_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.attempts a WHERE a.test_id = _test_id AND a.student_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.owns_attempt(_attempt_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = _attempt_id AND a.student_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.owns_attempt_test(_attempt_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.attempts a
    JOIN public.tests t ON t.id = a.test_id
    WHERE a.id = _attempt_id AND t.owner_id = _user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.owns_test(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_attempt_on_test(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_attempt(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_attempt_test(uuid, uuid) TO authenticated;

-- tests
DROP POLICY IF EXISTS "Admins manage own tests" ON public.tests;
CREATE POLICY "Admins manage own tests" ON public.tests FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Students read tests they attempted" ON public.tests;
CREATE POLICY "Students read tests they attempted" ON public.tests FOR SELECT TO authenticated
  USING (public.has_attempt_on_test(id, auth.uid()));

-- questions
DROP POLICY IF EXISTS "Admins manage own test questions" ON public.questions;
CREATE POLICY "Admins manage own test questions" ON public.questions FOR ALL TO authenticated
  USING (public.owns_test(test_id, auth.uid()))
  WITH CHECK (public.owns_test(test_id, auth.uid()));

-- attempts
DROP POLICY IF EXISTS "Students manage own attempts" ON public.attempts;
CREATE POLICY "Students manage own attempts" ON public.attempts FOR ALL TO authenticated
  USING (public.owns_attempt(id, auth.uid()))
  WITH CHECK (public.owns_attempt(id, auth.uid()));

DROP POLICY IF EXISTS "Admins read attempts on own tests" ON public.attempts;
CREATE POLICY "Admins read attempts on own tests" ON public.attempts FOR SELECT TO authenticated
  USING (public.owns_attempt_test(id, auth.uid()));

-- attempt_answers
DROP POLICY IF EXISTS "Students manage own answers" ON public.attempt_answers;
CREATE POLICY "Students manage own answers" ON public.attempt_answers FOR ALL TO authenticated
  USING (public.owns_attempt(attempt_id, auth.uid()))
  WITH CHECK (public.owns_attempt(attempt_id, auth.uid()));

DROP POLICY IF EXISTS "Admins read answers on own tests" ON public.attempt_answers;
CREATE POLICY "Admins read answers on own tests" ON public.attempt_answers FOR SELECT TO authenticated
  USING (public.owns_attempt_test(attempt_id, auth.uid()));

DROP POLICY IF EXISTS "Admins update answers on own tests" ON public.attempt_answers;
CREATE POLICY "Admins update answers on own tests" ON public.attempt_answers FOR UPDATE TO authenticated
  USING (public.owns_attempt_test(attempt_id, auth.uid()));
