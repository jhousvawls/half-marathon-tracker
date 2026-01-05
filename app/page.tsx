'use client';

import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ReadinessSelector } from '@/app/components/ReadinessSelector';
import { WeeklySchedule } from '@/app/components/WeeklySchedule';
import { OTFTracker } from '@/app/components/OTFTracker';
import { KBWorkoutCard } from '@/app/components/KBWorkoutCard';
import { createClient } from '@/lib/supabase';
import { DayLog, PlanWeek, ReadinessColor, TodayPlan, KBWorkout, DaySchedule } from '@/lib/types';
import { getTodaysPlan, getWeekSchedule } from '@/lib/planning';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const supabase = createClient();
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const [loading, setLoading] = useState(true);
    const [log, setLog] = useState<DayLog | null>(null);
    const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
    const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
    const [kbCompleted, setKbCompleted] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Fetch Plan Weeks
            const { data: plans } = await supabase
                .from('plan_weeks')
                .select('*')
                .eq('user_id', user.id);

            // 2. Fetch Recent Logs
            const lookbackDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
            const { data: logs } = await supabase
                .from('day_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', lookbackDate);

            // Fetch KB Session for today to verify completion status
            const { data: kbSamples } = await supabase
                .from('kb_sessions')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', todayStr);

            if (kbSamples && kbSamples.length > 0) {
                setKbCompleted(true);
            }

            const allLogs = logs || [];
            const planWeeks = plans || [];

            // 3. Find/Create Today's Log
            let currentLog = allLogs.find(l => l.date === todayStr);

            // 4. Calculate Plan
            const calculatedPlan = getTodaysPlan(new Date(), planWeeks, allLogs, currentLog?.readiness_color || undefined);
            setTodayPlan(calculatedPlan);

            // 5. Calculate Full Week
            const weekSchedule = getWeekSchedule(new Date(), planWeeks, allLogs);
            setWeeklySchedule(weekSchedule);

            if (currentLog) {
                setLog(currentLog);
            } else {
                const newLogPayload = {
                    user_id: user.id,
                    date: todayStr,
                    planned_workout_type: calculatedPlan.workoutLabel,
                    planned_target: calculatedPlan.target || '',
                    completed_run: false,
                    readiness_color: 'Green'
                };

                const { data: inserted } = await supabase.from('day_logs').insert(newLogPayload).select().single();
                if (inserted) {
                    setLog(inserted);
                }
            }
            setLoading(false);
        }
        fetchData();
    }, [router, supabase, todayStr]);

    const updateLog = async (updates: Partial<DayLog>) => {
        if (!log) return;

        // Optimistic update
        const updatedLog = { ...log, ...updates };
        setLog(updatedLog);

        // Update weekly schedule optimistic
        if (weeklySchedule.length > 0) {
            setWeeklySchedule(prev => prev.map(day => {
                if (day.isToday) {
                    return { ...day, log: { ...day.log!, ...updates } as DayLog };
                }
                return day;
            }));
        }

        if (updates.readiness_color && todayPlan) {
            window.location.reload();
        }

        await supabase.from('day_logs').update(updates).eq('id', log.id);
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!log || !todayPlan) return <div className="p-6">Error loading plan.</div>;

    const isOTFDay = todayPlan.workoutLabel.includes('Orangetheory');
    const isKBDay = !!todayPlan.kbWorkout;

    return (
        <div className="p-6 space-y-8 pb-24">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{format(new Date(), 'EEEE, MMM do')}</h1>
                    <p className="text-gray-500">
                        {todayPlan.weekNumber ? `Week ${todayPlan.weekNumber} of Plan` : "No Active Plan"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>
                        <LogOut className="text-gray-400" />
                    </button>
                </div>
            </header>

            {/* TODAY'S PLAN CARD */}
            <section className={cn(
                "bg-blue-50 border-l-4 p-5 rounded-r-xl shadow-sm transition-all relative overflow-hidden",
                log.readiness_color === 'Green' ? 'border-blue-500' :
                    log.readiness_color === 'Yellow' ? 'border-yellow-500 bg-yellow-50/50' : 'border-red-500 bg-red-50/50'
            )}>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Today's Plan</h2>
                        <div className="text-3xl font-extrabold text-gray-800 mb-2">{todayPlan.workoutLabel}</div>

                        {todayPlan.target ? (
                            <div className="text-lg font-medium text-blue-800 mb-4">
                                {todayPlan.target}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 mb-4 italic">
                                {todayPlan.isRestDay ? "Rest & Recover" : "Follow standard routine"}
                            </div>
                        )}

                        {todayPlan.workoutLabel === "Rest / No Plan" && (
                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (!user) return;

                                    const lastMonday = subDays(new Date(), new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                                    const startStr = format(lastMonday, 'yyyy-MM-dd');

                                    await supabase.from('plan_weeks').insert({
                                        user_id: user.id,
                                        week_number: 1,
                                        start_date: startStr,
                                        easy_run_target: '30 min easy',
                                        quality_run_target: 'Run/Walk Intervals', // Updated for beginner
                                        long_run_target: '3.0 miles', // Conservative start
                                        notes: 'Intro week'
                                    });
                                    window.location.reload();
                                }}
                                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow transition-colors"
                            >
                                Start Sample Plan (Week 1)
                            </button>
                        )}
                    </div>
                </div>

                {/* Readiness Guidance Box */}
                <div className="bg-white/60 p-3 rounded-lg border border-gray-100 mt-4 relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase">Readiness Assessment</label>
                        <ReadinessSelector
                            value={log.readiness_color as ReadinessColor}
                            onChange={(val) => {
                                updateLog({ readiness_color: val });
                                window.location.reload();
                            }}
                        />
                    </div>
                    <p className="text-sm text-gray-700 italic">
                        &quot;{todayPlan.guidance}&quot;
                    </p>
                </div>
            </section>

            {/* MAIN ACTION AREA - CONTEXTUAL */}
            <section className="space-y-4">
                {isOTFDay && (
                    <OTFTracker log={log} onUpdate={updateLog} />
                )}

                {isKBDay && todayPlan.kbWorkout && (
                    <KBWorkoutCard
                        workout={todayPlan.kbWorkout}
                        date={todayStr}
                        isCompleted={kbCompleted}
                        onComplete={() => {
                            setKbCompleted(true);
                            // Also mark mobility/strength as done in day_log for broader tracking
                            updateLog({ completed_mobility: true });
                        }}
                    />
                )}
            </section>

            {/* QUICK LOGGING GRID (Fallback/Add-on) */}
            <section>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Log</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => updateLog({ completed_run: !log.completed_run })}
                        className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", log.completed_run ? "bg-green-100 border-green-500 text-green-800" : "bg-white border-gray-100 text-gray-400")}
                    >
                        {log.completed_run ? <CheckCircle size={32} /> : <Circle size={32} />}
                        <span className="font-bold">Run</span>
                    </button>
                    {!isOTFDay && (
                        <button
                            onClick={() => updateLog({ completed_otf: !log.completed_otf })}
                            className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", log.completed_otf ? "bg-orange-100 border-orange-500 text-orange-800" : "bg-white border-gray-100 text-gray-400")}
                        >
                            {log.completed_otf ? <CheckCircle size={32} /> : <Circle size={32} />}
                            <span className="font-bold">OTF (Extra)</span>
                        </button>
                    )}
                    <button
                        onClick={() => updateLog({ completed_walk: !log.completed_walk })}
                        className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", log.completed_walk ? "bg-blue-100 border-blue-500 text-blue-800" : "bg-white border-gray-100 text-gray-400")}
                    >
                        {log.completed_walk ? <CheckCircle size={32} /> : <Circle size={32} />}
                        <span className="font-bold">Walk</span>
                    </button>
                    {!isKBDay && (
                        <button
                            onClick={() => updateLog({ completed_mobility: !log.completed_mobility })}
                            className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", log.completed_mobility ? "bg-purple-100 border-purple-500 text-purple-800" : "bg-white border-gray-100 text-gray-400")}
                        >
                            {log.completed_mobility ? <CheckCircle size={32} /> : <Circle size={32} />}
                            <span className="font-bold">Mobility/Other</span>
                        </button>
                    )}
                </div>
            </section>

            {/* WEEKLY SCHEDULE */}
            <section>
                <WeeklySchedule schedule={weeklySchedule} />
            </section>
        </div>
    );
}
