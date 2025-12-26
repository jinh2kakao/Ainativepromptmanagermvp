import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutGrid,
    List,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    CreditCard,
    Folder,
    User,
    Zap,
    Activity
} from 'lucide-react';
import { TeamSwitcher } from './TeamSwitcher';
import { UserType } from '@/types';

import { useUIStore } from '@/stores/uiStore';
import { useTeamStore } from '@/stores/teamStore';

interface SidebarProps {
    userType: UserType;
    onSignUp: () => void;
    onOpenSettings: () => void;
    onOpenPricing?: () => void;
    usageStats?: {
        optimizations: { current: number; limit: number };
        evaluations: { current: number; limit: number };
    };

    quotaLimit: number;
    userName?: string;
    userEmail?: string;
    isAdmin?: boolean;
}

export function Sidebar({
    userType,
    onSignUp,
    onOpenSettings,
    onOpenPricing,
    usageStats,

    quotaLimit,
    userName,
    userEmail,
    isAdmin,
}: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { currentTeamId } = useTeamStore();
    const {
        isSidebarCollapsed,
        toggleSidebar,
        viewMode,
        setViewMode,
        isMobileMenuOpen,
        setMobileMenuOpen
    } = useUIStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Close profile menu when collapsing
    useEffect(() => {
        if (isSidebarCollapsed) setShowProfileMenu(false);
    }, [isSidebarCollapsed]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname, setMobileMenuOpen]);

    const handleViewChange = (mode: 'list' | 'kanban') => {
        console.log('Sidebar: handleViewChange', mode);
        setViewMode(mode);
        // Always update URL to ensure state persistence
        router.push(`/?view=${mode}`);
    };

    return (
        <>


            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50
                    transition-transform duration-300 ease-in-out flex flex-col
                    ${isSidebarCollapsed ? 'md:w-20' : 'md:w-[228px]'}
                    w-[228px]
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Toggle Button (Desktop Only) */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50 text-gray-500 z-50"
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>

                {/* Logo Section */}
                <div className={`h-16 md:h-20 flex items-center ${isSidebarCollapsed ? 'md:justify-center md:px-0' : 'justify-start px-6'}`}>
                    <div
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => router.push('/')}
                    >
                        <div className={`relative transition-all duration-300 ${isSidebarCollapsed ? 'w-8 h-8' : 'w-28 h-8'}`}>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.png`}
                                alt="Logo"
                                fill
                                className={`object-contain ${isSidebarCollapsed ? 'object-center' : 'object-left'}`}
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Team Switcher */}
                <div className="mt-2">
                    <TeamSwitcher
                        isCollapsed={isSidebarCollapsed}
                        onOpenPricing={onOpenPricing}
                    />
                </div>

                {/* Main Navigation */}

                <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    {/* Context Specific Menu */}
                    {!currentTeamId ? (
                        /* Personal Workspace Menu */
                        <div className="mb-6">
                            {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    My Prompts
                                </h3>
                            )}
                            <button
                                onClick={() => handleViewChange('list')}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${viewMode === 'list' && pathname === '/'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                    ${isSidebarCollapsed ? 'md:justify-center' : ''}
                                `}
                            >
                                <List className="w-5 h-5" />
                                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="text-sm">List View</span>}
                            </button>
                            <button
                                onClick={() => handleViewChange('kanban')}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${viewMode === 'kanban' && pathname === '/'
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                    ${isSidebarCollapsed ? 'md:justify-center' : ''}
                                `}
                            >
                                <LayoutGrid className="w-5 h-5" />
                                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="text-sm">Kanban Board</span>}
                            </button>
                            <button
                                onClick={() => router.push('/projects')}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${pathname.startsWith('/projects')
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                    ${isSidebarCollapsed ? 'md:justify-center' : ''}
                                `}
                            >
                                <Folder className="w-5 h-5" />
                                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="text-sm">Projects</span>}
                            </button>
                        </div>
                    ) : (
                        /* Team Workspace Menu */
                        <div className="mb-6">
                            {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Team Workspace
                                </h3>
                            )}
                            <button
                                onClick={() => router.push('/projects')}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${pathname.startsWith('/projects')
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                    ${isSidebarCollapsed ? 'md:justify-center' : ''}
                                `}
                            >
                                <Folder className="w-5 h-5" />
                                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="text-sm">Projects</span>}
                            </button>
                            <button
                                onClick={() => router.push(`/teams/settings?id=${currentTeamId}`)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${pathname.includes('/settings')
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                    ${isSidebarCollapsed ? 'md:justify-center' : ''}
                                `}
                            >
                                <Settings className="w-5 h-5" />
                                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="text-sm">Team Management</span>}
                            </button>
                        </div>
                    )}

                    {/* Admin Section - Only show in Personal view or always? Keeping global for now */}
                    {isAdmin && (
                        <div>
                            {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Admin
                                </h3>
                            )}
                            <button
                                onClick={() => router.push('/admin')}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${pathname.startsWith('/admin')
                                        ? 'bg-purple-50 text-purple-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                    ${isSidebarCollapsed ? 'md:justify-center' : ''}
                                `}
                            >
                                <ShieldCheck className="w-5 h-5" />
                                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="text-sm">Admin Console</span>}
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Section: Stats & User */}
                <div className="border-t border-gray-200 bg-gray-50/50">
                    {/* AI Usage Stats */}
                    {(!isSidebarCollapsed || isMobileMenuOpen) && usageStats && (
                        <div className="px-6 py-4 space-y-4">
                            {/* Optimization Stats */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                        <span>AI Optimizations</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">
                                        {usageStats.optimizations.current} / {usageStats.optimizations.limit}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${usageStats.optimizations.current >= usageStats.optimizations.limit
                                            ? 'bg-red-500'
                                            : 'bg-amber-500'
                                            }`}
                                        style={{ width: `${Math.min((usageStats.optimizations.current / usageStats.optimizations.limit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Evaluation Stats */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                                        <span>Designing Evaluations</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">
                                        {usageStats.evaluations.current} / {usageStats.evaluations.limit}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${usageStats.evaluations.current >= usageStats.evaluations.limit
                                            ? 'bg-red-500'
                                            : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min((usageStats.evaluations.current / usageStats.evaluations.limit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Profile Section */}
                    <div className={`p-4 ${isSidebarCollapsed ? 'md:flex md:justify-center' : ''}`}>
                        {userType === 'guest' ? (
                            <button
                                onClick={onSignUp}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm
                                    ${isSidebarCollapsed ? 'md:justify-center md:p-3' : ''}
                                `}
                            >
                                <User className="w-5 h-5" />
                                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-medium">Sign In</span>}
                            </button>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className={`
                                        w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100
                                        ${isSidebarCollapsed ? 'md:justify-center' : ''}
                                        ${showProfileMenu ? 'bg-white shadow-md border-gray-100' : ''}
                                    `}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-sm">
                                        {userName?.[0]?.toUpperCase() || 'U'}
                                    </div>

                                    {(!isSidebarCollapsed || isMobileMenuOpen) && (
                                        <div className="flex-1 text-left overflow-hidden">
                                            <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                                            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className={`
                                        absolute bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200
                                        ${isSidebarCollapsed && !isMobileMenuOpen
                                            ? 'left-full bottom-0 ml-2 w-56'
                                            : 'bottom-full left-0 w-full mb-2'
                                        }
                                    `}>
                                        <div className="p-1">
                                            <button
                                                onClick={() => {
                                                    onOpenSettings();
                                                    setShowProfileMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </button>
                                            {userType === 'free' && onOpenPricing && (
                                                <button
                                                    onClick={() => {
                                                        onOpenPricing();
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Upgrade Plan
                                                </button>
                                            )}
                                            <div className="h-px bg-gray-100 my-1" />
                                            <button
                                                onClick={() => {
                                                    onSignUp();
                                                    setShowProfileMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </aside >
        </>
    );
}
