DROP POLICY IF EXISTS "Admins manage own test questions" ON public.questions;
CREATE POLICY "Admins manage own test questions" ON public.questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Admins read attempts on own tests" ON public.attempts;
CREATE POLICY "Admins read attempts on own tests" ON public.attempts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Students read tests they attempted" ON public.tests;
CREATE POLICY "Students read tests they attempted" ON public.tests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attempts a WHERE a.test_id = id AND a.student_id = auth.uid()));

DROP POLICY IF EXISTS "Students manage own answers" ON public.attempt_answers;
CREATE POLICY "Students manage own answers" ON public.attempt_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_id AND a.student_id = auth.uid()));

DROP POLICY IF EXISTS "Admins read answers on own tests" ON public.attempt_answers;
DROP POLICY IF EXISTS "Admins can view attempt answers for their tests" ON public.attempt_answers;
CREATE POLICY "Admins read answers on own tests" ON public.attempt_answers FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.attempts a JOIN public.tests t ON t.id = a.test_id
    WHERE a.id = attempt_id AND t.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins update answers on own tests" ON public.attempt_answers;
CREATE POLICY "Admins update answers on own tests" ON public.attempt_answers FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.attempts a JOIN public.tests t ON t.id = a.test_id
    WHERE a.id = attempt_id AND t.owner_id = auth.uid()
  ));
