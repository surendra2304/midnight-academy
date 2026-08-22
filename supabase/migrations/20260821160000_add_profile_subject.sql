-- Instructor's teaching subject (e.g. Data Structures).
alter table public.profiles
  add column if not exists subject text;
