// PromptCopilot TypeScript Definitions

export interface UseCase {
    id: string;
    name: string;
    description: string;
    template: string;
}

export interface Technique {
    id: string;
    name: string;
    category: string;
    description: string;
    template: string;
    recommendedConfig?: Partial<ModelConfig>;
    supportsExamples?: boolean;
    supportsSchema?: boolean;
}

export interface LengthMode {
    id: string;
    name: string;
    description: string;
    modifier: string;
    recommendedTokens: number;
    recommendedConfig?: Partial<ModelConfig>;
}

export interface SchemaPreset {
    id: string;
    name: string;
    schema: string;
}

export interface OutputFormat {
    id: string;
    name: string;
    description: string;
    template: string;
    exampleSchema?: string;
    presets?: SchemaPreset[];
}

export interface ModelConfig {
    provider: "openai" | "groq" | "anthropic" | "gemini";
    model: string;
    temperature: number;
    topP: number;
    topK: number;
    maxTokens: number;
}

export interface Example {
    id: string;
    input: string;
    output: string;
}

export interface PromptConfig {
    useCase: UseCase;
    technique: Technique;
    lengthMode: LengthMode;
    outputFormat: OutputFormat;
    context: string;
    examples: Example[];
    constraints: string;
    persona: string;
    goal: string;
    schema?: string;
    modelConfig: ModelConfig;
}

export interface ChainStep extends PromptConfig {
    id: string;
    stepName: string;
}

export interface PromptRecord {
    id: string;
    name: string;
    useCase: UseCase;
    technique: Technique;
    persona: string;
    lengthMode: LengthMode;
    outputFormat: OutputFormat;
    modelConfig: ModelConfig;
    context: string;
    finalPrompt: string;
    chatHistory?: { role: 'user' | 'assistant'; content: string; timestamp: number }[];
    createdAt: number;
    // Workflow support
    type?: 'single' | 'workflow';
    chainSteps?: ChainStep[];
    // Test suite support
    testCases?: string[];
    // DB mapping fields (snake_case for Supabase)
    chain_config?: any;
    test_config?: any;
}

export interface PromptScore {
    total: number;
    clarity: number;
    specificity: number;
    structure: number;
    // Legacy fields to keep compatibility if needed, or remove if unused
    schemaPresence?: number;
    lengthScore?: number;
    clarityScore?: number;
    constraintRespect?: number;
    structureScore?: number;
    hallucinationRisk?: number;
}

export interface APEVariant {
    id: string;
    prompt: string;
    score: PromptScore;
    meta: {
        variation: string;
        technique: string;
    };
}

export interface ModelOutput {
    adapter: string;
    output: string;
    tokens: number;
    cost: number;
    latency: number;
}

export interface ComparisonResult {
    outputs: ModelOutput[];
    consensus: string[];
    diffs: string[];
}

export interface TechniquesData {
    useCases: UseCase[];
    techniques: Technique[];
    lengthModes: LengthMode[];
    outputFormats: OutputFormat[];
}

export type TabType = 'preview' | 'output' | 'compare';
