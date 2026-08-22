-- Add the student's code / roll number (as issued by the college) to profiles.
alter table public.profiles
  add column if not exists code_number text;

-- Helpful for instructors looking students up by roll number.
create index if not exists profiles_code_number_idx on public.profiles (code_number);
