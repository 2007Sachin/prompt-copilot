import { PromptConfig, APEVariant, PromptScore, ModelOutput, ComparisonResult, ModelConfig } from '../types';
import OpenAI from "openai";
import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_MODEL_CONFIG } from './constants';

// Helper to calculate cost (mock rates)
const COST_PER_1K_TOKENS = {
    'gpt-4': 0.03,
    'claude-3-opus': 0.015,
    'claude-3-sonnet': 0.003,
    'gpt-3.5-turbo': 0.0005,
    'llama-3-70b': 0.0008
};

export const buildPrompt = (config: PromptConfig): string => {
    const {
        useCase,
        technique,
        lengthMode,
        outputFormat,
        context,
        examples,
        constraints,
        persona,
        goal,
        schema
    } = config;

    // 1. Assemble the base structure
    let promptParts = [
        useCase.template,
        technique.template,
        lengthMode.modifier,
        outputFormat.template
    ];

    let fullPrompt = promptParts.join('\n\n');

    // 2. Inject Examples (Few-Shot)
    if (examples && examples.length > 0 && technique.supportsExamples) {
        const examplesText = examples.map((ex, i) =>
            `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`
        ).join('\n\n');
        fullPrompt = fullPrompt.replace('[[EXAMPLES]]', examplesText);
    } else {
        fullPrompt = fullPrompt.replace('[[EXAMPLES]]', '');
    }

    // 3. Inject Schema
    if (schema && outputFormat.id === 'json') {
        fullPrompt = fullPrompt.replace('[[SCHEMA]]', schema);
    } else if (technique.supportsSchema && schema) {
        fullPrompt = fullPrompt.replace('[[SCHEMA]]', schema);
    } else {
        fullPrompt = fullPrompt.replace('[[SCHEMA]]', outputFormat.exampleSchema || '');
    }

    // 4. Replace placeholders
    fullPrompt = fullPrompt
        .replace(/\[\[CONTEXT\]\]/g, context || 'No specific context provided.')
        .replace(/\[\[PERSONA\]\]/g, persona || 'assistant')
        .replace(/\[\[ROLE\]\]/g, persona || 'assistant')
        .replace(/\[\[CONSTRAINTS\]\]/g, constraints || 'None')
        .replace(/\[\[GOAL\]\]/g, goal || 'Complete the task effectively');

    return fullPrompt.trim();
};

/**
 * Generate an optimized prompt using AI based on user inputs
 * ALWAYS uses SYSTEM_MODEL_CONFIG (Groq top model) for consistent quality
 */
export const generatePromptWithAI = async (
    config: PromptConfig,
    apiKeys: APIKeys
): Promise<{ prompt: string; usage: UsageData }> => {
    const { useCase, technique, context, persona, goal, constraints, lengthMode, outputFormat, examples, schema } = config;

    // Build a meta-prompt that instructs the AI to create an optimized prompt
    const metaPrompt = `You are an expert prompt engineer. Create a high-quality, optimized prompt based on the following inputs:

**Use Case**: ${useCase.name} - ${useCase.description}
**Context/Task**: ${context || 'Not specified'}
**Persona/Role**: ${persona || 'Not specified'}
**Goal**: ${goal || 'Not specified'}
**Constraints**: ${constraints || 'None'}
**Technique**: ${technique.name} - ${technique.description}
**Length Mode**: ${lengthMode.name}
**Output Format**: ${outputFormat.name}
${examples && examples.length > 0 ? `**Examples**:\n${examples.map((ex, i) => `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`).join('\n\n')}` : ''}
${schema ? `**Output Schema**: ${schema}` : ''}

Generate a ${lengthMode.name.toLowerCase()} prompt that:
1. Incorporates the ${technique.name} technique
2. Is optimized for ${useCase.name}
3. Clearly defines the role/persona${persona ? ` as "${persona}"` : ''}
4. Specifies the desired output format (${outputFormat.name})
5. Is well-structured, clear, and specific

Return ONLY the optimized prompt text, nothing else.`;

    // Use SYSTEM_MODEL_CONFIG (Groq top model) for generation - ensures consistent quality
    const systemConfig = SYSTEM_MODEL_CONFIG;

    try {
        // Verify Groq key is available for system operations
        if (!apiKeys.groq_key) {
            throw new Error("Groq API key is required for AI generation features. Please add it in API Settings.");
        }

        // Use the system top model for generation
        const response = await runPromptLLM(metaPrompt, systemConfig, apiKeys);

        return {
            prompt: response.outputText.trim(),
            usage: response.usage
        };
    } catch (error: any) {
        console.error("AI prompt generation error:", error);
        // Fallback to template-based if AI fails
        return {
            prompt: buildPrompt(config),
            usage: {
                provider: systemConfig.provider,
                model: systemConfig.model,
                prompt_tokens: 0,
                response_tokens: 0,
                total_tokens: 0,
                cost: 0,
                metadata: { fallback: true, error: error.message }
            }
        };
    }
};


