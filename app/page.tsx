'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ReadinessSelector } from '@/app/components/ReadinessSelector';
import { createClient } from '@/lib/supabase';
import { DayLog, ReadinessColor } from '@/lib/types';
import { getReadinessAdjustment, cn } from '@/lib/utils';
import { CheckCircle, Circle, Flame, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const supabase = createClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    const [loading, setLoading] = useState(true);
    const [log, setLog] = useState<DayLog | null>(null);

    useEffect(() => {
        async function fetchDay() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch today's log
            const { data, error } = await supabase
                .from('day_logs')
                .select('*')
                .eq('date', today)
                .eq('user_id', user.id)
                .single();

            if (data) {
                setLog(data);
            } else {
                // Create default log if missing
                const newLog = {
                    user_id: user.id,
                    date: today,
                    planned_workout_type: 'Run',
                    planned_target: '30 min Easy',
                    completed_run: false,
                    readiness_color: 'Green'
                };
                const { data: inserted } = await supabase.from('day_logs').insert(newLog).select().single();
                if (inserted) setLog(inserted);
            }
            setLoading(false);
        }
        fetchDay();
    }, [router, supabase, today]);

    const updateLog = async (updates: Partial<DayLog>) => {
        if (!log) return;
        // Optimistic update
        setLog({ ...log, ...updates });
        // DB update
        await supabase.from('day_logs').update(updates).eq('id', log.id);
    };


    if (loading) return <div className="p-6">Loading...</div>;

    if (!log) return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">Could not load today's plan. This usually means the database security policies need to be updated.</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
                Retry
            </button>
        </div>
    );


    const adjustedTarget = getReadinessAdjustment(log.readiness_color as ReadinessColor, log.planned_target);

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{format(new Date(), 'EEEE, MMM do')}</h1>
                    <p className="text-gray-500">Focus: Consistency</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">
                        <Flame size={18} />
                        <span>0</span>
                    </div>
                    <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}>
                        <LogOut className="text-gray-400" />
                    </button>
                </div>
            </header>

            {/* TODAY' CARD */}
            <section className={cn(
                "bg-blue-50 border-l-4 p-5 rounded-r-xl shadow-sm transition-all",
                log.readiness_color === 'Green' ? 'border-blue-500' :
                    log.readiness_color === 'Yellow' ? 'border-yellow-500 bg-yellow-50/50' : 'border-red-500 bg-red-50/50'
            )}>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Today's Plan</h2>
                <div className="text-3xl font-extrabold text-gray-800 mb-2">{log.planned_workout_type}</div>
                <div className="text-lg font-medium text-blue-800 mb-4">
                    {adjustedTarget}
                </div>

                <div className="bg-white/60 p-3 rounded-lg">
                    <label className="text-xs font-semibold text-gray-600">Athlytic Readiness</label>
                    <ReadinessSelector
                        value={log.readiness_color as ReadinessColor}
                        onChange={(val) => updateLog({ readiness_color: val })}
                    />
                </div>
            </section>

            {/* COMPLETION TOGGLES */}
            <section className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => updateLog({ completed_run: !log.completed_run })}
                    className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", log.completed_run ? "bg-green-100 border-green-500 text-green-800" : "bg-white border-gray-100 text-gray-400")}
                >
                    {log.completed_run ? <CheckCircle size={32} /> : <Circle size={32} />}
                    <span className="font-bold">Run</span>
                </button>
                <button
                    onClick={() => updateLog({ completed_otf: !log.completed_otf })}
                    className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", log.completed_otf ? "bg-orange-100 border-orange-500 text-orange-800" : "bg-white border-gray-100 text-gray-400")}
                >
                    {log.completed_otf ? <CheckCircle size={32} /> : <Circle size={32} />}
                    <span className="font-bold">Orangetheory</span>
                </button>
                <button
                    onClick={() => updateLog({ completed_walk: !log.completed_walk })}
                    className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", log.completed_walk ? "bg-blue-100 border-blue-500 text-blue-800" : "bg-white border-gray-100 text-gray-400")}
                >
                    {log.completed_walk ? <CheckCircle size={32} /> : <Circle size={32} />}
                    <span className="font-bold">Walk</span>
                </button>
                <button
                    onClick={() => updateLog({ completed_mobility: !log.completed_mobility })}
                    className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", log.completed_mobility ? "bg-purple-100 border-purple-500 text-purple-800" : "bg-white border-gray-100 text-gray-400")}
                >
                    {log.completed_mobility ? <CheckCircle size={32} /> : <Circle size={32} />}
                    <span className="font-bold">Mobility</span>
                </button>
            </section>
        </div>
    );
}
