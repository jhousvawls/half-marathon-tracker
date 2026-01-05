import { DayLog, PlanWeek, WeekCheckIn } from "./types";
import { addDays, format, startOfWeek } from "date-fns";

// --- Mock Plan Data ---
export const MOCK_PLAN_WEEKS: PlanWeek[] = Array.from({ length: 14 }).map((_, i) => ({
    id: `week-${i + 1}`,
    week_number: i + 1,
    start_date: format(addDays(new Date(), i * 7), 'yyyy-MM-dd'), // dynamic start for demo
    easy_run_target: "30-40 min",
    quality_run_target: i % 2 === 0 ? "Intervals: 4x400m" : "Tempo: 20 min",
    long_run_target: `${2.5 + (i * 0.5 < 12 ? i * 0.5 : 10)} miles`, // simplistic ramp
    notes: "Focus on consistency."
}));

// --- Mock Daily Logs ---
export const MOCK_LOGS: Record<string, DayLog> = {
    [format(new Date(), 'yyyy-MM-dd')]: {
        id: 'today',
        date: format(new Date(), 'yyyy-MM-dd'),
        planned_workout_type: 'Run',
        planned_target: '3 miles (Easy)',
        completed_run: false,
        completed_otf: false,
        completed_walk: false,
        completed_mobility: false,
        readiness_color: 'Green',
        notes: null
    }
};

// --- Mock Check-ins ---
export const MOCK_CHECKINS: WeekCheckIn[] = [
    {
        id: 'wk1',
        week_start_date: '2023-12-01',
        weight_lbs: 207,
        waist_in: 41.5,
        long_run_miles: 2.5,
        runs_completed: 3,
        otf_completed: 2,
        eating_out_count: 5,
        energy: 7
    },
    {
        id: 'wk2',
        week_start_date: '2023-12-08',
        weight_lbs: 205,
        waist_in: 41.0,
        long_run_miles: 3.0,
        runs_completed: 3,
        otf_completed: 2,
        eating_out_count: 4,
        energy: 8
    }
];