export const calculateHeuristicScore = (prompt: string, config: PromptConfig): PromptScore => {
    let clarity = 0;
    let specificity = 0;
    let structure = 0;

    // Clarity: Based on length and readability
    const wordCount = prompt.split(/\s+/).length;
    if (wordCount > 20) clarity += 10;
    if (wordCount > 50) clarity += 10;
    if (prompt.includes('?')) clarity += 5;
    if (prompt.toLowerCase().includes('please') || prompt.toLowerCase().includes('ensure')) clarity += 5;

    // Specificity: Based on detail and examples
    if (config.context && config.context.length > 20) specificity += 10;
    if (config.examples && config.examples.length > 0) specificity += 10;
    if (config.constraints) specificity += 5;
    if (config.goal) specificity += 5;

    // Structure: Based on formatting and organization
    const lines = prompt.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 3) structure += 10;
    if (lines.length > 5) structure += 10;
    if (prompt.includes('1.') || prompt.includes('-')) structure += 10;
    if (config.technique.id === 'cot' || config.technique.id === 'mega_prompt') structure += 10;

    return {
        clarity: Math.min(clarity, 30),
        specificity: Math.min(specificity, 30),
        structure: Math.min(structure, 40),
        total: Math.min(clarity + specificity + structure, 100)
    };
};

/**
 * APE (Automatic Prompt Engineering) - Generate prompt variants
 * ALWAYS uses SYSTEM_MODEL_CONFIG for consistent, high-quality variants
 */
export const apeGenerateVariants = async (config: PromptConfig, apiKeys: APIKeys): Promise<APEVariant[]> => {
    const basePrompt = buildPrompt(config);
    const variants: APEVariant[] = [];

    // Verify Groq key is available for system operations
    if (!apiKeys.groq_key) {
        throw new Error("Groq API key is required for APE features. Please add it in API Settings.");
    }

    const styles = [
        {
            name: "Mega Prompt (Comprehensive)",
            instruction: "Rewrite this prompt into a massive, comprehensive 'Mega Prompt' (50+ lines). Include detailed persona, context, constraints, and step-by-step instructions. Be exhaustive."
        },
        {
            name: "Chain of Thought (Reasoning)",
            instruction: "Rewrite this prompt to strictly enforce Chain of Thought reasoning. The model must explain its logic step-by-step before answering."
        },
        {
            name: "Clear & Structured",
            instruction: "Optimize this prompt for maximum clarity and structure. Use markdown headers and bullet points to organize instructions."
        }
    ];

    // Use SYSTEM_MODEL_CONFIG for all APE generations
    const systemConfig = SYSTEM_MODEL_CONFIG;

    for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        const metaPrompt = `You are an expert prompt engineer.
        
Your task: ${style.instruction}

Original Prompt:
"""
${basePrompt}
"""

Return ONLY the rewritten prompt text. Do not include any conversational filler.`;

        try {
            const { outputText } = await runPromptLLM(metaPrompt, systemConfig, apiKeys);
            const score = calculateHeuristicScore(outputText, config);

            variants.push({
                id: `variant-${i}`,
                prompt: outputText.trim(),
                score,
                meta: {
                    variation: style.name,
                    technique: config.technique.name
                }
            });
        } catch (e) {
            console.error(`Failed to generate variant ${i}`, e);
            variants.push({
                id: `variant-${i}-fallback`,
                prompt: basePrompt + `\n\n[Failed to generate AI variant: ${style.name}]`,
                score: calculateHeuristicScore(basePrompt, config),
                meta: { variation: "Fallback", technique: "Error" }
            });
        }
    }

    return variants;
};

