import { supabase } from "../lib/supabaseClient";
import { Mail, Calendar, Shield, Award, Zap } from 'lucide-react';

interface UserProfileProps {
    user: any;
}

export default function UserProfile({ user }: UserProfileProps) {
    if (!user) {
        return (
            <div className="p-8 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-[#E0E0E0]">
                <p className="text-[#A0A0A0]">No user information available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="p-8 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] text-[#E0E0E0]">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#BB86FC] to-[#3700B3] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        {user.email ? user.email[0].toUpperCase() : 'U'}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[#E0E0E0] mb-1">{user.email || 'Guest User'}</h2>
                        <p className="text-[#A0A0A0] text-sm">Free Plan • Active</p>
                    </div>

                    <button
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                        onClick={() => supabase.auth.signOut()}
                    >
                        Logout
                    </button>
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-[#252525] rounded-lg border border-[#2A2A2A]">
                        <Mail className="text-[#BB86FC]" size={20} />
                        <div>
                            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Email</p>
                            <p className="text-sm text-[#E0E0E0] font-medium">{user.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[#252525] rounded-lg border border-[#2A2A2A]">
                        <Calendar className="text-[#03DAC6]" size={20} />
                        <div>
                            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Member Since</p>
                            <p className="text-sm text-[#E0E0E0] font-medium">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[#252525] rounded-lg border border-[#2A2A2A]">
                        <Shield className="text-[#CF6679]" size={20} />
                        <div>
                            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Account Status</p>
                            <p className="text-sm text-[#03DAC6] font-medium">Verified</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[#252525] rounded-lg border border-[#2A2A2A]">
                        <Award className="text-[#FFD700]" size={20} />
                        <div>
                            <p className="text-xs text-[#A0A0A0] uppercase tracking-wider">Plan</p>
                            <p className="text-sm text-[#E0E0E0] font-medium">Free Tier</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Stats */}
            <div className="p-6 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A]">
                <h3 className="text-lg font-semibold text-[#E0E0E0] mb-4 flex items-center gap-2">
                    <Zap className="text-[#BB86FC]" size={20} />
                    Account Activity
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[#252525] rounded-lg border border-[#2A2A2A]">
                        <p className="text-2xl font-bold text-[#BB86FC]">--</p>
                        <p className="text-xs text-[#A0A0A0] mt-1">Total Prompts</p>
                    </div>
                    <div className="text-center p-4 bg-[#252525] rounded-lg border border-[#2A2A2A]">
                        <p className="text-2xl font-bold text-[#03DAC6]">--</p>
                        <p className="text-xs text-[#A0A0A0] mt-1">API Calls</p>
                    </div>
                    <div className="text-center p-4 bg-[#252525] rounded-lg border border-[#2A2A2A]">
                        <p className="text-2xl font-bold text-[#CF6679]">--</p>
                        <p className="text-xs text-[#A0A0A0] mt-1">Saved Items</p>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-lg bg-[#252525] border border-[#2A2A2A] flex items-start gap-3">
                <Shield className="text-[#BB86FC] mt-0.5" size={18} />
                <div>
                    <p className="text-sm text-[#E0E0E0] font-medium">Security & Privacy</p>
                    <p className="text-xs text-[#A0A0A0] mt-1">
                        Your API keys are stored locally in your browser and never sent to our servers.
                        All AI requests go directly to the respective providers.
                    </p>
                </div>
            </div>
        </div>
    );
}
