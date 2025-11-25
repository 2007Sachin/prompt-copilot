import { useState, Suspense, lazy } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import ModelConfigPage from './components/ModelConfigPage';
import Sidebar from './components/Sidebar';
import { PromptConfig, PromptRecord, APEVariant, PromptScore } from './types';
import { apeGenerateVariants, scorePromptLLM, generatePromptWithAI } from './lib/promptEngine';
import { savePrompt } from './lib/storage';
import techniquesData from './data/techniques.json';

// Lazy Load Heavy Components
const PromptHistory = lazy(() => import('./components/PromptHistory'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const UsageDashboard = lazy(() => import('./components/UsageDashboard'));

// Initial State
const INITIAL_CONFIG: PromptConfig = {
    useCase: techniquesData.useCases[0],
    technique: techniquesData.techniques[0],
    lengthMode: techniquesData.lengthModes[1],
    outputFormat: techniquesData.outputFormats[0],
    context: '',
    examples: [],
    constraints: '',
    persona: '',
    goal: '',
    modelConfig: {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        topP: 1,
        topK: 40,
        maxTokens: 8000
    }
};

interface MainAppProps {
    // Navigation State
    const [activePage, setActivePage] = useState("home");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const loadApiKeys = () => {
    const useCustomKeys = localStorage.getItem("use_custom_keys") === "true";

    const keys = {
        openai_key: useCustomKeys
            ? (localStorage.getItem("openai_key") || undefined)
            : (import.meta.env.VITE_OPENAI_API_KEY || undefined),

        groq_key: useCustomKeys
            ? (localStorage.getItem("groq_key") || undefined)
            : (import.meta.env.VITE_GROQ_API_KEY || undefined),

        anthropic_key: useCustomKeys
            ? (localStorage.getItem("anthropic_key") || undefined)
            : (import.meta.env.VITE_ANTHROPIC_API_KEY || undefined),

        google_key: useCustomKeys
            ? (localStorage.getItem("google_key") || undefined)
            : (import.meta.env.VITE_GEMINI_API_KEY || undefined)
    };
    return keys;
};

const showToastMessage = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
};

const handleGenerate = async () => {
    const apiKeys = loadApiKeys();
    const provider = config.modelConfig.provider;

    const keyMap: Record<string, string | undefined> = {
        'openai': apiKeys.openai_key,
        'groq': apiKeys.groq_key,
        'anthropic': apiKeys.anthropic_key,
        'gemini': apiKeys.google_key
    };

    const requiredKey = keyMap[provider];

    if (!requiredKey) {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        showToastMessage('error', `${providerName} API key is required. Please add it in Settings → API Keys.`);
        return;
    }

    setIsGenerating(true);

    try {
        // Use AI to generate the optimized prompt
        const { prompt, usage: genUsage } = await generatePromptWithAI(config, apiKeys);
        setGeneratedPrompt(prompt);

        // Save AI generation usage
        if (user?.id) {
            try {
                const { saveUsageSupabase } = await import('./lib/usage');
                await saveUsageSupabase(genUsage, user.id);
            } catch (err: any) {
                console.error("Failed to save generation usage:", err);
            }
        }

        // Save prompt to history
        if (user?.id) {
            try {
                const { savePromptSupabase } = await import('./lib/storage');
                const promptRecord = {
                    name: `${config.useCase.name} - ${new Date().toLocaleString()}`,
                    use_case: config.useCase,
                    technique: config.technique,
                    persona: config.persona,
                    length_mode: config.lengthMode,
                    output_format: config.outputFormat,
                    context: config.context,
                    final_prompt: prompt
                };
                await savePromptSupabase(promptRecord, user.id);
            } catch (saveErr: any) {
                // Saving is not critical
            }
        }

        // Score the AI-generated prompt
        setIsScoring(true);
        try {
            const { score, usage: scoreUsage } = await scorePromptLLM(prompt, config.modelConfig, apiKeys);
            setPromptScore(score);

            if (user?.id) {
                try {
                    const { saveUsageSupabase } = await import('./lib/usage');
                    await saveUsageSupabase(scoreUsage, user.id);
                } catch (err: any) {
                    console.error("Failed to save scoring usage:", err);
                }
            }
        } catch (err: any) {
            showToastMessage('error', "Failed to score prompt: " + err.message);
            setPromptScore(null);
        } finally {
            setIsScoring(false);
        }
    } catch (err: any) {
        showToastMessage('error', "Failed to generate prompt: " + err.message);
    } finally {
        setIsGenerating(false);
    }
};

const handleAPE = async () => {
    const apiKeys = loadApiKeys();
    const provider = config.modelConfig.provider;

    const keyMap: Record<string, string | undefined> = {
        'openai': apiKeys.openai_key,
        'groq': apiKeys.groq_key,
        'anthropic': apiKeys.anthropic_key,
        'gemini': apiKeys.google_key
    };

    const requiredKey = keyMap[provider];

    if (!requiredKey) {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        showToastMessage('error', `${providerName} API key is required for APE. Please add it in Settings → API Keys.`);
        return;
    }

    setIsGenerating(true);
    try {
        const variants = await apeGenerateVariants(config, apiKeys);
        setApeVariants(variants);
    } catch (err: any) {
        showToastMessage('error', "APE generation failed: " + err.message);
    } finally {
        setIsGenerating(false);
    }
};

const handleSave = () => {
    if (!generatedPrompt) return;

    const newPrompt: PromptRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        name: `${config.useCase.name} - ${config.technique.name}`,
        useCase: config.useCase,
        technique: config.technique,
        persona: config.persona,
        lengthMode: config.lengthMode,
        outputFormat: config.outputFormat,
        modelConfig: config.modelConfig,
        context: config.context,
        finalPrompt: generatedPrompt,
        createdAt: Date.now()
    };

    savePrompt(newPrompt);
    showToastMessage('success', "Prompt saved successfully");
};

const handleViewPrompt = (p: any) => {
    setConfig(prev => ({ ...prev, ...p }));
    setGeneratedPrompt(p.final_prompt || p.prompt_text || '');
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BB86FC]"></div>
    </div>
);

