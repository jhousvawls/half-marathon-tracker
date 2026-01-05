'use client';

import { createClient } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            // If login fails, try to sign up (simple "auto-signup" for single user ease)
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            if (signUpError) {
                setMsg(error.message);
            } else {
                setMsg("Account created! Check your email to confirm, then sign in.");
            }
        } else {
            router.push('/');
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-6">Welcome Runner 🏃‍♂️</h1>
            <div className="w-full max-w-sm space-y-4">
                <input
                    className="w-full p-4 border rounded-xl"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    className="w-full p-4 border rounded-xl"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl disabled:opacity-50"
                >
                    {loading ? '...' : 'Login / Sign Up'}
                </button>
                {msg && <p className="text-red-500 text-center text-sm">{msg}</p>}
            </div>
        </div>
    );
}
