import { PromptConfig, PromptRecord } from '../types';
import { savePrompt } from '../lib/storage';

interface UsePromptHistoryProps {
    config: PromptConfig;
    setConfig: (config: PromptConfig | ((prev: PromptConfig) => PromptConfig)) => void;
    generatedPrompt: string;
    setGeneratedPrompt: (prompt: string) => void;
    setActivePage: (page: string) => void;
    showToastMessage: (type: 'success' | 'error', message: string) => void;
}

export const usePromptHistory = ({
    config,
    setConfig,
    generatedPrompt,
    setGeneratedPrompt,
    setActivePage,
    showToastMessage
}: UsePromptHistoryProps) => {

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

    return { handleSave, handleViewPrompt };
};