return (
    <div className="flex h-screen bg-[#121212] overflow-hidden">
        <Sidebar
            active={activePage}
            setActive={setActivePage}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
        />

        <div
            className="flex-1 flex flex-col transition-all duration-300"
            style={{ marginLeft: sidebarCollapsed ? '70px' : '240px' }}
        >
            {activePage === "home" && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
                    <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                        <InputSection
                            config={config}
                            onConfigChange={setConfig}
                            onGenerate={handleGenerate}
                            onAPE={handleAPE}
                            onSave={handleSave}
                            isGenerating={isGenerating}
                        />
                    </div>

                    <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                        <OutputSection
                            generatedPrompt={generatedPrompt}
                            isGenerating={isGenerating}
                            isScoring={isScoring}
                            promptScore={promptScore}
                            isMegaPrompt={config.technique.id === 'mega-prompt'}
                        />
                    </div>
                </div>
            )}

            {activePage === "modelconfig" && (
                <div className="flex-1 p-6 overflow-auto">
                    <ModelConfigPage
                        config={config}
                        onConfigChange={setConfig}
                    />
                </div>
            )}

            {activePage === "history" && (
                <div className="flex-1 p-6 overflow-auto">
                    <Suspense fallback={<LoadingFallback />}>
                        <PromptHistory onView={handleViewPrompt} userId={user?.id} />
                    </Suspense>
                </div>
            )}

            {activePage === "usage" && (
                <div className="flex-1 p-6 overflow-auto">
                    <Suspense fallback={<LoadingFallback />}>
                        <UsageDashboard user={user} />
                    </Suspense>
                </div>
            )}

            {activePage === "settings" && (
                <div className="flex-1 p-6 overflow-auto">
                    <Suspense fallback={<LoadingFallback />}>
                        <SettingsPage user={user} />
                    </Suspense>
                </div>
            )}
        </div>

        {/* Toast Notifications */}
        {toast && (
            <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50 ${toast.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'
                }`}>
                {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="font-medium">{toast.message}</span>
            </div>
        )}
    </div>
);
}

export default MainApp;
