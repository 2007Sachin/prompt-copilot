import React, { useEffect } from 'react';
import { Plus, Trash2, Wand2, Save } from 'lucide-react';
import { UseCase, Technique, LengthMode, OutputFormat, PromptConfig } from '../types';
import techniquesData from '../data/techniques.json';

interface InputSectionProps {
    config: PromptConfig;
    onConfigChange: (newConfig: PromptConfig) => void;
    onGenerate: () => void;
    onAPE: () => void;
    onSave: () => void;
    isGenerating: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({
    config,
    onConfigChange,
    onGenerate,
    onAPE,
    onSave,
    isGenerating
}) => {
    const { useCases, techniques, lengthModes, outputFormats } = techniquesData as unknown as {
        useCases: UseCase[];
        techniques: Technique[];
        lengthModes: LengthMode[];
        outputFormats: OutputFormat[];
    };

    const PERSONA_PRESETS = [
        "Senior Product Manager",
        "Marketing Strategist",
        "Harvard Professor",
        "Google SWE",
        "UX Research Lead",
        "AI Ethics Advisor",
        "Startup Founder",
        "Data Scientist",
        "Copywriting Expert"
    ];

    // Load draft context on mount
    useEffect(() => {
        const saved = localStorage.getItem("draft_context");
        if (saved) {
            onConfigChange({ ...config, context: saved });
        }
    }, []);

    // Auto-save context every 5 seconds
    useEffect(() => {
        const id = setInterval(() => {
            if (config.context && config.context.length > 0) {
                localStorage.setItem("draft_context", config.context);
            }
        }, 5000);
        return () => clearInterval(id);
    }, [config.context]);

    const handleExampleChange = (index: number, field: 'input' | 'output', value: string) => {
        const newExamples = [...config.examples];
        newExamples[index] = { ...newExamples[index], [field]: value };
        onConfigChange({ ...config, examples: newExamples });
    };

    const addExample = () => {
        if (config.examples.length < 5) {
            onConfigChange({
                ...config,
                examples: [...config.examples, { id: Date.now().toString(), input: '', output: '' }]
            });
        }
    };

    const removeExample = (index: number) => {
        const newExamples = config.examples.filter((_, i) => i !== index);
        onConfigChange({ ...config, examples: newExamples });
    };

    const labelClass = "text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-1.5 block";
    const inputClass = "w-full bg-[#1E1E1E] text-[#E0E0E0] border border-[#2A2A2A] rounded-lg p-3 placeholder-[#666] focus:ring-1 focus:ring-[#BB86FC] focus:border-[#BB86FC] outline-none transition-all";
    const selectClass = "w-full bg-[#1E1E1E] text-[#E0E0E0] border border-[#2A2A2A] rounded-lg p-3 focus:ring-1 focus:ring-[#BB86FC] focus:border-[#BB86FC] outline-none transition-all appearance-none";

    return (
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)] h-full space-y-4 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Context / Task</label>
                        <textarea
                            value={config.context}
                            onChange={(e) => onConfigChange({ ...config, context: e.target.value })}
                            className="w-full h-48 bg-[#1E1E1E] rounded-lg border border-[#2A2A2A] p-4 text-[#E0E0E0] placeholder-[#666] focus:ring-1 focus:ring-[#BB86FC] focus:border-[#BB86FC] outline-none whitespace-pre-wrap resize-none font-sans leading-relaxed"
                            placeholder="Describe the task, context, or query..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Use Case</label>
                            <div className="relative">
                                <select
                                    value={config.useCase.id}
                                    onChange={(e) => {
                                        const selected = useCases.find(u => u.id === e.target.value);
                                        if (selected) onConfigChange({ ...config, useCase: selected });
                                    }}
                                    className={selectClass}
                                >
                                    {useCases.map(u => <option key={u.id} value={u.id} className="bg-[#1E1E1E] text-[#E0E0E0]">{u.name}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#A0A0A0]">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Technique</label>
                            <div className="relative">
                                <select
                                    value={config.technique.id}
                                    onChange={(e) => {
                                        const selected = techniques.find(t => t.id === e.target.value);
                                        if (selected) onConfigChange({ ...config, technique: selected });
                                    }}
                                    className={selectClass}
                                >
                                    {techniques.map(t => <option key={t.id} value={t.id} className="bg-[#1E1E1E] text-[#E0E0E0]">{t.name}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#A0A0A0]">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Length Mode</label>
                        <div className="flex gap-3 bg-[#252525] p-1.5 rounded-xl border border-[#2A2A2A] inline-flex">
                            {lengthModes.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => onConfigChange({ ...config, lengthMode: m })}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${config.lengthMode.id === m.id
                                        ? 'bg-[#BB86FC] text-black shadow-sm'
                                        : 'text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#333]'
                                        }`}
                                >
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Output Format</label>
                        <div className="relative">
                            <select
                                value={config.outputFormat.id}
                                onChange={(e) => {
                                    const selected = outputFormats.find(f => f.id === e.target.value);
                                    if (selected) onConfigChange({ ...config, outputFormat: selected });
                                }}
                                className={selectClass}
                            >
                                {outputFormats.map(f => <option key={f.id} value={f.id} className="bg-[#1E1E1E] text-[#E0E0E0]">{f.name}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#A0A0A0]">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Persona / Role</label>
                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        value={PERSONA_PRESETS.includes(config.persona) ? config.persona : "custom"}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== "custom") {
                                                onConfigChange({ ...config, persona: val });
                                            }
                                        }}
                                        className={`${selectClass}`}
                                    >
                                        <option value="custom" className="bg-[#1E1E1E] text-[#E0E0E0]">Custom / Edit...</option>
                                        {PERSONA_PRESETS.map(p => (
                                            <option key={p} value={p} className="bg-[#1E1E1E] text-[#E0E0E0]">{p}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#A0A0A0]">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={config.persona}
                                    onChange={(e) => onConfigChange({ ...config, persona: e.target.value })}
                                    className={inputClass}
                                    placeholder="Enter custom persona..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Goal</label>
                            <input
                                type="text"
                                value={config.goal}
                                onChange={(e) => onConfigChange({ ...config, goal: e.target.value })}
                                className={inputClass}
                                placeholder="e.g. Optimize this function"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Constraints</label>
                        <input
                            type="text"
                            value={config.constraints}
                            onChange={(e) => onConfigChange({ ...config, constraints: e.target.value })}
                            className={inputClass}
                            placeholder="e.g. No external libraries, under 50 lines"
                        />
                    </div>

                    {/* Schema Input */}
                    {(config.outputFormat.id === 'json' || config.technique.supportsSchema) && (
                        <div>
                            <label className={labelClass}>Output Schema</label>
                            <textarea
                                value={config.schema || ''}
                                onChange={(e) => onConfigChange({ ...config, schema: e.target.value })}
                                className={`${inputClass} min-h-[100px] font-mono text-xs`}
                                placeholder={config.outputFormat.exampleSchema || "{\n  \"key\": \"value\"\n}"}
                            />
                        </div>
                    )}

                    {/* Examples Builder */}
                    {config.technique.supportsExamples && (
                        <div className="border border-[#2A2A2A] rounded-xl p-5 bg-[#252525]">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-0">Few-Shot Examples ({config.examples.length}/5)</label>
                                <button
                                    onClick={addExample}
                                    disabled={config.examples.length >= 5}
                                    className="text-xs font-medium text-[#BB86FC] hover:text-[#a66af5] flex items-center gap-1 transition-colors"
                                >
                                    <Plus size={14} /> Add Example
                                </button>
                            </div>
                            <div className="space-y-4">
                                {config.examples.map((ex, idx) => (
                                    <div key={ex.id} className="flex gap-3 items-start group">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                value={ex.input}
                                                onChange={(e) => handleExampleChange(idx, 'input', e.target.value)}
                                                placeholder="Input"
                                                className={inputClass}
                                            />
                                            <input
                                                value={ex.output}
                                                onChange={(e) => handleExampleChange(idx, 'output', e.target.value)}
                                                placeholder="Output"
                                                className={inputClass}
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeExample(idx)}
                                            className="text-[#A0A0A0] hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/20 transition-colors mt-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-auto border-t border-[#2A2A2A] space-y-4 z-10">
                <div className="flex gap-3">
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="flex-1 bg-[#BB86FC] text-black font-semibold px-5 py-3 rounded-lg shadow-lg hover:bg-[#a66af5] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Wand2 size={18} /> Generate Prompt
                    </button>
                    <button
                        onClick={onAPE}
                        disabled={isGenerating}
                        className="bg-[#1E1E1E] border border-[#2A2A2A] text-[#E0E0E0] px-5 py-3 rounded-lg hover:bg-[#252525] transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Auto-Prompt Engineering"
                    >
                        <span className="text-[#BB86FC] font-bold">APE</span> Variants
                    </button>
                </div>

                <div className="flex gap-2">
                    <button onClick={onSave} className="bg-[#1E1E1E] border border-[#2A2A2A] text-[#E0E0E0] px-4 py-2 rounded-lg hover:bg-[#252525] transition text-sm flex items-center gap-1.5">
                        <Save size={14} /> Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputSection;
