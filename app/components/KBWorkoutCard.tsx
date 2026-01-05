'use client';

import { KBWorkout } from '@/lib/types';
import { createClient } from '@/lib/supabase';
import { useState } from 'react';
import { Check, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KBWorkoutCardProps {
    workout: KBWorkout;
    date: string; // YYYY-MM-DD
    onComplete?: () => void;
    isCompleted?: boolean;
}

export function KBWorkoutCard({ workout, date, onComplete, isCompleted = false }: KBWorkoutCardProps) {
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(isCompleted);

    const handleComplete = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Log to kb_sessions
            await supabase.from('kb_sessions').insert({
                user_id: user.id,
                date: date,
                workout_id: workout.id,
                workout_name: workout.name,
                duration_min: 30, // Default estimate
                completed: true
            });

            // Also update day_logs for general compliance if needed
            // But we can trigger that via parent or separate call.
            // Ideally we also set 'completed_mobility' or a new 'completed_kettlebell' flag in day_logs?
            // Existing schema uses 'completed_mobility' as a catch all for strength often, 
            // but let's stick to just the KB session log for now, 
            // OR update the parent day_log. Let's assume parent handles day_log updates via callback.
        }

        setCompleted(true);
        setLoading(false);
        if (onComplete) onComplete();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Dumbbell size={18} className="text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-300">{workout.focus}</span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight">{workout.name}</h3>
                </div>
                {completed && (
                    <div className="bg-green-500 text-white p-1 rounded-full">
                        <Check size={16} strokeWidth={3} />
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                {workout.blocks.map((block: any, i: number) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                            Block {i + 1}: {block.type} {block.rounds ? `(${block.rounds} rounds)` : ''} {block.duration ? `(${block.duration})` : ''}
                        </div>
                        <ul className="space-y-2">
                            {block.exercises.map((ex: any, j: number) => (
                                <li key={j} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-800">{ex.name}</span>
                                    <div className="text-right">
                                        <div className="text-slate-600">{ex.reps}</div>
                                        {ex.weight && <div className="text-xs text-slate-400">{ex.weight}</div>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-4 pt-0">
                {!completed ? (
                    <button
                        onClick={handleComplete}
                        disabled={loading}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                    >
                        {loading ? "Saving..." : "Mark Workout Complete"}
                    </button>
                ) : (
                    <div className="text-center text-sm text-green-600 font-bold py-2 bg-green-50 rounded-lg">
                        Workout Completed
                    </div>
                )}
            </div>
        </div>
    );
}
