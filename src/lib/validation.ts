import { z } from 'zod';

export const UseCaseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    template: z.string(),
});

export const TechniqueSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    description: z.string(),
    template: z.string(),
    recommendedConfig: z.record(z.any()).optional(),
    supportsExamples: z.boolean().optional(),
    supportsSchema: z.boolean().optional(),
});

export const LengthModeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    modifier: z.string(),
    recommendedTokens: z.number(),
    recommendedConfig: z.record(z.any()).optional(),
});

export const OutputFormatSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    template: z.string(),
    exampleSchema: z.string().optional(),
});

export const ModelConfigSchema = z.object({
    provider: z.enum(["openai", "groq", "anthropic", "gemini"]),
    model: z.string().min(1, "Model name is required"),
    temperature: z.number().min(0, "Temperature must be at least 0").max(2, "Temperature must be at most 2"),
    topP: z.number().min(0, "Top P must be at least 0").max(1, "Top P must be at most 1"),
    topK: z.number().min(0, "Top K must be at least 0"),
    maxTokens: z.number().min(1, "Max Tokens must be at least 1").max(128000, "Max Tokens cannot exceed 128,000"),
});

export const ExampleSchema = z.object({
    id: z.string(),
    input: z.string(),
    output: z.string(),
});

export const PromptConfigSchema = z.object({
    useCase: UseCaseSchema,
    technique: TechniqueSchema,
    lengthMode: LengthModeSchema,
    outputFormat: OutputFormatSchema,
    context: z.string().max(20000, "Context cannot exceed 20,000 characters"),
    examples: z.array(ExampleSchema),
    constraints: z.string(),
    persona: z.string(),
    goal: z.string(),
    schema: z.string().optional(),
    modelConfig: ModelConfigSchema,
});
