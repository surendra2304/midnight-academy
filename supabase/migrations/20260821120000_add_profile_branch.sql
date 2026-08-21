-- Add branch (e.g. CSE, ECE) to profiles so signup can capture the student's
-- B.Tech branch alongside the existing year / institution columns.
alter table public.profiles
  add column if not exists branch text;
