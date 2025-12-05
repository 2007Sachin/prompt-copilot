import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Database, TrendingUp } from 'lucide-react';

interface UsageDashboardProps {
    user?: any;
}

export default function UsageDashboard({ user }: UsageDashboardProps) {
    const [data, setData] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalPrompts: 0, totalTokens: 0 });

    async function load() {
        if (!user?.id) return;

        const { data: rows, error } = await supabase
            .from("usage_stats")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }
        setData(rows || []);

        const totalPrompts = rows?.length || 0;
        const totalTokens = rows?.reduce((s, r) => s + (r.total_tokens ?? 0), 0) || 0;
        setSummary({ totalPrompts, totalTokens });
    }

    useEffect(() => {
        if (!user?.id) return;
        load();

        const channel = supabase
            .channel("public:usage_stats:user:" + user.id)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "usage_stats", filter: `user_id=eq.${user.id}` },
                (payload) => {
                    setData(prev => [...prev, payload.new]);
                    setSummary(prev => ({
                        totalPrompts: prev.totalPrompts + 1,
                        totalTokens: prev.totalTokens + (payload.new.total_tokens ?? 0)
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Group by date for the chart
    const chartData = data.reduce((acc: any[], curr) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        const existing = acc.find(item => item.name === date);
        if (existing) {
            existing.tokens += (curr.total_tokens ?? 0);
        } else {
            acc.push({ name: date, tokens: curr.total_tokens ?? 0 });
        }
        return acc;
    }, []);

    // Group by model for the second chart
    const modelData = data.reduce((acc: any[], curr) => {
        const modelName = curr.model || 'Unknown';
        const existing = acc.find(item => item.name === modelName);
        if (existing) {
            existing.tokens += (curr.total_tokens ?? 0);
        } else {
            acc.push({ name: modelName, tokens: curr.total_tokens ?? 0 });
        }
        return acc;
    }, []).sort((a: any, b: any) => b.tokens - a.tokens);

    return (
        <div className="space-y-6 animate-fade-in p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-text-muted text-sm font-bold uppercase tracking-wider">Total Prompts</h3>
                        <Activity className="text-primary" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-text-main">{summary.totalPrompts}</p>
                    <p className="text-xs text-success mt-2 flex items-center gap-1">
                        <TrendingUp size={12} /> Lifetime
                    </p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-text-muted text-sm font-bold uppercase tracking-wider">Total Tokens</h3>
                        <Zap className="text-success" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-text-main">{summary.totalTokens.toLocaleString()}</p>
                    <p className="text-xs text-text-muted mt-2">Across all models</p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-text-muted text-sm font-bold uppercase tracking-wider">Avg. Quality</h3>
                        <Database className="text-error" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-text-main">--</p>
                    <p className="text-xs text-success mt-2">Coming soon</p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-text-muted text-sm font-bold uppercase tracking-wider">Saved Prompts</h3>
                        <Activity className="text-blue-400" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-text-main">--</p>
                    <p className="text-xs text-text-muted mt-2">Local Storage</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Usage Chart */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="text-text-main font-semibold mb-6">Daily Token Consumption</h3>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                                    itemStyle={{ color: '#f4f4f5' }}
                                    cursor={{ fill: '#27272a' }}
                                />
                                <Bar dataKey="tokens" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tokens by Model Chart */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="text-text-main font-semibold mb-6">Tokens by Model</h3>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={modelData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                <XAxis type="number" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                                    itemStyle={{ color: '#f4f4f5' }}
                                    cursor={{ fill: '#27272a' }}
                                />
                                <Bar dataKey="tokens" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="text-text-main font-semibold mb-6">Recent Activity</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {data.slice().reverse().slice(0, 10).map((r) => (
                            <div key={r.id} className="p-3 bg-surface-highlight rounded-lg border border-border flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-medium text-text-main">{r.provider} / {r.model}</div>
                                    <div className="text-xs text-text-muted">{new Date(r.created_at).toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-primary">{r.total_tokens}</div>
                                    <div className="text-xs text-text-muted">tokens</div>
                                </div>
                            </div>
                        ))}
                        {data.length === 0 && (
                            <div className="text-center py-12 px-4">
                                <div className="bg-surface-highlight border border-border rounded-xl p-6 max-w-md mx-auto">
                                    <Activity className="text-primary w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-text-main font-semibold mb-2">No Usage Data Yet</h3>
                                    <p className="text-text-muted text-sm leading-relaxed">
                                        Usage statistics are tracked when you:
                                    </p>
                                    <ul className="text-text-muted text-sm mt-3 space-y-1.5 text-left">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span><strong className="text-text-main">Generate</strong> a prompt (uses LLM to score quality)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-success mt-0.5">•</span>
                                            <span><strong className="text-text-main">Run</strong> a prompt (executes against the LLM)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-0.5">•</span>
                                            <span><strong className="text-text-main">APE</strong> generates variants (creates AI variations)</span>
                                        </li>
                                    </ul>
                                    <p className="text-text-muted text-xs mt-4 italic">
                                        Note: "Save" only stores prompts in History, not Usage.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
