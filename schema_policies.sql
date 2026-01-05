
-- --- RLS POLICIES (Run this to fix "Loading..." issues) ---

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.day_logs enable row level security;
alter table public.week_checkins enable row level security;
alter table public.plan_weeks enable row level security;

-- Profiles: Users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Day Logs: Users can CRUD their own logs
create policy "Users can view own logs" on public.day_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.day_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own logs" on public.day_logs for update using (auth.uid() = user_id);

-- Week Checkins: Users can CRUD their own checkins
create policy "Users can view own checkins" on public.week_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.week_checkins for insert with check (auth.uid() = user_id);
create policy "Users can update own checkins" on public.week_checkins for update using (auth.uid() = user_id);

-- Plan Weeks: Users can view their own plan
create policy "Users can view own plan" on public.plan_weeks for select using (auth.uid() = user_id);
create policy "Users can insert own plan" on public.plan_weeks for insert with check (auth.uid() = user_id);
