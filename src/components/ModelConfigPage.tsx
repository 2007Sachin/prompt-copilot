import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { PromptConfig } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ModelConfigPageProps {
    config: PromptConfig;
    onConfigChange: (config: PromptConfig) => void;
}

interface Model {
    id: number;
    name: string;
    provider: string;
}

export default function ModelConfigPage({ config, onConfigChange }: ModelConfigPageProps) {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const { data, error } = await supabase
                    .from("models")
                    .select("*")
                    .eq("is_active", true);

                if (error) {
                    console.error("Error fetching models:", error);
                } else {
                    setModels(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch models:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, []);

    const providers = [...new Set(models.map(m => m.provider))];

    // Fallback if no models in DB yet (or while loading)
    const availableProviders = providers.length > 0 ? providers : ['openai', 'groq', 'anthropic', 'gemini'];

    const handleChange = (key: keyof typeof config.modelConfig, value: any) => {
        onConfigChange({
            ...config,
            modelConfig: {
                ...config.modelConfig,
                [key]: value
            }
        });
    };

    // Auto-update model when provider changes
    useEffect(() => {
        if (!models.length) return; // Wait for models to load

        const providerModels = models.filter(m => m.provider === config.modelConfig.provider);

        // If database has models for this provider
        if (providerModels.length > 0) {
            // Check if current model belongs to selected provider
            const currentModelValid = providerModels.some(m => m.name === config.modelConfig.model);
            if (!currentModelValid) {
                // Auto-select first model for this provider
                onConfigChange({
                    ...config,
                    modelConfig: {
                        ...config.modelConfig,
                        model: providerModels[0].name
                    }
                });
            }
        } else {
            // Fallback: use hardcoded defaults
            const defaultModels: Record<string, string> = {
                'openai': 'gpt-4o-2024-08-06',
                'groq': 'llama-3.3-70b-versatile',
                'anthropic': 'claude-3-5-sonnet-20241022',
                'gemini': 'gemini-1.5-pro-002'
            };
            const defaultModel = defaultModels[config.modelConfig.provider];
            if (defaultModel && config.modelConfig.model !== defaultModel) {
                onConfigChange({
                    ...config,
                    modelConfig: {
                        ...config.modelConfig,
                        model: defaultModel
                    }
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.modelConfig.provider, models.length]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="text-[#BB86FC]" size={28} />
                <h1 className="text-3xl font-bold text-[#E0E0E0]">Model Configuration</h1>
            </div>

            <div className="space-y-6">
                {/* Provider & Model Selection */}
                <div className="p-6 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A]">
                    <h3 className="text-lg font-semibold text-[#E0E0E0] mb-6">Provider & Model</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Provider Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Provider</label>
                            <select
                                value={config.modelConfig.provider}
                                onChange={(e) => handleChange('provider', e.target.value)}
                                className="w-full bg-[#121212] border border-[#2A2A2A] text-[#E0E0E0] rounded-lg px-4 py-3 focus:outline-none focus:border-[#BB86FC] focus:ring-1 focus:ring-[#BB86FC]"
                            >
                                {availableProviders.map(p => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Model</label>
                            <select
                                value={config.modelConfig.model}
                                onChange={(e) => handleChange('model', e.target.value)}
                                className="w-full bg-[#121212] border border-[#2A2A2A] text-[#E0E0E0] rounded-lg px-4 py-3 focus:outline-none focus:border-[#BB86FC] focus:ring-1 focus:ring-[#BB86FC]"
                            >
                                {loading ? (
                                    <option>Loading...</option>
                                ) : models.length > 0 ? (
                                    models
                                        .filter(m => m.provider === config.modelConfig.provider)
                                        .map(m => <option key={m.id} value={m.name}>{m.name}</option>)
                                ) : (
                                    // Fallback static options if DB is empty
                                    <>
                                        {config.modelConfig.provider === 'openai' && (
                                            <>
                                                <option value="gpt-4o-2024-08-06">GPT-4o (Pinned)</option>
                                                <option value="gpt-4o-mini-2024-07-18">GPT-4o Mini (Pinned)</option>
                                                <option value="o1-preview">o1 Preview</option>
                                                <option value="o1-mini">o1 Mini</option>
                                            </>
                                        )}
                                        {config.modelConfig.provider === 'groq' && (
                                            <>
                                                <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                                                <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Fast)</option>
                                                <option value="llama-3.2-1b-preview">Llama 3.2 1B Preview</option>
                                                <option value="llama-3.2-3b-preview">Llama 3.2 3B Preview</option>
                                            </>
                                        )}
                                        {config.modelConfig.provider === 'anthropic' && (
                                            <>
                                                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (New)</option>
                                                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                                            </>
                                        )}
                                        {config.modelConfig.provider === 'gemini' && (
                                            <>
                                                <option value="gemini-1.5-pro-002">Gemini 1.5 Pro-002</option>
                                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                                <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B</option>
                                            </>
                                        )}
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Parameters */}
                <div className="p-6 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A]">
                    <h3 className="text-lg font-semibold text-[#E0E0E0] mb-6">Model Parameters</h3>
                    <div className="space-y-6">
                        {/* Temperature */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Temperature</label>
                                <span className="text-sm text-[#BB86FC] font-mono bg-[#252525] px-3 py-1 rounded-lg">{config.modelConfig.temperature}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={config.modelConfig.temperature}
                                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                                className="w-full h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#BB86FC]"
                            />
                            <p className="text-xs text-[#A0A0A0]">Controls randomness. Lower values make output more focused and deterministic.</p>
                        </div>

                        {/* Max Tokens */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Max Tokens</label>
                                <span className="text-sm text-[#BB86FC] font-mono bg-[#252525] px-3 py-1 rounded-lg">{config.modelConfig.maxTokens}</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="128000"
                                step="100"
                                value={config.modelConfig.maxTokens}
                                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                                className="w-full h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#BB86FC]"
                            />
                            <p className="text-xs text-[#A0A0A0]">Maximum length of the generated response.</p>
                        </div>

                        {/* Top P */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">Top P</label>
                                <span className="text-sm text-[#BB86FC] font-mono bg-[#252525] px-3 py-1 rounded-lg">{config.modelConfig.topP}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={config.modelConfig.topP}
                                onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                                className="w-full h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#BB86FC]"
                            />
                            <p className="text-xs text-[#A0A0A0]">Nucleus sampling. Consider tokens with top_p probability mass.</p>
                        </div>
                    </div>
                </div>

                {/* Current Configuration Summary */}
                <div className="p-6 rounded-xl bg-[#252525] border border-[#2A2A2A]">
                    <h3 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider mb-4">Current Configuration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-[#A0A0A0]">Provider</p>
                            <p className="text-sm font-medium text-[#E0E0E0] mt-1">{config.modelConfig.provider}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#A0A0A0]">Model</p>
                            <p className="text-sm font-medium text-[#E0E0E0] mt-1">{config.modelConfig.model}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#A0A0A0]">Temperature</p>
                            <p className="text-sm font-medium text-[#E0E0E0] mt-1">{config.modelConfig.temperature}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#A0A0A0]">Max Tokens</p>
                            <p className="text-sm font-medium text-[#E0E0E0] mt-1">{config.modelConfig.maxTokens}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
