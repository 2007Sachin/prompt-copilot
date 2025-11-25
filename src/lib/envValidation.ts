/**
 * Environment Variable Validation
 * Ensures all required environment variables are present
 */

interface EnvConfig {
    // Clerk Authentication
    CLERK_PUBLISHABLE_KEY: string;

    // Supabase
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;

    // Optional: Default API Keys (for local dev)
    OPENAI_API_KEY?: string;
    GROQ_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    GEMINI_API_KEY?: string;
}

class EnvironmentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EnvironmentError';
    }
}

export function validateEnvironment(): EnvConfig {
    const errors: string[] = [];

    // Required variables
    const requiredVars = {
        CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    };

    // Check required variables
    for (const [key, value] of Object.entries(requiredVars)) {
        if (!value || value.trim() === '') {
            errors.push(`Missing required environment variable: VITE_${key}`);
        }
    }

    if (errors.length > 0) {
        throw new EnvironmentError(
            `Environment configuration errors:\n${errors.join('\n')}\n\nPlease check your .env file.`
        );
    }

    // Log warnings for missing optional API keys
    const optionalKeys = {
        OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
        GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
        ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
        GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    };

    const missingOptional: string[] = [];
    for (const [key, value] of Object.entries(optionalKeys)) {
        if (!value || value.trim() === '') {
            missingOptional.push(key);
        }
    }

    if (missingOptional.length > 0) {
        console.warn(
            `⚠️ Optional API keys not configured: ${missingOptional.join(', ')}\n` +
            `Users will need to provide their own API keys in Settings.`
        );
    }

    return {
        CLERK_PUBLISHABLE_KEY: requiredVars.CLERK_PUBLISHABLE_KEY,
        SUPABASE_URL: requiredVars.SUPABASE_URL,
        SUPABASE_ANON_KEY: requiredVars.SUPABASE_ANON_KEY,
        OPENAI_API_KEY: optionalKeys.OPENAI_API_KEY,
        GROQ_API_KEY: optionalKeys.GROQ_API_KEY,
        ANTHROPIC_API_KEY: optionalKeys.ANTHROPIC_API_KEY,
        GEMINI_API_KEY: optionalKeys.GEMINI_API_KEY,
    };
}

/**
 * Check if Supabase is properly configured
 */
export async function validateSupabaseConnection(): Promise<boolean> {
    try {
        const { supabase } = await import('./supabaseClient');
        const { data, error } = await supabase.from('prompts').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }

        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Failed to validate Supabase:', error);
        return false;
    }
}

/**
 * Log environment status (for debugging)
 */
export function logEnvironmentStatus() {
    console.group('🔧 Environment Status');
    console.log('Mode:', import.meta.env.MODE);
    console.log('Dev:', import.meta.env.DEV);
    console.log('Prod:', import.meta.env.PROD);
    console.log('Clerk configured:', !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
    console.log('Supabase configured:', !!import.meta.env.VITE_SUPABASE_URL);
    console.log('OpenAI configured:', !!import.meta.env.VITE_OPENAI_API_KEY);
    console.log('Groq configured:', !!import.meta.env.VITE_GROQ_API_KEY);
    console.log('Anthropic configured:', !!import.meta.env.VITE_ANTHROPIC_API_KEY);
    console.log('Gemini configured:', !!import.meta.env.VITE_GEMINI_API_KEY);
    console.groupEnd();
}
