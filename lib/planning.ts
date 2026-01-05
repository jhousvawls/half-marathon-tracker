import { startOfDay, addDays, differenceInCalendarDays, parseISO, isSameDay, format, subDays } from 'date-fns';
import { PlanWeek, DayLog, TodayPlan, ReadinessColor } from './types';

export function getTodaysPlan(
    today: Date,
    planWeeks: PlanWeek[],
    dayLogs: DayLog[],
    yesterdayReadiness?: ReadinessColor // Optional override if we want to pass a specific readiness state
): TodayPlan {
    const todayStr = format(today, 'yyyy-MM-dd');
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayLabel = dayLabels[dayOfWeek];

    // 1. Determine active plan week
    // We look for a week where today is >= start_date and today < start_date + 7 days
    const activeWeek = planWeeks.find(p => {
        const start = parseISO(p.start_date);
        const diff = differenceInCalendarDays(today, start);
        return diff >= 0 && diff < 7;
    });

    if (!activeWeek) {
        return {
            dayLabel: currentDayLabel,
            workoutLabel: "Rest / No Plan",
            target: "No active plan found for today.",
            guidance: "Consider setting up a new training block.",
            isRestDay: true,
        };
    }

    // 2. Logic Mappings
    let workoutLabel = "Rest";
    let target = null;
    let isRestDay = false;

    // Fixed Structure: 
    // Mon(1): Walk + Mobility/Core
    // Tue(2): Orangetheory
    // Wed(3): Easy Run -> easy_run_target
    // Thu(4): Strength/Core OR Walk
    // Fri(5): Orangetheory
    // Sat(6): Quality Run -> quality_run_target
    // Sun(0): Long Run -> long_run_target

    switch (dayOfWeek) {
        case 1: // Monday
            workoutLabel = "Walk + Mobility/Core";
            target = "30-45 min walk + 8-10 min mobility";
            break;
        case 2: // Tuesday
            workoutLabel = "Orangetheory";
            target = "60 min class";
            break;
        case 3: // Wednesday
            workoutLabel = "Easy Run";
            target = activeWeek.easy_run_target;
            break;
        case 4: // Thursday
            // Logic: Strength/Core (or Walk if user has completed strength/core in last 5 days)
            // Lookback: Today-5 to Today-1
            const hasRecentStrength = checkRecentStrength(today, dayLogs);
            if (hasRecentStrength) {
                workoutLabel = "Walk";
                target = "30-45 min recovery walk";
            } else {
                workoutLabel = "Strength/Core";
                target = "45 min functional strength";
            }
            break;
        case 5: // Friday
            workoutLabel = "Orangetheory";
            target = "60 min class";
            break;
        case 6: // Saturday
            workoutLabel = "Quality Run";
            target = activeWeek.quality_run_target;
            break;
        case 0: // Sunday
            workoutLabel = "Long Run";
            target = activeWeek.long_run_target;
            break;
        default:
            workoutLabel = "Rest";
            isRestDay = true;
    }

    // 3. Readiness Guidance
    // We check the *most recent* day log that has a readiness color, OR we might assume the UI passes today's readiness.
    // The prompt says "Readiness (Green/Yellow/Red) affects execution guidance".
    // We'll look for *today's* log entry to see if readiness is already set, or just return generic guidance logic.
    // Ideally, the dashboard passes the *current* readiness status (if logged).
    // If not logged for today, we can't give specific guidance yet, but we can provide the *rules*.
    // However, the function signature didn't strictly require readiness input, so I'll check dayLogs for *today*.

    const todaysLog = dayLogs.find(l => l.date === todayStr);
    const readiness = yesterdayReadiness || todaysLog?.readiness_color || 'Green'; // Default to Green if unknown?
    // Actually, distinct from "Unknown". If unknown, maybe "Assess readiness".
    // But keeping it simple as requested:

    let guidance = "Go as planned.";

    if (readiness === 'Yellow') {
        guidance = "Reduce intensity or duration ~20%.";
    } else if (readiness === 'Red') {
        guidance = "Replace with 30–45 min walk + 8–10 min mobility/core.";
    }

    // Special case: If the planner ALREADY says "Walk + Mobility/Core" (Monday) or "Walk", 
    // Red readiness just confirms it essentially.

    return {
        dayLabel: currentDayLabel,
        workoutLabel,
        target,
        guidance: todaysLog?.readiness_color ? guidance : "Assess readiness first. Green: Go, Yellow: -20%, Red: Walk.",
        weekNumber: activeWeek.week_number,
        isRestDay
    };
}

export interface DaySchedule extends TodayPlan {
    date: string; // "2024-01-05"
    isToday: boolean;
    isPast: boolean;
    log?: DayLog; // The actual DB log if exists
}

export function getWeekSchedule(
    today: Date,
    planWeeks: PlanWeek[],
    dayLogs: DayLog[]
): DaySchedule[] {
    // 1. Find start of current week (Monday)
    // getDay: 0=Sun, 1=Mon. 
    // If Sun(0), start was 6 days ago. If Mon(1), start was 0 days ago.
    const dayMap = [6, 0, 1, 2, 3, 4, 5]; // Index 0(Sun) -> 6 days ago
    // standard subDays(today, dayMap[today.getDay()]) 
    // Actually date-fns 'startOfWeek' defaults to Sunday. 'startOfWeek(today, { weekStartsOn: 1 })' is better.
    // Let's stick to simple math if we don't want to import more options, but we have date-fns.

    // Let's assume Week starts Monday for this training plan (Mon=Walk, Sun=Long Run).
    const currentDay = today.getDay(); // 0-6
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = subDays(today, daysSinceMonday);

    const schedule: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
        const date = addDays(monday, i);
        const dateStr = format(date, 'yyyy-MM-dd');

        // Use our existing logic
        const plan = getTodaysPlan(date, planWeeks, dayLogs);
        const log = dayLogs.find(l => l.date === dateStr);

        schedule.push({
            ...plan,
            date: dateStr,
            isToday: isSameDay(date, today),
            isPast: date < today && !isSameDay(date, today),
            log
        });
    }

    return schedule;
}

function checkRecentStrength(today: Date, dayLogs: DayLog[]): boolean {
    // Check previous 5 days (not including today)
    // Range: [today - 5, today - 1]
    const lookbackStart = subDays(today, 5);
    const lookbackEnd = subDays(today, 1);

    // Filter logs in range
    const recentLogs = dayLogs.filter(l => {
        const d = parseISO(l.date);
        return d >= lookbackStart && d <= lookbackEnd;
    });

    // Check for "Strength" or "Core" text match OR completed_mobility as proxy?
    // User prompted: "completed strength/core". 
    // Since we don't have a reliable 'completed_strength' col, we'll check:
    // 1. planned_workout_type is 'Strength' or 'Mobility' AND it was marked completed (completed_mobility=true?)
    // 2. OR notes contain "Strength" or "Core"
    // Given constraints, I'll rely on our 'Mobility' type often doubling for 'Strength/Core' or text match.

    return recentLogs.some(l => {
        const isStrengthType = l.planned_workout_type === 'Strength' || l.planned_workout_type === 'Mobility';
        const isCompleted = l.completed_mobility || (l.notes && l.notes.toLowerCase().includes('strength'));
        return isStrengthType && isCompleted;
    });
}
