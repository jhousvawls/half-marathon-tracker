import { getTodaysPlan } from './planning';
import { PlanWeek, DayLog } from './types';
import { parseISO, addDays } from 'date-fns';

// Simple test runner helper
function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ ${message}`);
    }
}

// Mocks
const mockWeek: PlanWeek = {
    id: "uuid-123",
    week_number: 1,
    start_date: "2026-01-05", // A Monday
    easy_run_target: "30 min easy",
    quality_run_target: "3 miles tempo",
    long_run_target: "6 miles",
    notes: "Build week"
};

const mockLogs: DayLog[] = []; // Empty history

console.log("--- Testing getTodaysPlan ---");

// Test 1: Monday (2026-01-05) -> Walk + Mobility
let result = getTodaysPlan(parseISO("2026-01-05"), [mockWeek], mockLogs);
assert(result.workoutLabel === "Walk + Mobility/Core", `Monday should be Walk + Mobility, got ${result.workoutLabel}`);

// Test 2: Tuesday -> OTF
result = getTodaysPlan(parseISO("2026-01-06"), [mockWeek], mockLogs);
assert(result.workoutLabel === "Orangetheory", `Tuesday should be OTF, got ${result.workoutLabel}`);

// Test 3: Wednesday -> Easy Run
result = getTodaysPlan(parseISO("2026-01-07"), [mockWeek], mockLogs);
assert(result.workoutLabel === "Easy Run", `Wednesday should be Easy Run`);
assert(result.target === "30 min easy", `Wednesday target should match plan week`);

// Test 4: Thursday -> Strength/Core (No history)
result = getTodaysPlan(parseISO("2026-01-08"), [mockWeek], mockLogs);
assert(result.workoutLabel === "Strength/Core", `Thursday default should be Strength/Core`);

// Test 5: Friday -> OTF
result = getTodaysPlan(parseISO("2026-01-09"), [mockWeek], mockLogs);
assert(result.workoutLabel === "Orangetheory", `Friday should be OTF`);

// Test 6: Saturday -> Quality Run
result = getTodaysPlan(parseISO("2026-01-10"), [mockWeek], mockLogs);
assert(result.workoutLabel === "Quality Run", `Saturday should be Quality Run`);
assert(result.target === "3 miles tempo", `Saturday target match`);

// Test 7: Sunday -> Long Run
result = getTodaysPlan(parseISO("2026-01-11"), [mockWeek], mockLogs);
assert(result.workoutLabel === "Long Run", `Sunday should be Long Run`);
assert(result.target === "6 miles", `Sunday target match`);

// Test 8: Monday (Week 2, missing plan) -> No Plan
result = getTodaysPlan(parseISO("2026-01-12"), [mockWeek], mockLogs);
assert(result.workoutLabel === "Rest / No Plan", `Next week w/o plan entry should be No Plan`);

// Test 9: Thursday Logic - With Recent Strength
const thursday = parseISO("2026-01-08");
const strengthLog: DayLog = {
    id: "log-1",
    date: "2026-01-06", // Tuesday
    planned_workout_type: "Strength", // As per our checkRecentStrength logic
    completed_mobility: true, // Marker for completion
    planned_target: "", completed_run: false, completed_otf: false, completed_walk: false, readiness_color: null, notes: "Did strength core"
};
result = getTodaysPlan(thursday, [mockWeek], [strengthLog]);
assert(result.workoutLabel === "Walk", `Thursday should be Walk if strength done on Tuesday (within 5 days)`);

console.log("--- All Tests Passed ---");
