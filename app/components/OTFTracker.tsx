'use client';

import { useState } from 'react';
import { Flame, Activity, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { DayLog } from '@/lib/types';

interface OTFTrackerProps {
    log: DayLog;
    onUpdate: (updates: Partial<DayLog>) => void;
}

export function OTFTracker({ log, onUpdate }: OTFTrackerProps) {
    const [calories, setCalories] = useState(log.otf_calories_burned?.toString() || '');
    const [splats, setSplats] = useState(log.otf_splat_points?.toString() || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const cal = parseInt(calories);
        const splat = parseInt(splats);

        if (isNaN(cal) || isNaN(splat)) {
            setSaving(false);
            return;
        }

        const supabase = createClient();
        const updates = {
            otf_calories_burned: cal,
            otf_splat_points: splat,
            completed_otf: true // Auto-complete if stats entered
        };

        await supabase.from('day_logs').update(updates).eq('id', log.id);
        onUpdate(updates);

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
                <Flame className="text-orange-500" size={20} />
                <h3 className="font-bold text-orange-900">OTF Performance</h3>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-orange-700 uppercase mb-1">Calories</label>
                    <input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        placeholder="e.g. 600"
                        className="w-full p-2 rounded border border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-orange-700 uppercase mb-1">Splats</label>
                    <input
                        type="number"
                        value={splats}
                        onChange={(e) => setSplats(e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full p-2 rounded border border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving || (!calories && !splats)}
                className={cn(
                    "w-full mt-3 font-bold py-2 rounded-lg transition-all flex justify-center items-center gap-2",
                    saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
                )}
            >
                {saved ? <><Check size={16} /> Saved</> : saving ? "Saving..." : "Log / Complete"}
            </button>
        </div>
    );
}
