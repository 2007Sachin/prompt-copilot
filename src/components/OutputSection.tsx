isMegaPrompt: boolean;
isGenerating ?: boolean;
isScoring ?: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({
    generatedPrompt,
    promptScore,
    isMegaPrompt,
    isGenerating,
    isScoring
}) => {
    const [copiedPrompt, setCopiedPrompt] = useState(false);

    const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)] h-full flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col bg-transparent">
                <div className="h-full flex flex-col animate-fade-in">
                    {/* LLM Scoring Display */}
                    {isScoring && (
                        <div className="mb-6 p-4 bg-[#252525] border border-[#BB86FC]/30 rounded-xl text-[#BB86FC] flex items-center gap-3 animate-pulse">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#BB86FC]"></div>
                            <span className="font-medium">Evaluating prompt quality with AI...</span>
                        </div>
                    )}

                    {promptScore && !isScoring && (
                        <div className="mb-6 p-5 bg-[#181818] rounded-xl border border-[#2A2A2A] shadow-lg transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="bg-[#BB86FC]/20 p-1.5 rounded-lg text-[#BB86FC]">
                                            <Sparkles size={16} />
                                        </div>
                                        <h3 className="font-bold text-[#E0E0E0]">AI Quality Score</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[#A0A0A0] text-xs uppercase font-bold tracking-wider mb-1">Clarity</span>
                                            <span className="font-bold text-[#E0E0E0] text-lg">{promptScore.clarity}/30</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[#A0A0A0] text-xs uppercase font-bold tracking-wider mb-1">Specificity</span>
                                            <span className="font-bold text-[#E0E0E0] text-lg">{promptScore.specificity}/30</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[#A0A0A0] text-xs uppercase font-bold tracking-wider mb-1">Structure</span>
                                            <span className="font-bold text-[#E0E0E0] text-lg">{promptScore.structure}/40</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right bg-[#252525] p-3 rounded-xl border border-[#2A2A2A] shadow-sm">
                                    <div className="text-3xl font-bold text-[#E0E0E0] leading-none">{promptScore.total}</div>
                                    <div className="text-xs text-[#A0A0A0] font-medium mt-1">TOTAL SCORE</div>
                                </div>
                            </div>
                            {isMegaPrompt && (
                                <div className="mt-4 text-xs font-medium text-[#BB86FC] bg-[#BB86FC]/10 border border-[#BB86FC]/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                                    <Sparkles size={12} /> Mega Prompt Mode Active
                                </div>
                            )}
                        </div>
                    )}

                    {isGenerating ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#BB86FC] mx-auto"></div>
                                <p className="text-[#A0A0A0] font-medium">Generating optimized prompt...</p>
                            </div>
                        </div>
                    ) : generatedPrompt ? (
                        <>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider">Generated Prompt</h3>
                                <button
                                    onClick={() => copyToClipboard(generatedPrompt, setCopiedPrompt)}
                                    className="text-xs font-medium text-[#BB86FC] hover:text-[#a66af5] hover:bg-[#BB86FC]/10 px-2 py-1 rounded transition-colors flex items-center gap-1.5"
                                >
                                    {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                                    {copiedPrompt ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="flex-1 bg-[#1E1E1E] p-5 rounded-xl border border-[#2A2A2A] overflow-y-auto font-mono text-sm text-[#E0E0E0] whitespace-pre-wrap leading-relaxed shadow-inner custom-scrollbar">
                                {generatedPrompt}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#A0A0A0] space-y-4">
                            <div className="bg-[#252525] p-4 rounded-full border border-[#2A2A2A]">
                                <Wand2 size={32} className="text-[#666]" />
                            </div>
                            <p className="text-sm font-medium">Click "Generate Prompt" to create your optimized prompt.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutputSection;

function Wand2({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15 4V2" />
            <path d="M15 16v-2" />
            <path d="M8 9h2" />
            <path d="M20 9h2" />
            <path d="M17.8 11.8 19 13" />
            <path d="M15 9h0" />
            <path d="M17.8 6.2 19 5" />
            <path d="m3 21 9-9" />
            <path d="M12.2 6.2 11 5" />
        </svg>
    );
}
