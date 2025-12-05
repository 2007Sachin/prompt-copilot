/**
 * System Constants for PromptCopilot
 * 
 * This file defines the core configuration that powers the application's
 * AI intelligence layer. All system-level AI operations (prompt generation,
 * scoring, APE variants) use this configuration regardless of user selection.
 */

import { ModelConfig } from '../types';

/**
 * SYSTEM_MODEL_CONFIG
 * 
 * The "Top Model" configuration used for all critical AI operations.
 * This ensures consistent, high-quality results across:
 * - Prompt generation and refinement
 * - Prompt scoring and evaluation
 * - APE (Automatic Prompt Engineering) variant generation
 * - Schema auto-detection
 * 
 * User's model selection only affects the final "Run Prompt" execution.
 */
export const SYSTEM_MODEL_CONFIG: ModelConfig = {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile', // Top model for intelligence
    temperature: 0.7,
    topP: 1,
    topK: 40,
    maxTokens: 8192 // High limit for complex generations
};

/**
 * Feature Flags
 */
export const FEATURES = {
    PROMPT_CHAINING: true,
    TEST_SUITE: true,
    APE_VARIANTS: true,
    SCHEMA_AUTO_DETECT: true,
    MODEL_COMPARISON: false // Coming soon
};

/**
 * API Rate Limits (per minute)
 */
export const RATE_LIMITS = {
    GROQ_FREE: 30,
    GROQ_PRO: 100,
    OPENAI: 60,
    ANTHROPIC: 40
};
