import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface AuthPanelProps {
    onAuth: () => void;
}

export default function AuthPanel({ onAuth }: AuthPanelProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function signup() {
        const { error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) alert(error.message);
        else onAuth();
    }

    async function login() {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) alert(error.message);
        else onAuth();
    }

    return (
        <div className="p-6 max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-4">Login / Signup</h2>

            <input
                placeholder="Email"
                className="w-full p-2 border mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                className="w-full p-2 bg-blue-600 text-white mb-2"
                onClick={signup}
            >
                Sign Up
            </button>

            <button
                className="w-full p-2 bg-green-600 text-white"
                onClick={login}
            >
                Login
            </button>
        </div>
    );
}
