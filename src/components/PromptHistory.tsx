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

    // Sort prompts when sort option changes
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
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)] h-full transition-all flex flex-col">
            <h2 className="text-2xl font-semibold text-[#E0E0E0] mb-4 text-center">History</h2>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-[#A0A0A0]">
                    <Clock size={20} className="text-[#BB86FC]" />
                    <span className="font-medium">Recent Prompts</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-3 py-1.5 text-sm bg-[#1E1E1E] text-[#E0E0E0] border border-[#2A2A2A] rounded-lg focus:ring-1 focus:ring-[#BB86FC] focus:border-[#BB86FC] transition-all placeholder-[#666]"
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="pl-3 pr-8 py-1.5 text-sm bg-[#1E1E1E] text-[#E0E0E0] border border-[#2A2A2A] rounded-lg focus:ring-1 focus:ring-[#BB86FC] focus:border-[#BB86FC] transition-all appearance-none"
                    >
                        <option value="newest" className="bg-[#1E1E1E] text-[#E0E0E0]">Newest First</option>
                        <option value="oldest" className="bg-[#1E1E1E] text-[#E0E0E0]">Oldest First</option>
                        <option value="name" className="bg-[#1E1E1E] text-[#E0E0E0]">Sort by Name</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-[#2A2A2A]">
                {filteredPrompts.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1E1E1E] sticky top-0 z-10">
                            <tr>
                                <th className="p-3 text-xs font-bold text-[#A0A0A0] uppercase tracking-wider border-b border-[#2A2A2A]">Name</th>
                                <th className="p-3 text-xs font-bold text-[#A0A0A0] uppercase tracking-wider border-b border-[#2A2A2A]">Use Case</th>
                                <th className="p-3 text-xs font-bold text-[#A0A0A0] uppercase tracking-wider border-b border-[#2A2A2A]">Technique</th>
                                <th className="p-3 text-xs font-bold text-[#A0A0A0] uppercase tracking-wider border-b border-[#2A2A2A]">Created</th>
                                <th className="p-3 text-xs font-bold text-[#A0A0A0] uppercase tracking-wider border-b border-[#2A2A2A] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {filteredPrompts.map((p: any) => (
                                <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors cursor-pointer group" onClick={() => onView(p)}>
                                    <td className="p-3 border-b border-[#2A2A2A] text-[#E0E0E0] max-w-xs truncate font-medium">
                                        {p.name}
                                    </td>
                                    <td className="p-3 border-b border-[#2A2A2A] text-[#A0A0A0]">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#BB86FC]/10 text-[#BB86FC] border border-[#BB86FC]/20">
                                            {p.use_case?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-3 border-b border-[#2A2A2A] text-[#A0A0A0] text-sm">{p.technique?.name || 'Custom'}</td>
                                    <td className="p-3 border-b border-[#2A2A2A] text-[#666] text-xs">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 border-b border-[#2A2A2A] text-[#E0E0E0] text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onView(p); }}
                                                className="p-1.5 text-[#BB86FC] hover:bg-[#BB86FC]/10 rounded-lg transition-colors"
                                                title="View Prompt"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(p.id, e)}
                                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
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
                    <div className="p-8 text-center text-[#666] flex flex-col items-center gap-2">
                        <Filter size={32} className="opacity-20" />
                        <p className="text-sm">No prompts found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
