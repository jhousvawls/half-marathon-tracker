export type WorkoutType = 'Run' | 'OTF' | 'Walk' | 'Mobility' | 'Rest' | 'CrossTrain';
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
