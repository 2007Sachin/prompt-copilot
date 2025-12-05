import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Key, Settings as SettingsIcon } from 'lucide-react';
import UserProfile from './UserProfile';
import APIKeySettings from './APIKeySettings';

interface SettingsPageProps {
    user?: any;
}

type TabType = 'profile' | 'apikeys' | 'preferences';

export default function SettingsPage({ user }: SettingsPageProps) {
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: User, iconColor: 'text-primary' },
        { id: 'apikeys' as const, label: 'API Keys', icon: Key, iconColor: 'text-emerald-400' },
        { id: 'preferences' as const, label: 'Preferences', icon: SettingsIcon, iconColor: 'text-text-muted' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-text-main mb-8">Settings</h1>

            {/* Tabs */}
            <div className="flex border-b border-border mb-8">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                                ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'}
                            `}
                        >
                            <Icon size={16} className={isActive ? 'text-primary' : tab.iconColor} />
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
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

                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        {/* Appearance Card */}
                        <div className="p-6 bg-surface border border-border rounded-lg">
                            <h3 className="text-lg font-semibold text-text-main mb-4">Appearance</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">Theme</span>
                                <div className="bg-surface-highlight border border-border text-text-main rounded-lg px-4 py-2 text-sm font-medium">
                                    🌙 Dark Mode
                                </div>
                            </div>
                        </div>

                        {/* Regional Card */}
                        <div className="p-6 bg-surface border border-border rounded-lg">
                            <h3 className="text-lg font-semibold text-text-main mb-4">Regional</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">Language</span>
                                <select className="bg-background border border-border text-text-main rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                    <option value="en">English (US)</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </select>
                            </div>
                        </div>

                        {/* Notifications Card */}
                        <div className="p-6 bg-surface border border-border rounded-lg">
                            <h3 className="text-lg font-semibold text-text-main mb-4">Notifications</h3>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-text-muted">Email Notifications</span>
                                <button className="w-10 h-6 bg-primary rounded-full relative cursor-pointer transition-colors">
                                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-muted">Usage Alerts</span>
                                <button className="w-10 h-6 bg-surface-highlight rounded-full relative cursor-pointer border border-border transition-colors hover:border-zinc-600">
                                    <div className="w-4 h-4 bg-text-muted rounded-full absolute top-1 left-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
