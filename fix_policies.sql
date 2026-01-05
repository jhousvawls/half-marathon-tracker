
-- FIX INSERT POLICIES

-- Drop existing policies to be safe (avoid duplicates)
drop policy if exists "Users can all own day_logs" on public.day_logs;
drop policy if exists "Users can all own week_checkins" on public.week_checkins;

-- 1. Day Logs: Allow users to INSERT rows where they are the owner
create policy "Users can insert own day_logs" on public.day_logs 
for insert with check (auth.uid() = user_id);

-- 2. Day Logs: Allow users to SELECT rows they own
create policy "Users can select own day_logs" on public.day_logs 
for select using (auth.uid() = user_id);

-- 3. Day Logs: Allow users to UPDATE rows they own
create policy "Users can update own day_logs" on public.day_logs 
for update using (auth.uid() = user_id);

-- Allow authenticated users to view/edit profiles
alter table public.profiles enable row level security;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can select own profile" on public.profiles for select using (auth.uid() = id);
