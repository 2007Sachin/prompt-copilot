import { supabase } from "./supabaseClient";

interface UsageObject {
    provider?: string;
    model?: string;
    prompt_tokens?: number;
    response_tokens?: number;
    total_tokens?: number;
    cost?: number;
    metadata?: any;
}

/**
 * Save usage record for the current logged-in user (Clerk).
 * usageObj should contain:
 * { provider, model, prompt_tokens, response_tokens, total_tokens, cost, metadata }
 */
export async function saveUsageSupabase(usageObj: UsageObject, userId: string) {
    if (!userId) {

        return null;
    }

    const payload = {
        user_id: userId, // Clerk user ID (string like "user_2abc123...")
        provider: usageObj.provider || "unknown",
        model: usageObj.model || null,
        prompt_tokens: usageObj.prompt_tokens ?? 0,
        response_tokens: usageObj.response_tokens ?? 0,
        total_tokens: usageObj.total_tokens ?? ((usageObj.prompt_tokens ?? 0) + (usageObj.response_tokens ?? 0)),
        cost: usageObj.cost ?? 0,
        metadata: usageObj.metadata ?? {}
    };



    const { data, error } = await supabase
        .from("usage_stats")
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error("❌ Failed to save usage stats:", error);
        // Don't throw, just return null so app doesn't crash
        return null;
    }

    console.log("📊 Usage saved successfully:", data);
    return data;
}

/**
 * Get usage stats for a specific user (Clerk user ID)
 */
export async function getUserUsageStats(userId: string) {
    if (!userId) {

        return [];
    }

    const { data, error } = await supabase
        .from("usage_stats")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {

        throw new Error(error.message);
    }

    return data || [];
}
