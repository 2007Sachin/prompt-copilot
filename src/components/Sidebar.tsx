import { Home, Settings, ChevronLeft, ChevronRight, Sparkles, Sliders, Clock, BarChart2 } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

interface SidebarProps {
    active: string;
    setActive: (page: string) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ active, setActive, collapsed, setCollapsed }: SidebarProps) {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'history', label: 'History', icon: Clock },
        { id: 'usage', label: 'Usage', icon: BarChart2 },
        { id: 'modelconfig', label: 'Model Config', icon: Sliders },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div
            className="h-screen fixed left-0 top-0 bg-[#121212] border-r border-[#2A2A2A] transition-all duration-300 flex flex-col p-4 z-50"
            style={{ width: collapsed ? '70px' : '240px' }}
        >
            {/* Header / Toggle */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-8`}>
                {!collapsed && (
                    <div className="flex items-center gap-2 animate-fade-in overflow-hidden whitespace-nowrap">
                        <div className="bg-[#252525] p-1.5 rounded-lg">
                            <Sparkles className="text-[#BB86FC] w-5 h-5" />
                        </div>
                        <span className="font-bold text-[#E0E0E0] text-lg tracking-tight">PromptCopilot</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#1E1E1E] transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={`
                                w-full flex items-center gap-3 cursor-pointer
                                px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                ${isActive
                                    ? 'text-[#BB86FC] bg-[#1E1E1E] shadow-[0_0_15px_rgba(187,134,252,0.1)]'
                                    : 'text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#1E1E1E]'
                                }
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <div className={`relative ${isActive ? 'text-[#BB86FC]' : 'group-hover:text-[#E0E0E0]'}`}>
                                <Icon size={20} />
                                {isActive && (
                                    <div className="absolute inset-0 bg-[#BB86FC] blur-md opacity-20 rounded-full" />
                                )}
                            </div>

                            {!collapsed && (
                                <span className={`font-medium whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isActive ? 'text-[#E0E0E0]' : ''}`}>
                                    {item.label}
                                </span>
                            )}

                            {/* Active Indicator Line */}
                            {isActive && !collapsed && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#BB86FC] rounded-r-full" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Clerk User Button */}
            <div className="pt-4 border-t border-[#2A2A2A]">
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8",
                                userButtonPopoverCard: "bg-[#1E1E1E] border border-[#2A2A2A]",
                                userButtonPopoverActionButton: "text-[#E0E0E0] hover:bg-[#252525]",
                            }
                        }}
                    />
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-[#E0E0E0] truncate">Account</p>
                            <p className="text-xs text-[#A0A0A0] truncate">Manage profile</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
