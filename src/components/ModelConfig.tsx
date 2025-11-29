import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { PromptConfig } from '../types';

interface ModelConfigProps {
    config: PromptConfig;
    onConfigChange: (config: PromptConfig) => void;
    isOpen: boolean;
    onToggle: () => void;
    sidebarCollapsed: boolean;
}

interface Model {
    id: string;
    name: string;
    provider: string;
    description?: string;
}

// Comprehensive fallback list of models available as of late 2024/2025
const DEFAULT_MODELS: Record<string, Model[]> = {
    openai: [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Flagship, high-intelligence model' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Fast, cost-efficient model' },
        { id: 'o1-preview', name: 'o1 Preview', provider: 'openai', description: 'Advanced reasoning capability' },
        { id: 'o1-mini', name: 'o1 Mini', provider: 'openai', description: 'Fast reasoning capability' },
    ],
    anthropic: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (New)', provider: 'anthropic', description: 'Most intelligent & balanced model' },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', description: 'Fastest, most compact model' },
    ],
    groq: [
        { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', provider: 'groq', description: 'High performance open model' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'groq', description: 'Ultra-fast open model' },
        { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B (Vision)', provider: 'groq', description: 'Multimodal vision capabilities' },
        { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B (Vision)', provider: 'groq', description: 'Efficient vision model' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', description: 'High quality MoE model' },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'groq', description: 'Google\'s open model' },
    ],
    gemini: [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', description: 'Complex reasoning, 2M context' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', description: 'Fast, multimodal, 1M context' },
        { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B', provider: 'gemini', description: 'High volume, lower intelligence' },
    ]
};

export default function ModelConfig({ config, onConfigChange, isOpen, onToggle, sidebarCollapsed }: ModelConfigProps) {
    // Flatten default models into a single array
    const effectiveModels = Object.values(DEFAULT_MODELS).flat();

    const providers = Array.from(new Set(effectiveModels.map(m => m.provider)));

    const currentProviderModels = effectiveModels.filter(m => m.provider === config.modelConfig.provider);

    const handleChange = (key: keyof typeof config.modelConfig, value: any) => {
        // When provider changes, automatically select the first available model for that provider
        if (key === 'provider') {
            const firstModelOfProvider = effectiveModels.find(m => m.provider === value);
            onConfigChange({
                ...config,
                modelConfig: {
                    ...config.modelConfig,
                    provider: value,
                    model: firstModelOfProvider ? firstModelOfProvider.id : ''
                }
            });
        } else {
            onConfigChange({
                ...config,
                modelConfig: {
                    ...config.modelConfig,
                    [key]: value
                }
            });
        }
    };

    return (
        <div
            className={`fixed bottom-0 right-0 bg-[#1E1E1E] border-t border-[#2A2A2A] transition-all duration-300 z-40 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}
            style={{ left: sidebarCollapsed ? '70px' : '240px' }}
        >
            {/* Toggle Header */}
            <button
                onClick={onToggle}
                className="w-full h-12 flex items-center justify-between px-6 hover:bg-[#252525] transition-colors group"
            >
                <div className="flex items-center gap-2 text-[#E0E0E0] font-medium">
                    <Settings size={18} className="text-[#BB86FC]" />
                    <span>Model Configuration</span>
                    <span className="text-[#A0A0A0] text-sm ml-2 hidden sm:inline-block">
                        ({config.modelConfig.provider} / {config.modelConfig.model})
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown size={20} className="text-[#A0A0A0]" /> : <ChevronUp size={20} className="text-[#A0A0A0]" />}
                </div>
            </button>

            {/* Config Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Provider Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Provider</label>
                    <select
                        value={config.modelConfig.provider}
                        onChange={(e) => handleChange('provider', e.target.value)}
                        className="w-full bg-[#121212] border border-[#2A2A2A] text-[#E0E0E0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#BB86FC] focus:ring-1 focus:ring-[#BB86FC]"
                    >
                        {providers.map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Model</label>
                    <select
                        value={config.modelConfig.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                        className="w-full bg-[#121212] border border-[#2A2A2A] text-[#E0E0E0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#BB86FC] focus:ring-1 focus:ring-[#BB86FC]"
                    >
                        {currentProviderModels.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                    {/* Helper text showing description of selected model */}
                    <p className="text-[10px] text-[#808080] truncate h-4">
                        {currentProviderModels.find(m => m.id === config.modelConfig.model)?.description}
                    </p>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Temperature</label>
                        <span className="text-xs text-[#BB86FC] font-mono">{config.modelConfig.temperature}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.modelConfig.temperature}
                        onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#BB86FC]"
                    />
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Max Tokens</label>
                        <span className="text-xs text-[#BB86FC] font-mono">{config.modelConfig.maxTokens}</span>
                    </div>
                    <input
                        type="range"
                        min="100"
                        max="128000" 
                        step="100"
                        value={config.modelConfig.maxTokens}
                        onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                        className="w-full h-1 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#BB86FC]"
                    />
                     <div className="flex justify-between text-[10px] text-[#666]">
                        <span>100</span>
                        <span>128k</span>
                    </div>
                </div>
            </div>
        </div>
    );
}