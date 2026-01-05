'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CheckIn() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        weight: '',
        waist: '',
        longRun: '',
        alcohol: 0,
        eatingOut: 0,
        energy: 5
    });
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const save = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('week_checkins').insert({
                user_id: user.id,
                week_start_date: new Date().toISOString().split('T')[0], // simplistic "today" as start of week
                weight_lbs: parseFloat(formData.weight),
                waist_in: parseFloat(formData.waist),
                long_run_miles: parseFloat(formData.longRun),
                eating_out_count: formData.eatingOut,
                alcohol_drinks: formData.alcohol,
                energy: formData.energy,
            });
            next(); // go to success screen
        } else {
            alert("Please log in first!");
            router.push('/login');
        }
        setSaving(false);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Weekly Check-In</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Morning Weight (lbs)</label>
                            <input
                                type="number"
                                className="w-full text-3xl font-bold p-3 border rounded-lg"
                                placeholder="205.0"
                                value={formData.weight}
                                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Waist (Navel, relaxed)</label>
                            <input
                                type="number"
                                className="w-full text-3xl font-bold p-3 border rounded-lg"
                                placeholder="41.0"
                                value={formData.waist}
                                onChange={e => setFormData({ ...formData, waist: e.target.value })}
                            />
                        </div>
                        <button onClick={next} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2">
                            Next <ChevronRight />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Long Run Distance (miles)</label>
                            <input
                                type="number"
                                className="w-full text-3xl font-bold p-3 border rounded-lg"
                                placeholder="3.0"
                                value={formData.longRun}
                                onChange={e => setFormData({ ...formData, longRun: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Eating Out (Meals)</label>
                            <div className="flex gap-2">
                                {[0, 1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setFormData({ ...formData, eatingOut: n })}
                                        className={`flex-1 py-3 rounded-lg border font-bold ${formData.eatingOut === n ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}
                                    >{n}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={back} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold">Back</button>
                            <button onClick={save} disabled={saving} className="flex-2 w-full bg-green-600 text-white py-4 rounded-xl font-bold">
                                {saving ? 'Saving...' : 'Save & Finish'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-10">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold mb-2">Check-in Complete!</h2>
                        <p className="text-gray-500">Great job logging your progress.</p>
                        <button onClick={() => router.push('/')} className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-full font-bold">Back Home</button>
                    </div>
                )}
            </div>
        </div>
    );
}
