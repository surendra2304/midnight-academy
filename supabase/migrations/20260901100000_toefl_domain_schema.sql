-- =====================================================================
-- Migration: 20260901100000_toefl_domain_schema.sql
-- Description: Additive TOEFL 2026 Domain Model
-- Enums, Tables, Indexes, Triggers, and RLS Policies
-- =====================================================================

-- 1. ENUMS (Safe creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'toefl_section_type') THEN
        CREATE TYPE public.toefl_section_type AS ENUM ('reading', 'listening', 'writing', 'speaking');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'toefl_blueprint_status') THEN
        CREATE TYPE public.toefl_blueprint_status AS ENUM ('draft', 'review', 'published', 'retired');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'toefl_difficulty_band') THEN
        CREATE TYPE public.toefl_difficulty_band AS ENUM ('lower', 'middle', 'upper');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'toefl_item_type') THEN
        CREATE TYPE public.toefl_item_type AS ENUM (
            'complete_words',
            'read_daily_life',
            'read_academic',
            'listen_choose_response',
            'listen_conversation',
            'listen_announcement',
            'listen_academic_talk',
            'build_sentence',
            'write_email',
            'academic_discussion',
            'listen_repeat',
            'take_interview'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'toefl_exam_mode') THEN
        CREATE TYPE public.toefl_exam_mode AS ENUM ('full', 'section', 'practice', 'diagnostic');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'toefl_attempt_section_status') THEN
        CREATE TYPE public.toefl_attempt_section_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped');
    END IF;
END $$;

-- 2. EXTEND EXISTING ATTEMPTS TABLE (Additive columns)
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS test_version_id uuid;
ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS exam_mode public.toefl_exam_mode DEFAULT 'practice';

-- 3. TEST_VERSIONS (Immutable versioned blueprint and scoring config)
CREATE TABLE IF NOT EXISTS public.test_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id uuid REFERENCES public.tests(id) ON DELETE CASCADE,
    blueprint_version text NOT NULL DEFAULT '2026.1',
    scoring_version text NOT NULL DEFAULT '2026.1',
    status public.toefl_blueprint_status NOT NULL DEFAULT 'draft',
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    scoring_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    published_at timestamptz,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Foreign key link for attempts -> test_versions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'attempts_test_version_id_fkey'
    ) THEN
        ALTER TABLE public.attempts 
        ADD CONSTRAINT attempts_test_version_id_fkey 
        FOREIGN KEY (test_version_id) REFERENCES public.test_versions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. SECTIONS (Reading / Listening / Writing / Speaking blocks)
CREATE TABLE IF NOT EXISTS public.sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_version_id uuid NOT NULL REFERENCES public.test_versions(id) ON DELETE CASCADE,
    section_type public.toefl_section_type NOT NULL,
    section_order int NOT NULL DEFAULT 0,
    timing_seconds int NOT NULL DEFAULT 1800,
    instructions text NOT NULL DEFAULT '',
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. MODULES (Adaptive stage & difficulty definitions)
CREATE TABLE IF NOT EXISTS public.modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    stage_index int NOT NULL DEFAULT 1,
    difficulty_band public.toefl_difficulty_band NOT NULL DEFAULT 'middle',
    routing_rule jsonb NOT NULL DEFAULT '{}'::jsonb,
    module_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. CONTENT_ITEMS (Normalized item records)
CREATE TABLE IF NOT EXISTS public.content_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE,
    section_type public.toefl_section_type NOT NULL,
    item_type public.toefl_item_type NOT NULL,
    difficulty text NOT NULL DEFAULT 'Medium',
    skill_tags text[] NOT NULL DEFAULT '{}',
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    item_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. CONTENT_ASSETS (Audio, images, transcripts metadata)
CREATE TABLE IF NOT EXISTS public.content_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id uuid REFERENCES public.content_items(id) ON DELETE CASCADE,
    asset_type text NOT NULL, -- 'audio', 'image', 'transcript'
    storage_path text NOT NULL,
    mime_type text NOT NULL,
    duration_ms int,
    checksum text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. QUESTION_OPTIONS (Deterministic answer keys and distractor rationales)
CREATE TABLE IF NOT EXISTS public.question_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
    option_key text NOT NULL,
    option_text text NOT NULL,
    is_correct boolean NOT NULL DEFAULT false,
    distractor_rationale text,
    option_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. RUBRICS (Machine-readable rubric definitions)
CREATE TABLE IF NOT EXISTS public.rubrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rubric_version text NOT NULL DEFAULT '2026.1',
    task_type public.toefl_item_type NOT NULL,
    title text NOT NULL,
    traits jsonb NOT NULL DEFAULT '[]'::jsonb,
    band_descriptors jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. ATTEMPT_SECTIONS (Per-section state and progress)
CREATE TABLE IF NOT EXISTS public.attempt_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id uuid NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    status public.toefl_attempt_section_status NOT NULL DEFAULT 'not_started',
    raw_score numeric,
    section_band numeric,
    time_spent_seconds int DEFAULT 0,
    started_at timestamptz,
    completed_at timestamptz,
    metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. RESPONSES (General response record for all item types)
