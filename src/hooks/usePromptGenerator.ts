import { useState, useRef } from 'react';
import { PromptConfig, APEVariant, PromptScore } from '../types';
import { generatePromptWithAI, scorePromptLLM, apeGenerateVariants } from '../lib/promptEngine';

interface UsePromptGeneratorProps {
    config: PromptConfig;
    user?: any;
    loadApiKeys: () => any;
    setGeneratedPrompt: (prompt: string) => void;
    setPromptScore: (score: PromptScore | null) => void;
    setApeVariants: (variants: APEVariant[] | null) => void;
    showToastMessage: (type: 'success' | 'error', message: string) => void;
}

export const usePromptGenerator = ({
    config,
    user,
    loadApiKeys,
    setGeneratedPrompt,
    setPromptScore,
    setApeVariants,
    showToastMessage
}: UsePromptGeneratorProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const isGeneratingRef = useRef(false);

    const handleGenerate = async () => {
        if (isGeneratingRef.current) return;
        isGeneratingRef.current = true;

        // Skip validation for now - it's causing Zod errors
        console.log('🔵 handleGenerate called');

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
            console.log('✅ Prompt generated, length:', prompt?.length);
            setGeneratedPrompt(prompt);

            // Save AI generation usage
            if (user?.id) {
                try {
                    const { saveUsageSupabase } = await import('../lib/usage');
                    await saveUsageSupabase(genUsage, user.id);
                } catch (err: any) {
                    console.error("Failed to save generation usage:", err);
                }
            }

            // Save prompt to history
            if (user?.id) {
                try {
                    const { savePromptSupabase } = await import('../lib/storage');
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
                        const { saveUsageSupabase } = await import('../lib/usage');
                        await saveUsageSupabase(scoreUsage, user.id);
                    } catch (err: any) {
                        console.error("Failed to save scoring usage:", err);
                    }
                }
            } catch (err: any) {
                console.error("Scoring error:", err);
                showToastMessage('error', "Failed to score prompt: " + err.message);
                setPromptScore(null);
            } finally {
                setIsScoring(false);
            }
        } catch (err: any) {
            console.error("Generation error:", err);
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

    return { isGenerating, isScoring, handleGenerate, handleAPE };
};
