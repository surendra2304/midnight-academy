-- Manual instructor review: allows the test owner to override or annotate the
-- AI evaluation per answer.
alter table public.attempt_answers
  add column if not exists manual_score integer,
  add column if not exists manual_feedback text;

comment on column public.attempt_answers.manual_score is 'Instructor-assigned score (0-10), overriding the AI score when set.';
comment on column public.attempt_answers.manual_feedback is 'Instructor feedback note shown alongside the AI evaluation.';
