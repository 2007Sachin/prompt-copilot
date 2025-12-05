import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Wand2, UploadCloud, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { UseCase, Technique, LengthMode, OutputFormat, PromptConfig, ChainStep } from '../types';
import techniquesData from '../data/techniques.json';
import { useDebounce } from '../hooks/useDebounce';

interface InputSectionProps {
    config: PromptConfig;
    onConfigChange: (newConfig: PromptConfig) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    onAPE: () => void;
    onSave: () => void;
    onShowToast?: (type: 'success' | 'error', message: string) => void;
    testValues?: string[];
    setTestValues?: (values: string[]) => void;
    mode?: 'single' | 'chain';
    chainSteps?: ChainStep[];
    activeStepIndex?: number;
    onStepChange?: (index: number) => void;
    onAddStep?: () => void;
    onDeleteStep?: (index: number) => void;
    onClearChain?: () => void;
    onGenerateSchema?: (context: string) => Promise<string>;
}

const InputSection: React.FC<InputSectionProps> = ({
    config,
    onConfigChange,
    onGenerate,
    isGenerating,
    onShowToast,
    testValues,
    setTestValues,
    mode = 'single',
    chainSteps = [],
    activeStepIndex = 0,
    onStepChange,
    onAddStep,
    onDeleteStep,
    onClearChain,
    onGenerateSchema
}) => {
    const { useCases, techniques, lengthModes, outputFormats } = techniquesData as unknown as {
        useCases: UseCase[];
        techniques: Technique[];
        lengthModes: LengthMode[];
        outputFormats: OutputFormat[];
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isTestExpanded, setIsTestExpanded] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);

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

    useEffect(() => {
        if (mode === 'single') {
            const saved = localStorage.getItem("draft_context");
            if (saved) {
                onConfigChange({ ...config, context: saved });
            }
        }
    }, [mode]);

    const debouncedContext = useDebounce(config.context, 1000);

    useEffect(() => {
        if (mode === 'single' && debouncedContext && debouncedContext.length > 0) {
            localStorage.setItem("draft_context", debouncedContext);
        }
    }, [debouncedContext, mode]);

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

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const formattedContent = `\n<reference_document filename="${file.name}">\n${content}\n</reference_document>\n`;

            onConfigChange({
                ...config,
                context: config.context + formattedContent
            });

            if (onShowToast) {
                onShowToast('success', `Added ${file.name} to context`);
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleTestValueChange = (index: number, value: string) => {
        if (setTestValues && testValues) {
            const newValues = [...testValues];
            newValues[index] = value;
            setTestValues(newValues);
        }
    };

    // Zone Label Component
    const ZoneLabel = ({ children }: { children: React.ReactNode }) => (
        <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{children}</span>
            <div className="h-px flex-1 bg-border" />
        </div>
    );

    // Chip Select Component - Updated with semantic classes
    const ChipSelect = ({
        value,
        onChange,
        options,
        label
    }: {
        value: string;
        onChange: (value: string) => void;
        options: { id: string; name: string }[];
        label: string;
    }) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-surface-highlight text-text-main border border-border rounded-md py-2.5 px-3 pr-10 text-sm font-medium appearance-none cursor-pointer hover:border-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-150"
                >
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id} className="bg-surface text-text-main">
                            {opt.name}
                        </option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
        </div>
    );

    // Glass Input Component - Updated with semantic classes
    const GlassInput = ({
        value,
        onChange,
        placeholder,
        label,
        multiline = false
    }: {
        value: string;
        onChange: (value: string) => void;
        placeholder: string;
        label: string;
        multiline?: boolean;
    }) => {
        const inputClasses = "w-full bg-surface-highlight text-text-main border border-border rounded-lg py-2.5 px-3 text-sm placeholder-text-muted hover:border-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-150";

        return (
            <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{label}</label>
                {multiline ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`${inputClasses} min-h-[80px] resize-none font-mono text-xs leading-relaxed`}
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={inputClasses}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-full">
            {/* Left Column: Controls (32%) */}
            <div
                className={`lg:w-[32%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 transition-all duration-500 ${isFocusMode ? 'opacity-40 blur-[1px] pointer-events-none' : 'opacity-100'
                    }`}
            >
                {/* Workflow Steps Navigator (Chain Mode Only) */}
                {mode === 'chain' && (
                    <div className="bg-surface border border-border rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Workflow Steps</span>
                            {chainSteps.length > 1 && (
                                <button
                                    onClick={onClearChain}
                                    className="text-[10px] font-medium text-text-muted hover:text-error flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-error/10"
                                    title="Clear all steps"
                                >
                                    <RotateCcw size={10} />
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {chainSteps.map((step, idx) => (
                                <div key={step.id} className="relative group">
                                    <button
                                        onClick={() => onStepChange && onStepChange(idx)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${activeStepIndex === idx
                                            ? 'bg-primary text-white border-transparent'
                                            : 'bg-surface-highlight text-text-muted border-border hover:border-zinc-600 hover:text-text-main'
                                            }`}
                                    >
                                        Step {idx + 1}
                                        {chainSteps.length > 1 && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteStep && onDeleteStep(idx);
                                                }}
                                                className={`ml-0.5 p-0.5 rounded transition-colors ${activeStepIndex === idx
                                                    ? 'hover:bg-white/20 text-white/70 hover:text-white'
                                                    : 'hover:bg-error/20 text-text-muted hover:text-error'
                                                    }`}
                                                title={`Delete Step ${idx + 1}`}
                                            >
                                                <Trash2 size={10} />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={onAddStep}
                                className="w-8 h-8 rounded-lg bg-surface-highlight border border-dashed border-zinc-600 text-text-muted hover:text-primary hover:border-primary transition-all flex items-center justify-center"
                                title="Add Step"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Controls Panel */}
                <div className="bg-surface border border-border rounded-xl p-5 space-y-6">
                    {/* STRATEGY Zone */}
                    <div>
                        <ZoneLabel>Strategy</ZoneLabel>
                        <div className="grid grid-cols-1 gap-4">
                            <ChipSelect
                                label="Use Case"
                                value={config.useCase.id}
                                onChange={(id) => {
                                    const selected = useCases.find(u => u.id === id);
                                    if (selected) onConfigChange({ ...config, useCase: selected });
                                }}
                                options={useCases}
                            />
                            <ChipSelect
                                label="Technique"
                                value={config.technique.id}
                                onChange={(id) => {
                                    const selected = techniques.find(t => t.id === id);
                                    if (selected) onConfigChange({ ...config, technique: selected });
                                }}
                                options={techniques}
                            />
                        </div>
                    </div>

                    {/* PARAMETERS Zone */}
                    <div>
                        <ZoneLabel>Parameters</ZoneLabel>
                        <div className="grid grid-cols-2 gap-3">
                            <ChipSelect
                                label="Length"
                                value={config.lengthMode.id}
                                onChange={(id) => {
                                    const selected = lengthModes.find(m => m.id === id);
                                    if (selected) onConfigChange({ ...config, lengthMode: selected });
                                }}
                                options={lengthModes}
                            />
                            <ChipSelect
                                label="Format"
                                value={config.outputFormat.id}
                                onChange={(id) => {
                                    const selected = outputFormats.find(f => f.id === id);
                                    if (selected) onConfigChange({ ...config, outputFormat: selected });
                                }}
                                options={outputFormats}
                            />
                        </div>
                    </div>

                    {/* IDENTITY Zone */}
                    <div>
                        <ZoneLabel>Identity</ZoneLabel>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Persona</label>
                                <div className="relative">
                                    <select
                                        value={PERSONA_PRESETS.includes(config.persona) ? config.persona : "custom"}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== "custom") {
                                                onConfigChange({ ...config, persona: val });
                                            }
                                        }}
                                        className="w-full bg-surface-highlight text-text-main border border-border rounded-md py-2.5 px-3 pr-10 text-sm font-medium appearance-none cursor-pointer hover:border-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-150"
                                    >
                                        <option value="custom" className="bg-surface text-text-main">Custom / Edit...</option>
                                        {PERSONA_PRESETS.map(p => (
                                            <option key={p} value={p} className="bg-surface text-text-main">{p}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                </div>
                                <input
                                    type="text"
                                    value={config.persona}
                                    onChange={(e) => onConfigChange({ ...config, persona: e.target.value })}
                                    className="w-full bg-surface-highlight text-text-main border border-border rounded-lg py-2.5 px-3 text-sm placeholder-text-muted hover:border-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-150"
                                    placeholder="Enter custom persona..."
                                />
                            </div>
                            <GlassInput
                                label="Goal"
                                value={config.goal}
                                onChange={(val) => onConfigChange({ ...config, goal: val })}
                                placeholder="e.g. Optimize this function"
                            />
                        </div>
                    </div>

                    {/* CONSTRAINTS Zone */}
                    <div>
                        <ZoneLabel>Constraints</ZoneLabel>
                        <GlassInput
                            label="Rules & Limits"
                            value={config.constraints}
                            onChange={(val) => onConfigChange({ ...config, constraints: val })}
                            placeholder="e.g. No external libraries, under 50 lines"
                        />
                    </div>

                    {/* Schema Input with Smart Presets */}
                    {(config.outputFormat.id === 'json' || config.technique.supportsSchema) && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <ZoneLabel>Output Structure</ZoneLabel>
                                {onGenerateSchema && (
                                    <button
                                        onClick={async () => {
                                            setIsGeneratingSchema(true);
                                            const generatedSchema = await onGenerateSchema(config.context);
                                            if (generatedSchema) {
                                                onConfigChange({ ...config, schema: generatedSchema });
                                            }
                                            setIsGeneratingSchema(false);
                                        }}
                                        disabled={isGeneratingSchema || !config.context.trim()}
                                        className="text-xs text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingSchema ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={12} />
                                                Auto-Detect Structure
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Schema Presets - Show if format has presets */}
                            {config.outputFormat.presets && config.outputFormat.presets.length > 0 && (
                                <div className="mb-3">
                                    <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2 block">
                                        Quick Templates
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {config.outputFormat.presets.map((preset) => {
                                            const isActive = config.schema === preset.schema;
                                            return (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => {
                                                        // Toggle: if active, clear schema; if not active, apply preset
                                                        if (isActive) {
                                                            onConfigChange({ ...config, schema: '' });
                                                        } else {
                                                            onConfigChange({ ...config, schema: preset.schema });
                                                        }
                                                    }}
                                                    title="Click to apply, click again to remove"
                                                    className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 border cursor-pointer ${isActive
                                                            ? 'bg-primary/20 border-primary text-primary shadow-sm'
                                                            : 'bg-surface-highlight border-border text-text-muted hover:text-text-main hover:border-zinc-600'
                                                        }`}
                                                >
                                                    {preset.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Schema Code Editor */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                                    Custom Structure Definition
                                </label>
                                <div className="relative rounded-lg overflow-hidden border border-border bg-zinc-950">
                                    <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                    </div>
                                    <textarea
                                        value={config.schema || ''}
                                        onChange={(e) => onConfigChange({ ...config, schema: e.target.value })}
                                        placeholder={'{\n  "key": "value",\n  "items": []\n}'}
                                        className="w-full min-h-[120px] bg-transparent font-mono text-xs text-emerald-400 px-4 py-3 pt-8 resize-none placeholder-zinc-600 focus:outline-none focus:ring-0 border-none leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Test Suite Section */}
                    {testValues && setTestValues && mode === 'single' && (
                        <div className="border border-border rounded-xl bg-surface-highlight overflow-hidden">
                            <button
                                onClick={() => setIsTestExpanded(!isTestExpanded)}
                                className="w-full flex justify-between items-center p-4 hover:bg-zinc-700/30 transition-colors"
                            >
                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-base">🧪</span> Test Suite
                                </span>
                                <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isTestExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {isTestExpanded && (
                                <div className="p-4 pt-0 space-y-3 animate-fade-in">
                                    <p className="text-[10px] text-text-muted mb-2">
                                        Enter values to test against your prompt.
                                    </p>
                                    {[0, 1, 2].map((idx) => (
                                        <div key={idx}>
                                            <label className="text-[10px] font-medium text-text-muted mb-1 block">Test Case {idx + 1}</label>
                                            <textarea
                                                value={testValues[idx]}
                                                onChange={(e) => handleTestValueChange(idx, e.target.value)}
                                                className="w-full bg-background text-text-main border border-border rounded-lg py-2.5 px-3 text-xs font-mono placeholder-text-muted min-h-[50px] resize-none hover:border-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-150"
                                                placeholder={`Test input ${idx + 1}...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Examples Builder */}
                    {config.technique.supportsExamples && (
                        <div className="border border-border rounded-xl bg-surface-highlight p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                    Few-Shot Examples ({config.examples.length}/5)
                                </span>
                                <button
                                    onClick={addExample}
                                    disabled={config.examples.length >= 5}
                                    className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                    <Plus size={12} /> Add
                                </button>
                            </div>
                            <div className="space-y-3">
                                {config.examples.map((ex, idx) => (
                                    <div key={ex.id} className="flex gap-2 items-start group">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                value={ex.input}
                                                onChange={(e) => handleExampleChange(idx, 'input', e.target.value)}
                                                placeholder="Input"
                                                className="w-full bg-background text-text-main border border-border rounded-md py-2 px-3 text-xs placeholder-text-muted focus:border-primary focus:outline-none transition-all"
                                            />
                                            <input
                                                value={ex.output}
                                                onChange={(e) => handleExampleChange(idx, 'output', e.target.value)}
                                                placeholder="Output"
                                                className="w-full bg-background text-text-main border border-border rounded-md py-2 px-3 text-xs placeholder-text-muted focus:border-primary focus:outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeExample(idx)}
                                            className="text-text-muted hover:text-error p-1.5 rounded-lg hover:bg-error/10 transition-colors mt-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Canvas (68%) */}
            <div className="lg:w-[68%] flex flex-col gap-4 overflow-hidden">
                <div className="bg-surface border border-border rounded-xl h-full flex flex-col relative overflow-hidden">
                    {/* Canvas Header */}
                    <div className="flex justify-between items-center px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Context Canvas</span>
                        </div>
                        <button
                            onClick={handleFileClick}
                            className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/20"
                        >
                            <UploadCloud size={12} /> Upload File
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".txt,.md,.json,.js,.ts"
                        />
                    </div>

                    {/* Canvas Textarea */}
                    <div className="flex-1 p-4 pb-24 overflow-y-auto custom-scrollbar">
                        <div className="h-full relative rounded-xl overflow-hidden bg-background/50 border border-border">
                            <textarea
                                value={config.context}
                                onChange={(e) => onConfigChange({ ...config, context: e.target.value })}
                                onFocus={() => setIsFocusMode(true)}
                                onBlur={() => setIsFocusMode(false)}
                                className="w-full h-full min-h-[400px] bg-transparent rounded-xl p-5 text-text-main placeholder-text-muted focus:ring-0 outline-none resize-none font-mono text-sm leading-relaxed tracking-wide focus:border-primary"
                                placeholder={`// Describe the task, context, or query...

Enter your prompt context here. Use clear, specific language.

You can also upload reference documents using the button above.`}
                            />
                        </div>

                        {/* Helper Hint for Chain Mode */}
                        {mode === 'chain' && activeStepIndex > 0 && (
                            <div className="mt-3 text-xs text-primary bg-primary/10 p-3 rounded-xl border border-primary/20 flex items-center gap-2">
                                <Sparkles size={14} className="text-primary" />
                                <span>
                                    Tip: Use <code className="bg-surface-highlight px-1.5 py-0.5 rounded font-mono text-primary">{`{{STEP_${activeStepIndex}_OUTPUT}}`}</code> to inject the result from the previous step.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Sticky Action Button */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-surface via-surface/95 to-transparent">
                        <button
                            onClick={onGenerate}
                            disabled={isGenerating}
                            className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-base font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                        >
                            <Wand2 size={20} />
                            {isGenerating ? 'Generating...' : (mode === 'chain' ? 'Execute Workflow' : 'Generate Prompt')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputSection;
