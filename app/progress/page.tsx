'use client';

import { createClient } from "@/lib/supabase";
import { WeekCheckIn } from "@/lib/types";
import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Progress() {
    const [data, setData] = useState<WeekCheckIn[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: checkins } = await supabase
                    .from('week_checkins')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('week_start_date', { ascending: true });

                if (checkins) setData(checkins);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-6">Loading stats...</div>;

    return (
        <div className="p-6 pb-24">
            <h1 className="text-2xl font-bold mb-6">Your Progress</h1>

            {data.length === 0 ? (
                <div className="bg-blue-50 p-6 rounded-xl text-center text-blue-800">
                    <p>No check-ins yet!</p>
                    <p className="text-sm mt-2">Go to the "Check-In" tab to log your first week.</p>
                </div>
            ) : (
                <div className="space-y-8">

                    {/* Weight Chart */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-64">
                        <h3 className="font-bold text-gray-700 mb-4">Weight Trend</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="week_start_date" tick={{ fontSize: 10 }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="weight_lbs" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Waist Chart */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-64">
                        <h3 className="font-bold text-gray-700 mb-4">Waist (Inches)</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="week_start_date" tick={{ fontSize: 10 }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="waist_in" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl">
                        <h3 className="font-bold text-indigo-200 mb-4 uppercase tracking-widest text-xs">Next Milestones</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-indigo-700 pb-2">
                                <span>Waist &lt; 40"</span>
                                <span className="font-mono">In Progress</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-indigo-700 pb-2">
                                <span>Long Run 6 mi</span>
                                <span className="font-mono">Let's go!</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