CREATE TABLE IF NOT EXISTS public.responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_section_id uuid NOT NULL REFERENCES public.attempt_sections(id) ON DELETE CASCADE,
    content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    raw_answer text,
    normalized_answer jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_correct boolean,
    score numeric,
    time_spent_ms int DEFAULT 0,
    flagged boolean DEFAULT false,
    answered_at timestamptz NOT NULL DEFAULT now()
);

-- 12. EVALUATIONS (AI evaluation records with rubric breakdown)
CREATE TABLE IF NOT EXISTS public.evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id uuid NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
    rubric_id uuid REFERENCES public.rubrics(id) ON DELETE SET NULL,
    score_band numeric NOT NULL DEFAULT 0,
    task_score numeric NOT NULL DEFAULT 0,
    traits jsonb NOT NULL DEFAULT '{}'::jsonb,
    strengths text[] NOT NULL DEFAULT '{}',
    issues text[] NOT NULL DEFAULT '{}',
    corrections jsonb NOT NULL DEFAULT '[]'::jsonb,
    next_actions text[] NOT NULL DEFAULT '{}',
    confidence numeric DEFAULT 1.0,
    rubric_version text NOT NULL DEFAULT '2026.1',
    prompt_version text NOT NULL DEFAULT '2026.1',
    model_id text NOT NULL DEFAULT 'gemini-2.5-flash',
    response_hash text,
    evaluated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. SCORE_REPORTS (Computed TOEFL 1-6 band & 0-120 comparison)
CREATE TABLE IF NOT EXISTS public.score_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id uuid NOT NULL UNIQUE REFERENCES public.attempts(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    overall_band numeric NOT NULL DEFAULT 0, -- Scale 1.0 to 6.0 (half-point increments)
    reading_band numeric NOT NULL DEFAULT 0,
    listening_band numeric NOT NULL DEFAULT 0,
    writing_band numeric NOT NULL DEFAULT 0,
    speaking_band numeric NOT NULL DEFAULT 0,
    comparable_score int NOT NULL DEFAULT 0, -- 0 to 120 scale
    target_score numeric,
    target_gap numeric,
    summary text,
    skill_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
    generated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. SKILLS (Skill taxonomy)
CREATE TABLE IF NOT EXISTS public.skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    section_type public.toefl_section_type NOT NULL,
    category text NOT NULL DEFAULT 'General',
    description text,
    parent_id uuid REFERENCES public.skills(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 15. RESPONSE_SKILLS (Skill tagging at response level)
CREATE TABLE IF NOT EXISTS public.response_skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id uuid NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
    skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    is_proficient boolean NOT NULL DEFAULT false,
    score numeric,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 16. RECOMMENDATIONS (Personalized practice queue)
CREATE TABLE IF NOT EXISTS public.recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id uuid REFERENCES public.skills(id) ON DELETE SET NULL,
    reason text NOT NULL,
    priority int NOT NULL DEFAULT 1, -- 1 (Highest) to 5
    target_item_ids uuid[] NOT NULL DEFAULT '{}',
    is_completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 17. STUDY_PLANS (Target-driven study plans)
CREATE TABLE IF NOT EXISTS public.study_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_overall_band numeric NOT NULL DEFAULT 5.0,
    target_date date,
    current_estimated_band numeric,
    milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
    plan_config jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 18. CONTENT_TAGS (Tags for taxonomy and filtering)
CREATE TABLE IF NOT EXISTS public.content_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    tag_type text NOT NULL DEFAULT 'topic', -- 'difficulty', 'domain', 'skill', 'topic'
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_test_versions_test_id ON public.test_versions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_versions_status ON public.test_versions(status);
CREATE INDEX IF NOT EXISTS idx_sections_test_version_id ON public.sections(test_version_id);
CREATE INDEX IF NOT EXISTS idx_modules_section_id ON public.modules(section_id);
CREATE INDEX IF NOT EXISTS idx_content_items_module_id ON public.content_items(module_id);
CREATE INDEX IF NOT EXISTS idx_content_items_type_difficulty ON public.content_items(item_type, difficulty);
CREATE INDEX IF NOT EXISTS idx_question_options_item_id ON public.question_options(content_item_id);
CREATE INDEX IF NOT EXISTS idx_attempt_sections_attempt_id ON public.attempt_sections(attempt_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt_section_id ON public.responses(attempt_section_id);
CREATE INDEX IF NOT EXISTS idx_responses_student_id ON public.responses(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_response_id ON public.evaluations(response_id);
CREATE INDEX IF NOT EXISTS idx_score_reports_student_id ON public.score_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_student_id ON public.recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_student_id ON public.study_plans(student_id);

-- =====================================================================
-- IMMUTABILITY TRIGGER FOR PUBLISHED TEST_VERSIONS
-- =====================================================================
CREATE OR REPLACE FUNCTION public.check_test_version_immutability()
RETURNS trigger AS $$
BEGIN
    IF OLD.status = 'published' AND NEW.status = 'published' THEN
        -- Prevent changing structural blueprint or scoring config once published
        IF OLD.config <> NEW.config OR OLD.scoring_config <> NEW.scoring_config OR OLD.blueprint_version <> NEW.blueprint_version THEN
            RAISE EXCEPTION 'Cannot modify blueprint or scoring config of an immutable published test_version.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_test_version_immutability ON public.test_versions;
CREATE TRIGGER trg_test_version_immutability
BEFORE UPDATE ON public.test_versions
FOR EACH ROW EXECUTE FUNCTION public.check_test_version_immutability();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.test_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;

-- Helper admin check function
CREATE OR REPLACE FUNCTION public.is_admin_or_instructor(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = $1 AND role IN ('admin', 'instructor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TEST_VERSIONS RLS
CREATE POLICY "Students read published test versions" ON public.test_versions
    FOR SELECT TO authenticated
    USING (status = 'published' OR public.is_admin_or_instructor(auth.uid()));

CREATE POLICY "Instructors manage test versions" ON public.test_versions
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- SECTIONS RLS
CREATE POLICY "Read sections of published versions" ON public.sections
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.test_versions tv 
            WHERE tv.id = sections.test_version_id 
            AND (tv.status = 'published' OR public.is_admin_or_instructor(auth.uid()))
        )
    );

CREATE POLICY "Instructors manage sections" ON public.sections
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- MODULES RLS
CREATE POLICY "Read modules of accessible sections" ON public.modules
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sections s
            JOIN public.test_versions tv ON tv.id = s.test_version_id
            WHERE s.id = modules.section_id
            AND (tv.status = 'published' OR public.is_admin_or_instructor(auth.uid()))
        )
    );

CREATE POLICY "Instructors manage modules" ON public.modules
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- CONTENT_ITEMS RLS
CREATE POLICY "Read content items for published tests" ON public.content_items
    FOR SELECT TO authenticated
    USING (
        module_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.modules m
            JOIN public.sections s ON s.id = m.section_id
            JOIN public.test_versions tv ON tv.id = s.test_version_id
            WHERE m.id = content_items.module_id
            AND (tv.status = 'published' OR public.is_admin_or_instructor(auth.uid()))
        )
    );

CREATE POLICY "Instructors manage content items" ON public.content_items
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- CONTENT_ASSETS RLS
CREATE POLICY "Read assets for accessible items" ON public.content_assets
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Instructors manage content assets" ON public.content_assets
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- QUESTION_OPTIONS RLS
-- Students can read options, but is_correct & distractor_rationale are secured via view or server functions
CREATE POLICY "Read question options" ON public.question_options
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Instructors manage question options" ON public.question_options
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- RUBRICS RLS
CREATE POLICY "Anyone read rubrics" ON public.rubrics
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Instructors manage rubrics" ON public.rubrics
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- ATTEMPT_SECTIONS RLS
CREATE POLICY "Students manage own attempt sections" ON public.attempt_sections
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.attempts a
            WHERE a.id = attempt_sections.attempt_id
            AND (a.student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.attempts a
            WHERE a.id = attempt_sections.attempt_id
            AND (a.student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()))
        )
    );

