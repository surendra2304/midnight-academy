CREATE TYPE public.app_role AS ENUM ('admin', 'student');
CREATE TYPE public.test_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE public.attempt_status AS ENUM ('in_progress', 'evaluating', 'evaluated');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  institution text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Medium',
  question_count integer NOT NULL DEFAULT 10,
  seconds_per_question integer NOT NULL DEFAULT 45,
  response_seconds integer NOT NULL DEFAULT 120,
  status public.test_status NOT NULL DEFAULT 'draft',
  code text UNIQUE,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tests TO authenticated;
GRANT ALL ON public.tests TO service_role;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage own tests" ON public.tests FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  text text NOT NULL,
  category text NOT NULL,
  topic text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'Medium',
  concepts text[] NOT NULL DEFAULT '{}',
  constraints text[] NOT NULL DEFAULT '{}',
  reference_answer text NOT NULL DEFAULT '',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage own test questions" ON public.questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tests t WHERE t.id = questions.test_id AND t.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tests t WHERE t.id = questions.test_id AND t.owner_id = auth.uid()));

CREATE TABLE public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.attempt_status NOT NULL DEFAULT 'in_progress',
  score integer,
  axes jsonb,
  blur_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (test_id, student_id)
);
GRANT SELECT, INSERT, UPDATE ON public.attempts TO authenticated;
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own attempts" ON public.attempts FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins read attempts on own tests" ON public.attempts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tests t WHERE t.id = attempts.test_id AND t.owner_id = auth.uid()));

CREATE POLICY "Students read tests they attempted" ON public.tests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attempts a WHERE a.test_id = tests.id AND a.student_id = auth.uid()));

CREATE TABLE public.attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  response text NOT NULL DEFAULT '',
  score numeric(4,1),
  feedback text,
  missed_concepts text[] NOT NULL DEFAULT '{}',
  missed_constraints text[] NOT NULL DEFAULT '{}',
  flagged boolean NOT NULL DEFAULT false,
  revealed_at timestamptz,
  submitted_at timestamptz,
  UNIQUE (attempt_id, question_id)
);
GRANT SELECT, INSERT, UPDATE ON public.attempt_answers TO authenticated;
GRANT ALL ON public.attempt_answers TO service_role;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own answers" ON public.attempt_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_answers.attempt_id AND a.student_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_answers.attempt_id AND a.student_id = auth.uid()));
CREATE POLICY "Admins read answers on own tests" ON public.attempt_answers FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.attempts a JOIN public.tests t ON t.id = a.test_id
    WHERE a.id = attempt_answers.attempt_id AND t.owner_id = auth.uid()
  ));
CREATE POLICY "Admins update answers on own tests" ON public.attempt_answers FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.attempts a JOIN public.tests t ON t.id = a.test_id
    WHERE a.id = attempt_answers.attempt_id AND t.owner_id = auth.uid()
  ));

CREATE INDEX idx_questions_test ON public.questions(test_id, position);
CREATE INDEX idx_attempts_student ON public.attempts(student_id, started_at DESC);
CREATE INDEX idx_answers_attempt ON public.attempt_answers(attempt_id, position);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, institution, year)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'institution', ''),
    COALESCE(NEW.raw_user_meta_data->>'year', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'admin'
      THEN 'admin'::public.app_role ELSE 'student'::public.app_role END
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();