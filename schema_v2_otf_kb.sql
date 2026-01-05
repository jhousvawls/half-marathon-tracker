-- Add OTF columns to day_logs
ALTER TABLE day_logs 
ADD COLUMN IF NOT EXISTS otf_calories_burned INTEGER,
ADD COLUMN IF NOT EXISTS otf_splat_points INTEGER;

-- Create Kettlebell Workouts table
CREATE TABLE IF NOT EXISTS kb_workouts (
    id TEXT PRIMARY KEY, -- e.g. 'core-a', 'upper-b'
    name TEXT NOT NULL,
    focus TEXT NOT NULL, -- 'Core', 'Upper Body', 'Hinge', etc.
    level TEXT NOT NULL, -- 'Beginner', 'Intermediate'
    blocks JSONB NOT NULL, -- Array of exercise blocks
    contraindications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on kb_workouts
ALTER TABLE kb_workouts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read workouts (they are system defined)
CREATE POLICY "Everyone can read kb_workouts" ON kb_workouts
    FOR SELECT USING (true);


-- Create Kettlebell Sessions table
CREATE TABLE IF NOT EXISTS kb_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    workout_id TEXT REFERENCES kb_workouts(id),
    workout_name TEXT, -- Denormalized in case workout def changes
    duration_min INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on kb_sessions
ALTER TABLE kb_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for kb_sessions
CREATE POLICY "Users can view their own kb_sessions" ON kb_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kb_sessions" ON kb_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kb_sessions" ON kb_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Seed Data for KB Workouts
INSERT INTO kb_workouts (id, name, focus, level, blocks) VALUES
('kb-core-a', 'KB Core A: Stability', 'Core Stability', 'Beginner', 
 '[
    {"type": "circuit", "rounds": 3, "exercises": [
        {"name": "KB Suitcase Carry", "reps": "30 sec/side", "weight": "16kg"},
        {"name": "KB Deadbug (holding bell)", "reps": "10 reps", "weight": "8kg"},
        {"name": "Plank w/ KB Drag", "reps": "10 reps total", "weight": "16kg"}
    ]}
 ]'::jsonb),

('kb-core-b', 'KB Core B: Rotation', 'Obliques/Rotation', 'Beginner', 
 '[
    {"type": "circuit", "rounds": 3, "exercises": [
        {"name": "KB Russian Twist", "reps": "20 total", "weight": "8kg"},
        {"name": "Half-Kneeling Woodchop", "reps": "10/side", "weight": "8kg"},
        {"name": "Side Plank", "reps": "30 sec/side", "weight": "Bodyweight"}
    ]}
 ]'::jsonb),

('kb-core-c', 'KB Core C: Finisher', 'Core Endurance', 'All Levels', 
 '[
    {"type": "EMOM", "duration": "12 min", "exercises": [
        {"minute": 1, "name": "KB Swings", "reps": "15 reps", "weight": "16kg"},
        {"minute": 2, "name": "Goblet Squat Hold", "reps": "30 sec", "weight": "16kg"},
        {"minute": 3, "name": "Rest"}
    ]}
 ]'::jsonb),

('kb-upper-a', 'KB Upper Body A', 'Upper Body Push/Pull', 'Beginner', 
 '[
     {"type": "straight", "exercises": [
        {"name": "KB Goblet Press", "sets": 3, "reps": "8-10", "weight": "8kg"},
        {"name": "KB Gorilla Row", "sets": 3, "reps": "10/side", "weight": "16kg"},
        {"name": "KB Halo", "sets": 3, "reps": "10/direction", "weight": "8kg"}
     ]}
 ]'::jsonb),
 
('kb-hinge-a', 'KB Hinge & Power', 'Posterior Chain', 'Intermediate', 
 '[
     {"type": "circuit", "rounds": 4, "exercises": [
        {"name": "KB Deadlift", "reps": "10 reps", "weight": "16kg"},
        {"name": "KB Swing", "reps": "15 reps", "weight": "16kg"},
        {"name": "Glute Bridge", "reps": "15 reps", "weight": "Bodyweight"}
     ]}
 ]'::jsonb),
 
('kb-mobility-a', 'KB Mobility Flow', 'Mobility/Recovery', 'All Levels', 
 '[
     {"type": "flow", "exercises": [
        {"name": "Prying Goblet Squat", "duration": "2 min", "weight": "8kg"},
        {"name": "KB Armbar", "reps": "5/side", "weight": "8kg"},
        {"name": "90/90 Stretch", "duration": "2 min", "weight": "Bodyweight"}
     ]}
 ]'::jsonb)
 ON CONFLICT (id) DO NOTHING;