export const runMockModel = async (
    adapterName: string,
    prompt: string,
    config: ModelConfig
): Promise<ModelOutput> => {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

    const wordCount = prompt.split(/\s+/).length;
    const outputTokens = Math.min(config.maxTokens, Math.floor(wordCount * 0.8) + 50);
    const costRate = COST_PER_1K_TOKENS[adapterName as keyof typeof COST_PER_1K_TOKENS] || 0.001;

    let outputText = `[${adapterName.toUpperCase()} OUTPUT]\n`;
    outputText += `Based on your request (Temperature: ${config.temperature}):\n\n`;

    const hash = prompt.length % 3;
    if (hash === 0) {
        outputText += "Here is the analysis you requested. The key factors are...\n1. Primary Driver\n2. Secondary Impact\n3. Conclusion";
    } else if (hash === 1) {
        outputText += "Sure, I can help with that. \n\n```json\n{\n  \"status\": \"success\",\n  \"data\": \"processed\"\n}\n```";
    } else {
        outputText += "Let's break this down step by step.\n- First, we identify the core issue.\n- Second, we apply the constraints.\n- Finally, we generate the solution.";
    }

    return {
        adapter: adapterName,
        output: outputText,
        tokens: outputTokens,
        cost: (outputTokens / 1000) * costRate,
        latency: 500 + Math.random() * 1000
    };
};


export const compareModelOutputs = (outputs: ModelOutput[]): ComparisonResult => {
    const consensus = ["Common theme identified across models.", "Agreement on primary constraints."];
    const diffs = outputs.map(o => `Model ${o.adapter} emphasized specific nuances.`);

    return {
        outputs,
        consensus,
        diffs
    };
};

interface APIKeys {
    openai_key?: string;
    groq_key?: string;
    anthropic_key?: string;
    google_key?: string;
}

interface UsageData {
    provider: string;
    model: string;
    prompt_tokens: number;
    response_tokens: number;
    total_tokens: number;
    cost: number;
    metadata: any;
}

interface LLMResponse {
    outputText: string;
    usage: UsageData;
}

