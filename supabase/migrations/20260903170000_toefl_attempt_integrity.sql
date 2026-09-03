-- Midnight Academy: attempt integrity, section identity, evaluation lifecycle
alter table public.attempts
  add column if not exists selected_section_type public.toefl_section_type,
  add column if not exists evaluation_status text not null default 'not_started';

create index if not exists idx_attempts_student_version_status
  on public.attempts(student_id, test_version_id, status);

create index if not exists idx_attempts_selected_section
  on public.attempts(selected_section_type);

-- One response per item per attempt section.
create unique index if not exists uq_responses_attempt_section_content
  on public.responses(attempt_section_id, content_item_id);

-- Atomic section transition.
create or replace function public.advance_attempt_section(
  p_attempt_id uuid,
  p_student_id uuid,
  p_current_section_index integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.attempts%rowtype;
  v_current_id uuid;
  v_next_id uuid;
  v_count integer;
  v_next_index integer;
begin
  select *
    into v_attempt
  from public.attempts
  where id = p_attempt_id
    and student_id = p_student_id
  for update;

  if not found then
    raise exception 'attempt_not_found_or_unauthorized';
  end if;

  if v_attempt.status <> 'in_progress' then
    raise exception 'attempt_not_in_progress';
  end if;

  select count(*) into v_count
  from public.attempt_sections
  where attempt_id = p_attempt_id;

  if p_current_section_index < 0 or p_current_section_index >= v_count then
    raise exception 'invalid_section_index';
  end if;

  select a_sec.id into v_current_id
  from public.attempt_sections a_sec
  join public.sections s on s.id = a_sec.section_id
  where a_sec.attempt_id = p_attempt_id
  order by s.section_order
  offset p_current_section_index
  limit 1
  for update of a_sec;

  update public.attempt_sections
  set status = 'completed',
      completed_at = now()
  where id = v_current_id
    and status = 'in_progress';

  if not found then
    raise exception 'current_section_not_active';
  end if;

  v_next_index := p_current_section_index + 1;

  if v_next_index >= v_count then
    update public.attempts
    set status = 'evaluating',
        evaluation_status = 'pending',
        completed_at = coalesce(completed_at, now())
    where id = p_attempt_id;

    return jsonb_build_object(
      'nextSectionIndex', v_next_index,
      'isFinalized', true
    );
  end if;

  select a_sec.id into v_next_id
  from public.attempt_sections a_sec
  join public.sections s on s.id = a_sec.section_id
  where a_sec.attempt_id = p_attempt_id
  order by s.section_order
  offset v_next_index
  limit 1
  for update of a_sec;

  update public.attempt_sections
  set status = 'in_progress',
      started_at = coalesce(started_at, now())
  where id = v_next_id
    and status = 'not_started';

  if not found then
    raise exception 'next_section_not_ready';
  end if;

  return jsonb_build_object(
    'nextSectionIndex', v_next_index,
    'isFinalized', false
  );
end;
$$;

revoke all on function public.advance_attempt_section(uuid, uuid, integer)
  from public;
grant execute on function public.advance_attempt_section(uuid, uuid, integer)
  to service_role;

-- Storage bucket for speaking recordings
insert into storage.buckets (id, name, public)
values ('speaking-recordings', 'speaking-recordings', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Students can upload speaking recordings' and tablename = 'objects'
  ) then
    create policy "Students can upload speaking recordings"
      on storage.objects for insert
      with check (
        bucket_id = 'speaking-recordings'
        and (auth.role() = 'service_role' or auth.uid()::text = (storage.foldername(name))[1])
      );
  end if;

  if not exists (
    select 1 from pg_policies where policyname = 'Students can read their own speaking recordings' and tablename = 'objects'
  ) then
    create policy "Students can read their own speaking recordings"
      on storage.objects for select
      using (
        bucket_id = 'speaking-recordings'
        and (auth.role() = 'service_role' or auth.uid()::text = (storage.foldername(name))[1])
      );
  end if;
end $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_question_options_item_key ON public.question_options(content_item_id, option_key);

