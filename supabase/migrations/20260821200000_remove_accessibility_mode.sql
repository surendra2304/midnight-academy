-- Accessibility mode removed: extended reading time is unfair in a
-- standardized testing environment. Drop the column and its index.
alter table public.profiles
  drop column if exists accessibility_mode;