export async function runPromptLLM(
    finalPrompt: string,
    modelConfig: ModelConfig,
    apiKeys: APIKeys
): Promise<LLMResponse> {
    const { provider, model, temperature, maxTokens } = modelConfig;
    let text = "";
    let usage: UsageData = {
        provider,
        model,
        prompt_tokens: 0,
        response_tokens: 0,
        total_tokens: 0,
        cost: 0,
        metadata: {}
    };

    try {
        if (provider === "openai") {
            const apiKey = apiKeys.openai_key;
            if (!apiKey) throw new Error("OpenAI API key not found. Please add it in API Settings.");

            const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
            const response = await client.chat.completions.create({
                model,
                messages: [{ role: "user", content: finalPrompt }],
                temperature,
                max_tokens: maxTokens
            });
            text = response.choices[0].message.content || "";
            if (response.usage) {
                usage.prompt_tokens = response.usage.prompt_tokens;
                usage.response_tokens = response.usage.completion_tokens;
                usage.total_tokens = response.usage.total_tokens;
                usage.metadata.openai = response.usage;
            }
        } else if (provider === "groq") {
            const apiKey = apiKeys.groq_key;
            console.log('🔍 Groq API Key in runPromptLLM:', {
                exists: !!apiKey,
                type: typeof apiKey,
                value: apiKey ? (apiKey.substring(0, 10) + '...' + apiKey.slice(-4)) : 'undefined/null'
            });
            if (!apiKey) throw new Error("Groq API key not found. Please add it in API Settings.");

            const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
            const response = await client.chat.completions.create({
                model,
                messages: [{ role: "user", content: finalPrompt }],
                temperature,
                max_tokens: maxTokens
            });
            text = response.choices[0].message.content || "";
            if (response.usage) {
                usage.prompt_tokens = response.usage.prompt_tokens;
                usage.response_tokens = response.usage.completion_tokens;
                usage.total_tokens = response.usage.total_tokens;
                usage.metadata.groq = response.usage;
            }
        } else if (provider === "anthropic") {
            const apiKey = apiKeys.anthropic_key;
            if (!apiKey) throw new Error("Anthropic API key not found. Please add it in API Settings.");

            const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
            const response = await client.messages.create({
                model,
                max_tokens: maxTokens,
                temperature,
                messages: [{ role: "user", content: finalPrompt }]
            });
            if (response.content[0].type === 'text') {
                text = response.content[0].text;
            } else {
                text = "";
            }
            if (response.usage) {
                usage.prompt_tokens = response.usage.input_tokens;
                usage.response_tokens = response.usage.output_tokens;
                usage.total_tokens = response.usage.input_tokens + response.usage.output_tokens;
                usage.metadata.anthropic = response.usage;
            }
        } else if (provider === "gemini") {
            const apiKey = apiKeys.google_key;
            if (!apiKey) throw new Error("Google Gemini API key not found. Please add it in API Settings.");

            const client = new GoogleGenerativeAI(apiKey);
            const genModel = client.getGenerativeModel({ model });
            const response = await genModel.generateContent(finalPrompt);
            text = response.response.text() || "";
            usage.metadata.gemini = response.response;
            // Gemini usage mapping depends on SDK version; set metadata and estimate tokens if unavailable
        } else {
            throw new Error(`Unknown provider: ${provider}`);
        }

        return { outputText: text, usage };

    } catch (error: any) {
        console.error("LLM API Error:", error);
        throw new Error(error.message || "Failed to generate response from LLM");
    }
}

/**
 * Score a prompt using AI evaluation
 * ALWAYS uses SYSTEM_MODEL_CONFIG for consistent scoring baseline
 */
export async function scorePromptLLM(
    finalPrompt: string,
    _modelConfig: ModelConfig, // Ignored - we use SYSTEM_MODEL_CONFIG
    apiKeys: APIKeys
): Promise<{ score: PromptScore; usage: UsageData }> {
    const scoringPrompt = `You are a professional prompt engineer. Evaluate the quality of the following prompt.

Evaluate on:
- Clarity (0-30): How clear and understandable is the prompt?
- Specificity (0-30): How specific and detailed are the requirements?
- Structure (0-40): How well-structured and organized is the prompt?

Return ONLY JSON using this exact format:
{
  "clarity": number,
  "specificity": number,
  "structure": number,
  "total": number
}

Prompt to evaluate:
"""
${finalPrompt}
"""`;

    // Use SYSTEM_MODEL_CONFIG for consistent scoring
    const systemConfig = SYSTEM_MODEL_CONFIG;
    const { getLLMClient } = await import('./llmClients');

    let usage: UsageData = {
        provider: systemConfig.provider,
        model: systemConfig.model,
        prompt_tokens: 0,
        response_tokens: 0,
        total_tokens: 0,
        cost: 0,
        metadata: {}
    };

    try {
        // Always use Groq for scoring (SYSTEM_MODEL_CONFIG)
        const apiKey = apiKeys.groq_key;
        if (!apiKey) throw new Error("Groq API key is required for scoring. Please add it in API Settings.");

        const client = getLLMClient('groq', apiKey) as any;
        const response = await client.chat.completions.create({
            model: systemConfig.model,
            temperature: 0,
            messages: [{ role: "user", content: scoringPrompt }]
        });
        const content = response.choices[0].message.content || "{}";

        if (response.usage) {
            usage.prompt_tokens = response.usage.prompt_tokens;
            usage.response_tokens = response.usage.completion_tokens;
            usage.total_tokens = response.usage.total_tokens;
        }

        return { score: JSON.parse(content), usage };
    } catch (error: any) {
        console.error("Scoring error:", error);
        throw new Error(error.message || "Failed to score prompt");
    }
}
