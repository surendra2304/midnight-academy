-- Accessibility mode: extends the reading timer (1.5x) for students who need it.
alter table public.profiles
  add column if not exists accessibility_mode boolean not null default false;
