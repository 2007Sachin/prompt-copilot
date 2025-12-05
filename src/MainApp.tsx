import { useState, useEffect, Suspense, lazy } from 'react';
import { CheckCircle, AlertCircle, Menu, Sparkles } from 'lucide-react';
import { decryptData } from './lib/security';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import APESection from './components/APESection';
import ModelConfigPage from './components/ModelConfigPage';
import Sidebar from './components/Sidebar';
import { PromptConfig, PromptScore, APEVariant, ChainStep } from './types';
import { generatePromptWithAI, runPromptLLM } from './lib/promptEngine';
import { usePromptGenerator } from './hooks/usePromptGenerator';
import { usePromptHistory } from './hooks/usePromptHistory';
import techniquesData from './data/techniques.json';
import { checkBackendHealth } from './lib/connectionCheck';

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
    const [testValues, setTestValues] = useState<string[]>(['', '', '']);
    const [testResults, setTestResults] = useState<string[] | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Prompt Chaining State
    const [mode, setMode] = useState<'single' | 'chain'>('single');
    const [chainSteps, setChainSteps] = useState<ChainStep[]>([]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [chainResults, setChainResults] = useState<string[]>([]);

    const [activePage, setActivePage] = useState("home");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Check backend health on mount
    useEffect(() => {
        const verifyBackend = async () => {
            const health = await checkBackendHealth();
            if (health.status === 'offline') {
                setToast({
                    type: 'error',
                    message: `Backend Disconnected: ${health.error || 'Check Supabase Credentials'}`
                });
            }
        };
        verifyBackend();
    }, []);

    const handleModeSwitch = (newMode: 'single' | 'chain') => {
        if (newMode === 'chain' && chainSteps.length === 0) {
            setChainSteps([{
                ...config,
                id: Date.now().toString(),
                stepName: 'Step 1'
            }]);
            setActiveStepIndex(0);
        }
        setMode(newMode);
    };

    const handleAddStep = () => {
        const newStep: ChainStep = {
            ...config,
            id: Date.now().toString(),
            stepName: `Step ${chainSteps.length + 1}`,
            context: ''
        };
        setChainSteps([...chainSteps, newStep]);
        setActiveStepIndex(chainSteps.length);
    };

    const handleDeleteStep = (index: number) => {
        if (chainSteps.length <= 1) return;

        const updatedSteps = chainSteps.filter((_, i) => i !== index);
        setChainSteps(updatedSteps);

        if (activeStepIndex >= updatedSteps.length) {
            setActiveStepIndex(Math.max(0, updatedSteps.length - 1));
        } else if (activeStepIndex > index) {
            setActiveStepIndex(activeStepIndex - 1);
        }
    };

    const handleClearChain = () => {
        setChainSteps([{
            ...config,
            id: Date.now().toString(),
            stepName: 'Step 1',
            context: ''
        }]);
        setActiveStepIndex(0);
        setChainResults([]);
    };

    const handleChainConfigChange = (newConfig: PromptConfig) => {
        if (mode === 'single') {
            setConfig(newConfig);
        } else {
            const updatedSteps = [...chainSteps];
            updatedSteps[activeStepIndex] = {
                ...updatedSteps[activeStepIndex],
                ...newConfig
            };
            setChainSteps(updatedSteps);
        }
    };

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

    const { isGenerating, isScoring, handleGenerate, handleAPE } = usePromptGenerator({
        config,
        user,
        loadApiKeys,
        setGeneratedPrompt,
        setPromptScore,
        setApeVariants,
        showToastMessage,
        testValues,
        setTestResults
    });

    const handleChainExecute = async () => {
        if (chainSteps.length === 0) return;

        const results: string[] = [];
        const apiKeys = loadApiKeys();

        setChainResults([]);

        try {
            for (let i = 0; i < chainSteps.length; i++) {
                const step = chainSteps[i];
                let currentContext = step.context;

                for (let j = 0; j < results.length; j++) {
                    const placeholder = `{{STEP_${j + 1}_OUTPUT}}`;
                    if (currentContext.includes(placeholder)) {
                        currentContext = currentContext.replace(new RegExp(placeholder, 'g'), results[j]);
                    }
                }

                const stepConfig = { ...step, context: currentContext };
                const { prompt } = await generatePromptWithAI(stepConfig, apiKeys);
                const { outputText } = await runPromptLLM(prompt, step.modelConfig, apiKeys);

                results.push(outputText);
                setChainResults([...results]);
            }

            showToastMessage('success', 'Workflow completed successfully!');
        } catch (error: any) {
            console.error("Chain execution failed:", error);
            showToastMessage('error', `Workflow failed: ${error.message}`);
        }
    };

    const onGenerateClick = async () => {
        if (mode === 'chain') {
            await handleChainExecute();
        } else {
            await handleGenerate();
        }
    };

    const { handleSave, handleViewPrompt } = usePromptHistory({
        config,
        setConfig,
        generatedPrompt,
        setGeneratedPrompt,
        setActivePage,
        showToastMessage
    });

    const handleApplyVariant = (variant: APEVariant) => {
        setGeneratedPrompt(variant.prompt);
        showToastMessage('success', "Applied " + variant.meta.variation + " variant");
    };

    const handleSelectAPEVariant = (variant: APEVariant) => {
        setGeneratedPrompt(variant.prompt);
        setPromptScore(variant.score);
        showToastMessage('success', `Selected ${variant.meta.variation} variant`);
    };

    const handleGenerateSchema = async (context: string): Promise<string> => {
        if (!context.trim()) {
            showToastMessage('error', 'Please add some context first to auto-generate a schema.');
            return '';
        }

        const metaPrompt = `Analyze the following task context and generate a valid, optimal JSON schema to structure the output. The schema should be practical and directly usable.

Context:
${context}

Requirements:
- Return ONLY the JSON schema code, no markdown formatting
- Use appropriate field names based on the task
- Include array structures if the output will have multiple items
- Keep it simple but comprehensive

Return the JSON schema now:`

        try {
            const apiKeys = loadApiKeys();
            const { outputText } = await runPromptLLM(metaPrompt, config.modelConfig, apiKeys);

            // Clean up the response - remove any markdown artifacts
            let cleanedSchema = outputText.trim();
            if (cleanedSchema.startsWith('```json')) {
                cleanedSchema = cleanedSchema.slice(7);
            }
            if (cleanedSchema.startsWith('```')) {
                cleanedSchema = cleanedSchema.slice(3);
            }
            if (cleanedSchema.endsWith('```')) {
                cleanedSchema = cleanedSchema.slice(0, -3);
            }

            showToastMessage('success', 'Schema generated successfully!');
            return cleanedSchema.trim();
        } catch (error: any) {
            console.error('Schema generation failed:', error);
            showToastMessage('error', `Failed to generate schema: ${error.message}`);
            return '';
        }
    };

    const LoadingFallback = () => (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const activeConfig = mode === 'single' ? config : (chainSteps[activeStepIndex] || config);

    return (
        <div className="flex h-screen overflow-hidden flex-col md:flex-row bg-background">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 p-3">
                <div className="bg-surface/80 backdrop-blur-md border border-border rounded-2xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-xl">
                            <Sparkles className="text-white w-4 h-4" />
                        </div>
                        <span className="font-bold text-text-main text-base tracking-tight">
                            Prompt<span className="text-primary">Copilot</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 text-text-muted hover:text-text-main hover:bg-surface-highlight rounded-xl transition-colors"
                    >
                        <Menu size={22} />
                    </button>
                </div>
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
                    pt-20 md:pt-0
                    ${sidebarCollapsed ? 'md:ml-[78px]' : 'md:ml-[260px]'}
                    ml-0
                `}
            >
                {activePage === "home" && (
                    <>
                        {/* Header - Glass Effect */}
                        <header className="hidden md:flex m-4 mb-0 rounded-2xl bg-surface/50 backdrop-blur-md border border-border px-6 py-4 items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-bold tracking-widest">
                                    <span className="text-gradient">PROMPT</span>
                                    <span className="text-text-main ml-2">CO PILOT</span>
                                </h1>
                                {/* Beta Badge */}
                                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Beta
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Mode Switch */}
                                <div className="bg-surface-highlight border border-border rounded-xl p-1 flex">
                                    <button
                                        onClick={() => handleModeSwitch('single')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${mode === 'single'
                                            ? 'bg-primary text-white'
                                            : 'text-text-muted hover:text-text-main'
                                            }`}
                                    >
                                        Single
                                    </button>
                                    <button
                                        onClick={() => handleModeSwitch('chain')}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${mode === 'chain'
                                            ? 'bg-primary text-white'
                                            : 'text-text-muted hover:text-text-main'
                                            }`}
                                    >
                                        Workflow
                                    </button>
                                </div>

                                {/* Model Indicator */}
                                <div className="bg-surface-highlight border border-border rounded-xl px-4 py-2.5 flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-2 h-2 rounded-full bg-success" />
                                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping opacity-75" />
                                    </div>
                                    <span className="text-xs font-mono text-text-muted uppercase tracking-wide">
                                        {config.modelConfig.provider} / {config.modelConfig.model}
                                    </span>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
                            {/* Input Section */}
                            <div className="flex-[2] overflow-hidden">
                                <InputSection
                                    config={activeConfig}
                                    onConfigChange={handleChainConfigChange}
                                    onGenerate={onGenerateClick}
                                    isGenerating={isGenerating}
                                    onAPE={handleAPE}
                                    onSave={handleSave}
                                    onShowToast={showToastMessage}
                                    testValues={testValues}
                                    setTestValues={setTestValues}
                                    mode={mode}
                                    chainSteps={chainSteps}
                                    activeStepIndex={activeStepIndex}
                                    onStepChange={setActiveStepIndex}
                                    onAddStep={handleAddStep}
                                    onDeleteStep={handleDeleteStep}
                                    onClearChain={handleClearChain}
                                    onGenerateSchema={handleGenerateSchema}
                                />
                            </div>

                            {/* Output Section */}
                            <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                                <OutputSection
                                    generatedPrompt={generatedPrompt}
                                    promptScore={promptScore}
                                    isGenerating={isGenerating}
                                    isScoring={isScoring}
                                    onSave={handleSave}
                                    apeVariants={apeVariants}
                                    onApplyVariant={handleApplyVariant}
                                    onAPE={handleAPE}
                                    testResults={testResults}
                                    chainResults={chainResults}
                                    mode={mode}
                                />
                                {apeVariants && apeVariants.length > 0 && (
                                    <APESection
                                        variants={apeVariants}
                                        onSelect={handleSelectAPEVariant}
                                        onRerun={handleAPE}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activePage === "history" && (
                    <div className="flex-1 p-6 overflow-hidden h-full">
                        <Suspense fallback={<LoadingFallback />}>
                            <PromptHistory onView={handleViewPrompt} userId={user?.id} />
                        </Suspense>
                    </div>
                )}

                {activePage === "usage" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <Suspense fallback={<LoadingFallback />}>
                            <UsageDashboard user={user} />
                        </Suspense>
                    </div>
                )}

                {activePage === "modelconfig" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <ModelConfigPage
                            config={config}
                            onConfigChange={setConfig}
                        />
                    </div>
                )}

                {activePage === "settings" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <Suspense fallback={<LoadingFallback />}>
                            <SettingsPage />
                        </Suspense>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in z-50 border ${toast.type === 'success'
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-error/10 text-error border-error/20'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

export default MainApp;
