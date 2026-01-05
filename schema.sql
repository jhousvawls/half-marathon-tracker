-- Create tables for the Lean Half Marathon Tracker

-- 1. Users table (usually managed by Supabase Auth, but adding profile data here)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  target_waist_in numeric,
  target_weight_lbs numeric,
  created_at timestamptz default now()
);

-- 2. Training Plan (Static or User-specific plan structure)
create table public.plan_weeks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  week_number int not null,
  start_date date,
  easy_run_target text,    -- e.g. "30 min"
  quality_run_target text, -- e.g. "4x400m"
  long_run_target text,    -- e.g. "3.0 miles"
  notes text,
  created_at timestamptz default now()
);

-- 3. Daily Logs (The core daily activity)
create table public.day_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  date date not null,
  
  -- Planned
  planned_workout_type text, -- Run, OTF, Walk, etc.
  planned_target text,
  
  -- Completed
  completed_run boolean default false,
  completed_otf boolean default false,
  completed_walk boolean default false,
  completed_mobility boolean default false,
  
  -- Metrics
  steps int,
  readiness_score int, -- 1-10 or mapped from color
  readiness_color text, -- Green, Yellow, Red
  notes text,
  
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- 4. Weekly Check-ins
create table public.week_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  week_start_date date not null,
  
  weight_lbs numeric,
  waist_in numeric,
  long_run_miles numeric,
  
  runs_completed int,
  otf_completed int,
  eating_out_count int,
  alcohol_drinks int,
  energy int,
  
  notes text,
  created_at timestamptz default now()
);
