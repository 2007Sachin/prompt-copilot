import { PromptRecord } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'promptcopilot_prompts_v1';

// Local Storage Implementation (fallback)
export const getPrompts = (): PromptRecord[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load prompts:', error);
        return [];
    }
};

export const getSavedPrompts = getPrompts;

export const savePrompt = (prompt: PromptRecord): void => {
    try {
        const current = getPrompts();
        const updated = [prompt, ...current];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save prompt:', error);
    }
};

export const deletePrompt = (id: string): void => {
    try {
        const current = getPrompts();
        const updated = current.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to delete prompt:', error);
    }
};

export const updatePrompt = (id: string, updates: Partial<PromptRecord>): void => {
    try {
        const current = getPrompts();
        const index = current.findIndex(p => p.id === id);
        if (index !== -1) {
            current[index] = { ...current[index], ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        }
    } catch (error) {
        console.error('Failed to update prompt:', error);
    }
};


// Supabase Cloud Storage (with Clerk user IDs)
export async function savePromptSupabase(record: any, userId: string) {
    if (!userId) {
        console.warn("⚠️ No user ID provided, skipping prompt save");
        return null;
    }

    const payload = {
        user_id: userId, // Clerk user ID (string)
        name: record.name ?? null,
        use_case: record.use_case ?? null,
        technique: record.technique ?? null,
        persona: record.persona ?? null,
        length_mode: record.length_mode ?? null,
        output_format: record.output_format ?? null,
        context: record.context ?? null,
        final_prompt: record.final_prompt ?? null,
        chat_history: record.chatHistory ?? [], // Persist chat history
        created_at: new Date().toISOString(),
        // New fields for Workflows and Test Suites
        type: record.type || 'single',
        chain_config: record.chainSteps || null, // For workflows (array of ChainStep)
        test_config: record.testCases ? { cases: record.testCases } : null, // For test suites
        model_config: record.modelConfig || null // Store model configuration
    };

    const { data, error } = await supabase
        .from("prompts")
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error("❌ Supabase Insert Error:", error);
        throw new Error(error.message);
    }

    console.log("✅ Prompt saved to Supabase:", data);
    return data;
}

export async function getUserPrompts(userId: string) {
    if (!userId) {
        console.warn("⚠️ No user ID provided");
        return [];
    }

    const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("❌ Supabase Fetch Error:", error);
        throw new Error(error.message);
    }

    return data || [];
}

export async function deletePromptSupabase(id: string) {
    const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("❌ Delete error:", error);
        throw new Error(error.message);
    }

    console.log("✅ Prompt deleted");
}

export async function updatePromptSupabase(id: string, updates: any) {
    const { data, error } = await supabase
        .from("prompts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("❌ Update error:", error);
        throw new Error(error.message);
    }

    console.log("✅ Prompt updated:", data);
    return data;
}
