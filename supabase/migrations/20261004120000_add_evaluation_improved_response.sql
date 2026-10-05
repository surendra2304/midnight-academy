-- Preserve the model/reference response shown alongside writing and speaking feedback.
alter table public.evaluations
  add column if not exists improved_response text not null default '';
