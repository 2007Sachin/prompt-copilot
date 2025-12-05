import { useEffect, useState } from "react";
import { getUserPrompts, deletePromptSupabase } from "../lib/storage";
import { Eye, Trash2, Clock, Search, Filter } from "lucide-react";

interface PromptHistoryProps {
    onView: (prompt: any) => void;
    userId?: string;
}

export default function PromptHistory({ onView, userId }: PromptHistoryProps) {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [sort, setSort] = useState("newest");
    const [filter, setFilter] = useState("");

    async function load() {
        if (!userId) {
            console.warn("⚠️ No user ID, skipping prompt load");
            return;
        }
        const data = await getUserPrompts(userId);
        setPrompts(data);
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm("Delete this prompt?")) return;
        await deletePromptSupabase(id);
        load();
    }

    useEffect(() => { load(); }, [userId]);

    useEffect(() => {
        let sorted = [...prompts];
        if (sort === "newest") sorted.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sort === "oldest") sorted.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sort === "name") sorted.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setPrompts(sorted);
    }, [sort]);

    const filteredPrompts = prompts.filter((p: any) =>
        (p.name && p.name.toLowerCase().includes(filter.toLowerCase())) ||
        (p.use_case?.name && p.use_case.name.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="bg-surface border border-border rounded-xl p-6 h-full transition-all flex flex-col">
            <h2 className="text-2xl font-semibold text-text-main mb-4 text-center">History</h2>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-text-muted">
                    <Clock size={20} className="text-primary" />
                    <span className="font-medium">Recent Prompts</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-3 py-1.5 text-sm bg-background text-text-main border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder-text-muted"
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="pl-3 pr-8 py-1.5 text-sm bg-background text-text-main border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none"
                    >
                        <option value="newest" className="bg-surface text-text-main">Newest First</option>
                        <option value="oldest" className="bg-surface text-text-main">Oldest First</option>
                        <option value="name" className="bg-surface text-text-main">Sort by Name</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-border">
                {filteredPrompts.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface sticky top-0 z-10">
                            <tr>
                                <th className="p-3 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border">Name</th>
                                <th className="p-3 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border">Use Case</th>
                                <th className="p-3 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border">Technique</th>
                                <th className="p-3 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border">Created</th>
                                <th className="p-3 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredPrompts.map((p: any) => (
                                <tr key={p.id} className="hover:bg-surface-highlight transition-colors cursor-pointer group" onClick={() => onView(p)}>
                                    <td className="p-3 border-b border-border text-text-main max-w-xs truncate font-medium">
                                        {p.name}
                                    </td>
                                    <td className="p-3 border-b border-border text-text-muted">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                            {p.use_case?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-3 border-b border-border text-text-muted text-sm">{p.technique?.name || 'Custom'}</td>
                                    <td className="p-3 border-b border-border text-text-muted text-xs">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 border-b border-border text-text-main text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onView(p); }}
                                                className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="View Prompt"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(p.id, e)}
                                                className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-text-muted flex flex-col items-center gap-2">
                        <Filter size={32} className="opacity-20" />
                        <p className="text-sm">No prompts found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
