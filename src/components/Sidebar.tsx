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
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Using border-r for separation, no shadows */}
            <div
                className={`
                    fixed left-0 top-0 h-screen z-50
                    transition-all duration-300 flex flex-col
                    bg-surface border-r border-border
                    w-[280px] md:w-auto
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${collapsed ? 'md:w-[78px]' : 'md:w-[260px]'}
                `}
            >
                {/* Inner padding container */}
                <div className="flex flex-col h-full p-4">
                    {/* Header / Toggle */}
                    <div className={`flex items-center ${collapsed ? 'md:justify-center' : 'justify-between'} mb-8`}>
                        {/* Logo */}
                        <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap ${collapsed ? 'md:hidden' : 'flex'}`}>
                            <div className="bg-primary p-2 rounded-xl">
                                <Sparkles className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-text-main text-lg tracking-tight">
                                Prompt<span className="text-primary">Copilot</span>
                            </span>
                        </div>

                        {/* Desktop Collapse Button */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-highlight transition-all duration-200"
                        >
                            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-highlight transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1 flex-1">
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
                                        px-3 py-3 rounded-xl transition-all duration-200
                                        ${collapsed ? 'md:justify-center md:px-0' : ''}
                                        ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-text-muted hover:text-text-main hover:bg-surface-highlight'
                                        }
                                    `}
                                    title={collapsed ? item.label : undefined}
                                >
                                    {/* Icon */}
                                    <div className={`transition-colors duration-200 ${collapsed ? '' : 'ml-1'}`}>
                                        <Icon
                                            size={20}
                                            className={isActive ? 'text-primary' : ''}
                                        />
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`
                                            font-medium whitespace-nowrap overflow-hidden 
                                            transition-colors duration-200
                                            ${collapsed ? 'md:hidden' : 'block'}
                                        `}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="pt-4 mt-auto border-t border-border">
                        <div className={`flex items-center gap-3 ${collapsed ? 'md:justify-center' : ''}`}>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-surface",
                                        userButtonPopoverCard: "bg-surface border border-border",
                                        userButtonPopoverActionButton: "text-text-main hover:bg-surface-highlight",
                                    }
                                }}
                            />
                            <div className={`overflow-hidden ${collapsed ? 'md:hidden' : 'block'}`}>
                                <p className="text-sm font-medium text-text-main truncate">Account</p>
                                <p className="text-xs text-text-muted truncate">Manage profile</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
