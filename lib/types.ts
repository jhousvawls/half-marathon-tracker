export type WorkoutType = 'Run' | 'OTF' | 'Walk' | 'Mobility' | 'Rest' | 'CrossTrain' | 'Strength' | 'Kettlebell';
export type RunType = 'Easy' | 'Quality' | 'Long' | 'Recovery';
export type ReadinessColor = 'Green' | 'Yellow' | 'Red';

export interface DayLog {
    id: string;
    date: string;
    planned_workout_type: WorkoutType;
    planned_target: string; // "30 min" or "3 miles"
    completed_run: boolean;
    completed_otf: boolean;
    completed_walk: boolean;
    completed_mobility: boolean;
    readiness_color: ReadinessColor | null;
    notes: string | null;

    // OTF Specifics
    otf_calories_burned?: number | null;
    otf_splat_points?: number | null;
}

export interface PlanWeek {
    id: string;
    week_number: number;
    start_date: string;
    easy_run_target: string;
    quality_run_target: string;
    long_run_target: string;
    notes: string;
}

export interface WeekCheckIn {
    id: string;
    week_start_date: string;
    weight_lbs: number;
    waist_in: number;
    long_run_miles: number;
    runs_completed: number;
    otf_completed: number;
    eating_out_count: number;
    energy: number;
}

export interface KBWorkout {
    id: string;
    name: string;
    focus: string;
    level: string;
    blocks: any[]; // JSONB structure
    contraindications?: string;
}

export interface KBSession {
    id: string;
    user_id: string;
    date: string;
    workout_id?: string;
    workout_name?: string;
    duration_min?: number;
    completed: boolean;
    notes?: string;
}

export interface TodayPlan {
    dayLabel: string; // "Monday", "Tuesday", etc.
    workoutLabel: string; // "Easy Run", "Walk + Mobility/Core"
    target: string | null; // "30 min", null if fixed
    guidance: string; // Readiness guidance text
    weekNumber?: number; // 1, 2, etc.
    isRestDay: boolean;

    // New: Specific KB Workout for the day
    kbWorkout?: KBWorkout;
}

export interface DaySchedule extends TodayPlan {
    date: string; // "2024-01-05"
    isToday: boolean;
    isPast: boolean;
    log?: DayLog; // The actual DB log if exists
}
