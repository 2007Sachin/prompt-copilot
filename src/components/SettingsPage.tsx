import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Key, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import UserProfile from './UserProfile';
import APIKeySettings from './APIKeySettings';
import UsageDashboard from './UsageDashboard';

interface SettingsPageProps {
    user?: any;
}

type TabType = 'profile' | 'apikeys' | 'usage' | 'preferences';

export default function SettingsPage({ user }: SettingsPageProps) {
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: User },
        { id: 'apikeys' as const, label: 'API Keys', icon: Key },
        { id: 'usage' as const, label: 'Usage', icon: BarChart2 },
        { id: 'preferences' as const, label: 'Preferences', icon: SettingsIcon },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-[#E0E0E0] mb-8">Settings</h1>

            {/* Tabs */}
            <div className="flex border-b border-[#2A2A2A] mb-8">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                                ${isActive ? 'text-[#BB86FC]' : 'text-[#A0A0A0] hover:text-[#E0E0E0]'}
                            `}
                        >
                            <Icon size={16} />
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BB86FC]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                {activeTab === 'profile' && (
                    <UserProfile user={user} />
                )}

                {activeTab === 'apikeys' && (
                    <APIKeySettings />
                )}

                {activeTab === 'usage' && (
                    <UsageDashboard user={user} />
                )}

                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        <div className="p-6 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl">
                            <h3 className="text-lg font-semibold text-[#E0E0E0] mb-4">Appearance</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[#A0A0A0]">Theme</span>
                                <div className="bg-[#252525] border border-[#2A2A2A] text-[#E0E0E0] rounded-lg px-4 py-2 text-sm font-medium">
                                    🌙 Dark Mode
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl">
                            <h3 className="text-lg font-semibold text-[#E0E0E0] mb-4">Regional</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[#A0A0A0]">Language</span>
                                <select className="bg-[#252525] border border-[#2A2A2A] text-[#E0E0E0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#BB86FC]">
                                    <option value="en">English (US)</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-6 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl">
                            <h3 className="text-lg font-semibold text-[#E0E0E0] mb-4">Notifications</h3>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[#A0A0A0]">Email Notifications</span>
                                <div className="w-10 h-6 bg-[#252525] rounded-full relative cursor-pointer border border-[#2A2A2A]">
                                    <div className="w-4 h-4 bg-[#BB86FC] rounded-full absolute top-1 left-1" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#A0A0A0]">Usage Alerts</span>
                                <div className="w-10 h-6 bg-[#252525] rounded-full relative cursor-pointer border border-[#2A2A2A]">
                                    <div className="w-4 h-4 bg-[#A0A0A0] rounded-full absolute top-1 left-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
