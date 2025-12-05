import { supabase } from "../lib/supabaseClient";
import { Mail, Calendar, Shield, Award, Zap } from 'lucide-react';

interface UserProfileProps {
    user: any;
}

export default function UserProfile({ user }: UserProfileProps) {
    if (!user) {
        return (
            <div className="p-8 rounded-xl bg-surface border border-border">
                <p className="text-text-muted">No user information available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="p-8 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-6 mb-6">
                    {/* Avatar with softer gradient */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                        {user.email ? user.email[0].toUpperCase() : 'U'}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-text-main mb-1">{user.email || 'Guest User'}</h2>
                        <p className="text-text-muted text-sm">Free Plan • Active</p>
                    </div>

                    {/* Logout Button - Soft red style */}
                    <button
                        className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 px-6 py-2 rounded-lg transition-colors font-medium"
                        onClick={() => supabase.auth.signOut()}
                    >
                        Logout
                    </button>
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-surface-highlight rounded-lg border border-border">
                        <Mail className="text-primary" size={20} />
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider">Email</p>
                            <p className="text-sm text-text-main font-medium">{user.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-surface-highlight rounded-lg border border-border">
                        <Calendar className="text-emerald-500" size={20} />
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider">Member Since</p>
                            <p className="text-sm text-text-main font-medium">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-surface-highlight rounded-lg border border-border">
                        <Shield className="text-rose-500" size={20} />
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider">Account Status</p>
                            <p className="text-sm text-success font-medium">Verified</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-surface-highlight rounded-lg border border-border">
                        <Award className="text-amber-500" size={20} />
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-wider">Plan</p>
                            <p className="text-sm text-text-main font-medium">Free Tier</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Stats */}
            <div className="p-6 rounded-xl bg-surface border border-border">
                <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                    <Zap className="text-primary" size={20} />
                    Account Activity
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-surface-highlight rounded-lg border border-border">
                        <p className="text-2xl font-bold text-primary">--</p>
                        <p className="text-xs text-text-muted mt-1">Total Prompts</p>
                    </div>
                    <div className="text-center p-4 bg-surface-highlight rounded-lg border border-border">
                        <p className="text-2xl font-bold text-emerald-500">--</p>
                        <p className="text-xs text-text-muted mt-1">API Calls</p>
                    </div>
                    <div className="text-center p-4 bg-surface-highlight rounded-lg border border-border">
                        <p className="text-2xl font-bold text-amber-500">--</p>
                        <p className="text-xs text-text-muted mt-1">Saved Items</p>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-lg bg-surface-highlight border border-border flex items-start gap-3">
                <Shield className="text-emerald-500 mt-0.5" size={18} />
                <div>
                    <p className="text-sm text-text-main font-medium">Security & Privacy</p>
                    <p className="text-xs text-text-muted mt-1">
                        Your API keys are stored locally in your browser and never sent to our servers.
                        All AI requests go directly to the respective providers.
                    </p>
                </div>
            </div>
        </div>
    );
}
