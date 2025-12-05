import { Copy, Check, Sparkles, Wand2, Save, ArrowDown, Zap } from 'lucide-react';
import { PromptScore, APEVariant } from '../types';
import { useState, useEffect } from 'react';
import APESection from './APESection';

interface OutputSectionProps {
    generatedPrompt: string;
    promptScore?: PromptScore | null;
    isMegaPrompt?: boolean;
    isGenerating?: boolean;
    isScoring?: boolean;
    onSave?: () => void;
    apeVariants?: APEVariant[] | null;
    onApplyVariant?: (variant: APEVariant) => void;
    onAPE?: () => void;
    testResults?: string[] | null;
    chainResults?: string[];
    mode?: 'single' | 'chain';
}

// Ring Gauge Component for Score Display
const ScoreGauge = ({
    value,
    max,
    label,
    color = 'indigo'
}: {
    value: number;
    max: number;
    label: string;
    color?: 'indigo' | 'emerald' | 'blue';
}) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
        indigo: { stroke: '#6366f1', text: 'text-primary' },
        emerald: { stroke: '#10b981', text: 'text-success' },
        blue: { stroke: '#3b82f6', text: 'text-blue-400' },
    };

    const colors = colorClasses[color];

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="#27272a"
                        strokeWidth="6"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transition: 'stroke-dashoffset 0.8s ease-out'
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-lg font-bold ${colors.text}`}>{value}</span>
                    <span className="text-[10px] text-text-muted">/{max}</span>
                </div>
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-2">{label}</span>
        </div>
    );
};

// Total Score Badge (cleaner, badge-style)
const TotalScoreBadge = ({ score }: { score: number }) => {
    const getScoreColor = () => {
        if (score >= 80) return 'text-success';
        if (score >= 60) return 'text-primary';
        return 'text-warning';
    };

    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Total Score</span>
        </div>
    );
};

const OutputSection: React.FC<OutputSectionProps> = ({
    generatedPrompt,
    promptScore,
    isMegaPrompt,
    isGenerating,
    isScoring,
    onSave,
    apeVariants,
    onApplyVariant,
    onAPE,
    testResults,
    chainResults,
    mode = 'single'
}) => {
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'tests'>('preview');

    useEffect(() => {
        console.log('📤 OutputSection received generatedPrompt:', {
            exists: !!generatedPrompt,
            length: generatedPrompt?.length,
            preview: generatedPrompt?.substring(0, 50)
        });
    }, [generatedPrompt]);

    useEffect(() => {
        if (testResults && testResults.length > 0) {
            setActiveTab('tests');
        }
    }, [testResults]);

    const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Syntax highlighting for prompt text
    const highlightPrompt = (text: string) => {
        const highlighted = text
            .replace(/(&lt;[^&]*&gt;|<[^>]*>)/g, '<span class="text-primary">$1</span>')
            .replace(/(\{\{[^}]+\}\})/g, '<span class="text-success font-bold">$1</span>')
            .replace(/(\[\[[^\]]+\]\])/g, '<span class="text-blue-400">$1</span>')
            .replace(/(#[A-Z_]+)/g, '<span class="text-warning">$1</span>');
        return highlighted;
    };

    return (
        <div className="bg-surface border border-border rounded-xl h-full flex flex-col overflow-hidden">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Output</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-highlight border border-border rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'preview'
                            ? 'bg-primary text-white'
                            : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        {mode === 'chain' ? 'Workflow' : 'Result'}
                    </button>
                    {testResults && mode === 'single' && (
                        <button
                            onClick={() => setActiveTab('tests')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${activeTab === 'tests'
                                ? 'bg-primary text-white'
                                : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            Tests
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                {/* AI Score Display */}
                {mode === 'single' && isScoring && (
                    <div className="mb-6 p-5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                        <span className="text-text-main font-medium">Evaluating prompt quality with AI...</span>
                    </div>
                )}

                {mode === 'single' && promptScore && !isScoring && (
                    <div className="mb-6 p-5 rounded-xl bg-surface-highlight border border-border">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="bg-primary/10 p-1.5 rounded-lg">
                                <Sparkles size={14} className="text-primary" />
                            </div>
                            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">AI Quality Analysis</h3>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex gap-6">
                                <ScoreGauge value={promptScore.clarity} max={30} label="Clarity" color="indigo" />
                                <ScoreGauge value={promptScore.specificity} max={30} label="Specificity" color="emerald" />
                                <ScoreGauge value={promptScore.structure} max={40} label="Structure" color="blue" />
                            </div>
                            <TotalScoreBadge score={promptScore.total} />
                        </div>

                        {isMegaPrompt && (
                            <div className="mt-4 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg inline-flex items-center gap-1.5">
                                <Zap size={12} /> Mega Prompt Mode Active
                            </div>
                        )}
                    </div>
                )}

                {isGenerating ? (
                    <div className="h-full flex items-center justify-center min-h-[300px]">
                        <div className="text-center space-y-6">
                            <div className="relative mx-auto w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-border" />
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                            </div>
                            <p className="text-text-muted font-medium">{mode === 'chain' ? 'Executing workflow steps...' : 'Crafting your optimized prompt...'}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chain Mode Output */}
                        {mode === 'chain' && activeTab === 'preview' && (
                            <div className="space-y-6">
                                {chainResults && chainResults.length > 0 ? (
                                    chainResults.map((result, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-lg">
                                                    Step {idx + 1}
                                                </div>
                                                <div className="h-px flex-1 bg-border" />
                                                <button
                                                    onClick={() => copyToClipboard(result, () => { })}
                                                    className="text-text-muted hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                                                    title="Copy"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            {/* Code Block - Darker bg-zinc-950 */}
                                            <div className="bg-zinc-950 border border-border rounded-xl overflow-hidden">
                                                <div className="p-5 font-mono text-sm text-text-main whitespace-pre-wrap leading-relaxed">
                                                    {result}
                                                </div>
                                            </div>
                                            {idx < chainResults.length - 1 && (
                                                <div className="flex justify-center my-4">
                                                    <div className="flex flex-col items-center gap-1 text-text-muted">
                                                        <div className="w-px h-4 bg-border" />
                                                        <ArrowDown size={16} />
                                                        <div className="w-px h-4 bg-border" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-4 min-h-[300px]">
                                        <div className="bg-surface-highlight p-6 rounded-2xl border border-border">
                                            <Wand2 size={40} className="text-text-muted opacity-50" />
                                        </div>
                                        <p className="text-sm font-medium text-center">
                                            Add steps and click <span className="text-primary">"Execute Workflow"</span> to run.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Single Mode Output - Code Block Style with bg-zinc-950 */}
                        {mode === 'single' && activeTab === 'preview' && (
                            generatedPrompt ? (
                                <>
                                    {/* Code Block Container */}
                                    <div className="bg-zinc-950 border border-border rounded-xl overflow-hidden mb-6">
                                        {/* Code Block Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                                                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                                                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                                                </div>
                                                <span className="text-[10px] font-mono text-text-muted ml-2">generated-prompt.txt</span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(generatedPrompt, setCopiedPrompt)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${copiedPrompt
                                                    ? 'bg-success/10 text-success border border-success/20'
                                                    : 'bg-surface-highlight text-text-main hover:bg-zinc-700 border border-border'
                                                    }`}
                                            >
                                                {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedPrompt ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>

                                        {/* Code Block Content */}
                                        <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                                            <pre
                                                className="text-text-main whitespace-pre-wrap"
                                                dangerouslySetInnerHTML={{ __html: highlightPrompt(generatedPrompt) }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : !apeVariants && (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-4 min-h-[300px]">
                                    <div className="bg-surface-highlight p-6 rounded-2xl border border-border">
                                        <Wand2 size={40} className="text-text-muted opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium text-center">
                                        Click <span className="text-primary">"Generate Prompt"</span> to create your optimized prompt.
                                    </p>
                                </div>
                            )
                        )}

                        {activeTab === 'tests' && testResults && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {testResults.map((result, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-col bg-zinc-950 border border-border rounded-xl overflow-hidden"
                                    >
                                        <div className="px-4 py-2.5 border-b border-border bg-surface flex justify-between items-center">
                                            <span className="text-xs font-bold text-primary">Test Case {idx + 1}</span>
                                            <button
                                                onClick={() => copyToClipboard(result, () => { })}
                                                className="text-text-muted hover:text-text-main p-1 rounded transition-colors"
                                                title="Copy Result"
                                            >
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 max-h-[400px]">
                                            <pre className="whitespace-pre-wrap font-mono text-xs text-text-main leading-relaxed">
                                                {result || <span className="text-text-muted italic">No output</span>}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {apeVariants && activeTab === 'preview' && mode === 'single' && (
                    <div className="mt-6 pt-6 border-t border-border">
                        <APESection
                            variants={apeVariants}
                            onSelect={onApplyVariant || (() => { })}
                            onRerun={() => { }}
                        />
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-border bg-surface">
                <div className="flex gap-3">
                    {mode === 'single' && (
                        <button
                            onClick={onAPE}
                            disabled={isGenerating || !generatedPrompt}
                            className="flex-1 bg-surface-highlight border border-border py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-text-main hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Zap size={16} className="text-primary" />
                            APE Variants
                        </button>
                    )}
                    <button
                        onClick={onSave}
                        disabled={!generatedPrompt && (!chainResults || chainResults.length === 0)}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        Save to Library
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OutputSection;
