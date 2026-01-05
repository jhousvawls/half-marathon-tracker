'use client';
import { createClient } from "@/lib/supabase";
import { PlanWeek } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
// We keep MOCK_PLAN_WEEKS as a fallback source to "seed" the display if DB is empty
import { MOCK_PLAN_WEEKS } from "@/lib/mockData";

export default function Plan() {
    const [weeks, setWeeks] = useState<PlanWeek[]>(MOCK_PLAN_WEEKS);
    const [currentWeekId, setCurrentWeekId] = useState('week-1');
    const supabase = createClient();

    useEffect(() => {
        async function fetchPlan() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('plan_weeks')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('week_number', { ascending: true });

                // If user has a custom plan in DB, use it. Otherwise default to the mock one for V1.
                if (data && data.length > 0) {
                    setWeeks(data);
                    // logic to find current week based on date could go here
                    setCurrentWeekId(data[0].id);
                }
            }
        }
        fetchPlan();
    }, []);

    return (
        <div className="p-6 pb-24">
            <h1 className="text-2xl font-bold mb-6">Half Marathon Plan</h1>

            <div className="space-y-4">
                {weeks.map((week) => {
                    const isCurrent = week.id === currentWeekId || week.week_number === 1; // Simplistic "current" logic
                    const id = week.id || `week-${week.week_number}`; // Fallback ID for mocks

                    return (
                        <div key={id} className={cn(
                            "p-4 rounded-xl border-2 transition-all",
                            isCurrent ? "bg-blue-50 border-blue-500 shadow-md transform scale-102" : "bg-white border-gray-100 opacity-80"
                        )}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={cn("font-bold text-sm uppercase", isCurrent ? "text-blue-700" : "text-gray-400")}>Week {week.week_number}</span>
                                {isCurrent && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Current</span>}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-white p-2 rounded border border-gray-100">
                                    <div className="text-xs text-gray-500">Long</div>
                                    <div className="font-bold text-blue-900">{week.long_run_target}</div>
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-100">
                                    <div className="text-xs text-gray-500">Easy</div>
                                    <div className="font-bold text-gray-700">{week.easy_run_target}</div>
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-100">
                                    <div className="text-xs text-gray-500">Quality</div>
                                    <div className="font-bold text-gray-700">{week.quality_run_target}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
