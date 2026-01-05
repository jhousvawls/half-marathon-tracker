import { startOfDay, addDays, differenceInCalendarDays, parseISO, isSameDay, format, subDays } from 'date-fns';
import { PlanWeek, DayLog, TodayPlan, ReadinessColor, KBWorkout, DaySchedule } from './types';

// Hardcoded definitions matching DB seeds for synchronous access
// Ideally we'd fetch these, but for V1 performance/simplicity we mirror them here.
export const KB_WORKOUTS: Record<string, KBWorkout> = {
    'kb-core-a': { id: 'kb-core-a', name: 'KB Core A: Stability', focus: 'Core Stability', level: 'Beginner', blocks: [] },
    'kb-core-b': { id: 'kb-core-b', name: 'KB Core B: Rotation', focus: 'Obliques/Rotation', level: 'Beginner', blocks: [] },
    'kb-core-c': { id: 'kb-core-c', name: 'KB Core C: Finisher', focus: 'Core Endurance', level: 'All Levels', blocks: [] },
    'kb-upper-a': { id: 'kb-upper-a', name: 'KB Upper Body A', focus: 'Upper Body Push/Pull', level: 'Beginner', blocks: [] },
    'kb-hinge-a': { id: 'kb-hinge-a', name: 'KB Hinge & Power', focus: 'Posterior Chain', level: 'Intermediate', blocks: [] },
    'kb-mobility-a': { id: 'kb-mobility-a', name: 'KB Mobility Flow', focus: 'Mobility/Recovery', level: 'All Levels', blocks: [] },
};

export function getTodaysPlan(
    today: Date,
    planWeeks: PlanWeek[],
    dayLogs: DayLog[],
    yesterdayReadiness?: ReadinessColor
): TodayPlan {
    const todayStr = format(today, 'yyyy-MM-dd');
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayLabel = dayLabels[dayOfWeek];

    // 1. Determine active plan week
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
    let target: string | null = null;
    let isRestDay = false;
    let kbWorkout: KBWorkout | undefined;

    // Rotation Logic based on Week Number
    const isOddWeek = (activeWeek.week_number % 2) !== 0;

    switch (dayOfWeek) {
        case 1: // Monday: KB Focus
            workoutLabel = "Kettlebell Strength";
            // Odd weeks: Stability Core (A), Even weeks: Upper Body (A)
            kbWorkout = isOddWeek ? KB_WORKOUTS['kb-core-a'] : KB_WORKOUTS['kb-upper-a'];
            target = `${kbWorkout?.name} (30 min)`;
            break;

        case 2: // Tuesday: OTF
            workoutLabel = "Orangetheory";
            target = "60 min class (Power/Endurance)";
            break;

        case 3: // Wednesday: Easy Run + Optional KB Finisher
            workoutLabel = "Easy Run";
            target = activeWeek.easy_run_target;
            // Optionally append a finisher instruction
            kbWorkout = KB_WORKOUTS['kb-core-c'];
            target += " + Optional 12-min Core Finisher";
            break;

        case 4: // Thursday: KB Focus (or Recovery Walk)
            // Logic: Strength/Core (or Walk if user has completed strength/core in last 5 days? 
            // Actually, for this NEW plan, Thursday is a dedicated KB day unless fatigued.)
            // We use readiness or previous load to decide.
            // Let's stick to the prompt: "Kettlebell workouts happen on Monday/Thursday... allows for recovery".
            // But we keep the "Thursday Recovery" safeguard if needed? 
            // Prompt says: "Thursday defaults to 'Strength/Core' unless...". 
            // In the new plan, Thursday IS the second KB day.

            // Odd weeks: Rotation (B), Even weeks: Hinge (A)
            kbWorkout = isOddWeek ? KB_WORKOUTS['kb-core-b'] : KB_WORKOUTS['kb-hinge-a'];
            workoutLabel = "Kettlebell Strength";
            target = `${kbWorkout?.name} (30 min)`;

            // Check readiness override? If Red -> Walk. Handled by generic guidance below.
            break;

        case 5: // Friday: OTF
            workoutLabel = "Orangetheory";
            target = "60 min class (Strength/ESP)";
            break;

        case 6: // Saturday: Quality Run
            workoutLabel = "Quality Run";
            target = activeWeek.quality_run_target;
            break;

        case 0: // Sunday: Long Run
            workoutLabel = "Long Run";
            target = activeWeek.long_run_target;
            break;

        default:
            workoutLabel = "Rest";
            isRestDay = true;
    }

    // 3. Readiness Guidance
    const todaysLog = dayLogs.find(l => l.date === todayStr);
    const readiness = yesterdayReadiness || todaysLog?.readiness_color || 'Green';

    let guidance = "Go as planned.";

    if (readiness === 'Yellow') {
        guidance = "Reduce intensity or duration ~20%. Use lighter bell.";
    } else if (readiness === 'Red') {
        guidance = "Replace with 30–45 min walk + Mobility Flow.";
        // If Red, we might technically switch the workoutLabel too, but guidance is safer.
        if (workoutLabel.includes('Kettlebell') || workoutLabel.includes('Orangetheory')) {
            // Maybe swap the KB workout to Mobility A?
            kbWorkout = KB_WORKOUTS['kb-mobility-a'];
            // But let's leave label to show what was missed/changed in guidance.
        }
    }

    return {
        dayLabel: currentDayLabel,
        workoutLabel,
        target,
        guidance: todaysLog?.readiness_color ? guidance : "Assess readiness first. Green: Go, Yellow: -20%, Red: Walk.",
        weekNumber: activeWeek.week_number,
        isRestDay,
        kbWorkout
    };
}

export function getWeekSchedule(
    today: Date,
    planWeeks: PlanWeek[],
    dayLogs: DayLog[]
): DaySchedule[] {
    const currentDay = today.getDay(); // 0-6
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = subDays(today, daysSinceMonday);

    const schedule: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
        const date = addDays(monday, i);
        const dateStr = format(date, 'yyyy-MM-dd');

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
    const lookbackStart = subDays(today, 5);
    const lookbackEnd = subDays(today, 1);

    const recentLogs = dayLogs.filter(l => {
        const d = parseISO(l.date);
        return d >= lookbackStart && d <= lookbackEnd;
    });

    return recentLogs.some(l => {
        const isStrengthType = l.planned_workout_type === 'Strength' || l.planned_workout_type === 'Kettlebell' || l.planned_workout_type === 'Mobility';
        const isCompleted = l.completed_mobility || (l.notes && l.notes.toLowerCase().includes('strength'));
        return isStrengthType && isCompleted;
    });
}