-- RESPONSES RLS
CREATE POLICY "Students manage own responses" ON public.responses
    FOR ALL TO authenticated
    USING (student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()));

-- EVALUATIONS RLS
CREATE POLICY "Students read own evaluations" ON public.evaluations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.responses r
            WHERE r.id = evaluations.response_id
            AND (r.student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()))
        )
    );

CREATE POLICY "Instructors manage evaluations" ON public.evaluations
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- SCORE_REPORTS RLS
CREATE POLICY "Students read own score reports" ON public.score_reports
    FOR SELECT TO authenticated
    USING (student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()));

CREATE POLICY "Instructors manage score reports" ON public.score_reports
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- SKILLS RLS
CREATE POLICY "Read skills" ON public.skills
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Instructors manage skills" ON public.skills
    FOR ALL TO authenticated
    USING (public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (public.is_admin_or_instructor(auth.uid()));

-- RESPONSE_SKILLS RLS
CREATE POLICY "Read response skills" ON public.response_skills
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.responses r
            WHERE r.id = response_skills.response_id
            AND (r.student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()))
        )
    );

-- RECOMMENDATIONS RLS
CREATE POLICY "Students read own recommendations" ON public.recommendations
    FOR ALL TO authenticated
    USING (student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()));

-- STUDY_PLANS RLS
CREATE POLICY "Students manage own study plans" ON public.study_plans
    FOR ALL TO authenticated
    USING (student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()))
    WITH CHECK (student_id = auth.uid() OR public.is_admin_or_instructor(auth.uid()));

-- CONTENT_TAGS RLS
CREATE POLICY "Read content tags" ON public.content_tags
    FOR SELECT TO authenticated
    USING (true);
