import { supabase } from './supabaseClient';

export interface BackendHealthStatus {
    status: 'online' | 'offline';
    error: string | null;
    latency?: number;
}

/**
 * Check the health of the Supabase backend connection
 * @returns Promise<BackendHealthStatus> - Connection status and any error
 */
export async function checkBackendHealth(): Promise<BackendHealthStatus> {
    const startTime = Date.now();

    try {
        const { data: _data, error } = await supabase
            .from('prompts')
            .select('id')
            .limit(1);

        const latency = Date.now() - startTime;

        if (error) {
            console.error('❌ Backend health check failed:', error);
            return {
                status: 'offline',
                error: error.message,
                latency
            };
        }

        console.log('✅ Backend health check passed:', { latency: `${latency}ms` });
        return {
            status: 'online',
            error: null,
            latency
        };
    } catch (err: any) {
        console.error('❌ Backend connection error:', err);
        return {
            status: 'offline',
            error: err.message || 'Failed to connect to backend'
        };
    }
}

/**
 * Verify Supabase credentials are configured
 * @returns boolean - true if credentials exist
 */
export function hasSupabaseCredentials(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && key);
}
