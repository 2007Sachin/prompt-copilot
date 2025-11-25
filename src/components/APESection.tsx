import React from 'react';
import { APEVariant } from '../types';
import { CheckCircle, RefreshCw, Sparkles } from 'lucide-react';

interface APESectionProps {
    variants: APEVariant[];
    onSelect: (variant: APEVariant) => void;
    onRerun: () => void;
}

const APESection: React.FC<APESectionProps> = ({ variants, onSelect, onRerun }) => {
    if (!variants || variants.length === 0) return null;

    return (
        <div className="bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
                    APE Variants
                </h3>
                <button
                    onClick={onRerun}
                    className="text-sm text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 flex items-center gap-1 font-medium transition-colors"
                >
                    <RefreshCw size={14} /> Re-run Optimization
                </button>
            </div>

            <div className="space-y-3">
                {variants.map((variant, idx) => (
                    <div
                        key={variant.id}
                        className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded-lg">
                                    #{idx + 1}
                                </span>
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {variant.meta.variation} Variation
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg border border-green-100 dark:border-green-900/30">
                                    Score: {variant.score.total}
                                </span>
                                <button
                                    onClick={() => onSelect(variant)}
                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 p-1 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                    title="Use this variant"
                                >
                                    <CheckCircle size={20} />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 font-mono bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                            {variant.prompt}
                        </p>

                        <div className="mt-3 flex gap-3 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                            <span className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${(variant.score.lengthScore || 0) > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                Length: {(variant.score.lengthScore || 0) > 0 ? 'Good' : 'Short'}
                            </span>
                            <span>•</span>
                            <span>Clarity: {variant.score.clarityScore}/20</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default APESection;
