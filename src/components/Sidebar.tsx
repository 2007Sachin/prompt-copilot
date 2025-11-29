import { Home, Settings, ChevronLeft, ChevronRight, Sparkles, Sliders, Clock, BarChart2, X } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

interface SidebarProps {
    active: string;
    setActive: (page: string) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ active, setActive, collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'history', label: 'History', icon: Clock },
        { id: 'usage', label: 'Usage', icon: BarChart2 },
        { id: 'modelconfig', label: 'Model Config', icon: Sliders },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed left-0 top-0 h-screen bg-[#121212] border-r border-[#2A2A2A] z-50
                    transition-all duration-300 flex flex-col p-4
                    w-[280px] md:w-auto
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${collapsed ? 'md:w-[70px]' : 'md:w-[240px]'}
                `}
            >
                {/* Header / Toggle */}
                <div className={`flex items-center ${collapsed ? 'md:justify-center' : 'justify-between'} mb-8`}>
                    {/* Logo - Hidden if collapsed on desktop, always shown on mobile */}
                    <div className={`flex items-center gap-2 animate-fade-in overflow-hidden whitespace-nowrap ${collapsed ? 'md:hidden' : 'flex'}`}>
                        <div className="bg-[#252525] p-1.5 rounded-lg">
                            <Sparkles className="text-[#BB86FC] w-5 h-5" />
                        </div>
                        <span className="font-bold text-[#E0E0E0] text-lg tracking-tight">PromptCopilot</span>
                    </div>

                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:block p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#1E1E1E] transition-colors"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#1E1E1E] transition-colors"
                    >
                        <X size={20} />
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
                                onClick={() => {
                                    setActive(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 cursor-pointer
                                    px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                    ${isActive
                                        ? 'text-[#BB86FC] bg-[#1E1E1E] shadow-[0_0_15px_rgba(187,134,252,0.1)]'
                                        : 'text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#1E1E1E]'
                                    }
                                    ${collapsed ? 'md:justify-center' : ''}
                                `}
                                title={collapsed ? item.label : undefined}
                            >
                                <div className={`relative ${isActive ? 'text-[#BB86FC]' : 'group-hover:text-[#E0E0E0]'}`}>
                                    <Icon size={20} />
                                    {isActive && (
                                        <div className="absolute inset-0 bg-[#BB86FC] blur-md opacity-20 rounded-full" />
                                    )}
                                </div>

                                <span className={`font-medium whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isActive ? 'text-[#E0E0E0]' : ''} ${collapsed ? 'md:hidden' : 'block'}`}>
                                    {item.label}
                                </span>

                                {/* Active Indicator Line */}
                                {isActive && (
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#BB86FC] rounded-r-full ${collapsed ? 'md:block' : 'hidden'}`} />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Clerk User Button */}
                <div className="pt-4 border-t border-[#2A2A2A]">
                    <div className={`flex items-center gap-3 ${collapsed ? 'md:justify-center' : ''}`}>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8",
                                    userButtonPopoverCard: "bg-[#1E1E1E] border border-[#2A2A2A]",
                                    userButtonPopoverActionButton: "text-[#E0E0E0] hover:bg-[#252525]",
                                }
                            }}
                        />
                        <div className={`overflow-hidden ${collapsed ? 'md:hidden' : 'block'}`}>
                            <p className="text-sm font-medium text-[#E0E0E0] truncate">Account</p>
                            <p className="text-xs text-[#A0A0A0] truncate">Manage profile</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
