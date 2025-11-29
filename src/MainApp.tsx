import { useState, Suspense, lazy, useRef } from 'react';
import { CheckCircle, AlertCircle, Menu, Sparkles } from 'lucide-react';
import { decryptData } from './lib/security';
import { PromptConfigSchema } from './lib/validation';

import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import ModelConfigPage from './components/ModelConfigPage';
import Sidebar from './components/Sidebar';
import { PromptConfig, PromptRecord, PromptScore } from './types';
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
    user?: any;
}

function MainApp({ user }: MainAppProps) {
    const [config, setConfig] = useState<PromptConfig>(INITIAL_CONFIG);
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
    const [promptScore, setPromptScore] = useState<PromptScore | null>(null);
    const [apeVariants, setApeVariants] = useState<APEVariant[] | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // UI State
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const isGeneratingRef = useRef(false);

    // Navigation State
    const [activePage, setActivePage] = useState("home");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const loadApiKeys = () => {
        const useCustomKeys = localStorage.getItem("use_custom_keys") === "true";

        const keys = {
            openai_key: useCustomKeys
                ? (decryptData(localStorage.getItem("openai_key") || "") || undefined)
                : (import.meta.env.VITE_OPENAI_API_KEY || undefined),

            groq_key: useCustomKeys
                ? (decryptData(localStorage.getItem("groq_key") || "") || undefined)
                : (import.meta.env.VITE_GROQ_API_KEY || undefined),

            anthropic_key: useCustomKeys
                ? (decryptData(localStorage.getItem("anthropic_key") || "") || undefined)
                : (import.meta.env.VITE_ANTHROPIC_API_KEY || undefined),

            google_key: useCustomKeys
                ? (decryptData(localStorage.getItem("google_key") || "") || undefined)
                : (import.meta.env.VITE_GEMINI_API_KEY || undefined)
        };
        return keys;
    };

    const showToastMessage = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleGenerate = async () => {
        if (isGeneratingRef.current) return;
        isGeneratingRef.current = true;

        // Validate Config
        const validationResult = PromptConfigSchema.safeParse(config);
        if (!validationResult.success) {
            const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
            showToastMessage('error', errorMessage);
            isGeneratingRef.current = false;
            return;
        }

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
            isGeneratingRef.current = false;
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
            isGeneratingRef.current = false;
        }
    };

    const handleAPE = async () => {
        if (isGeneratingRef.current) return;
        isGeneratingRef.current = true;

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
            isGeneratingRef.current = false;
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
            isGeneratingRef.current = false;
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
        <div className="flex h-screen bg-[#121212] overflow-hidden flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#121212] border-b border-[#2A2A2A] z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="bg-[#252525] p-1.5 rounded-lg">
                        <Sparkles className="text-[#BB86FC] w-5 h-5" />
                    </div>
                    <span className="font-bold text-[#E0E0E0] text-lg tracking-tight">PromptCopilot</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#1E1E1E] rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar
                active={activePage}
                setActive={setActivePage}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div
                className={`
                    flex-1 flex flex-col transition-all duration-300
                    pt-16 md:pt-0
                    ${sidebarCollapsed ? 'md:ml-[70px]' : 'md:ml-[240px]'}
                    ml-0
                `}
            >
                {activePage === "home" && (
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
                        <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                            <InputSection
                                config={config}
                                onConfigChange={setConfig}
                                onGenerate={handleGenerate}
                                isGenerating={isGenerating}
                                onAPE={handleAPE}
                                onSave={handleSave}
                            />
                        </div>
                        <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pl-2">
                            <OutputSection
                                generatedPrompt={generatedPrompt}
                                promptScore={promptScore}
                                isGenerating={isGenerating}
                                isScoring={isScoring}
                                onSave={handleSave}
                            />
                        </div>
                    </div>
                )}

                {activePage === "history" && (
                    <Suspense fallback={<LoadingFallback />}>
                        <PromptHistory onViewPrompt={handleViewPrompt} user={user} />
                    </Suspense>
                )}

                {activePage === "usage" && (
                    <Suspense fallback={<LoadingFallback />}>
                        <UsageDashboard user={user} />
                    </Suspense>
                )}

                {activePage === "modelconfig" && (
                    <ModelConfigPage
                        config={config}
                        setConfig={setConfig}
                    />
                )}

                {activePage === "settings" && (
                    <Suspense fallback={<LoadingFallback />}>
                        <SettingsPage />
                    </Suspense>
                )}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50 ${toast.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

export default MainApp;
