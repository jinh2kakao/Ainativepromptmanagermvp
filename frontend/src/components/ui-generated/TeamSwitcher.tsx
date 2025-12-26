
import { useState, useRef, useEffect } from 'react';
import { useTeams } from '@/features/teams/useTeamHooks';
import { useTeamStore } from '@/stores/teamStore';
import { CreateTeamModal } from './CreateTeamModal';
import { ChevronDown, Plus, Users, User, Check, Building2 } from 'lucide-react';
import { Team } from '@/features/teams/types';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { useUser } from '@/features/auth/useUser';

interface TeamSwitcherProps {
    isCollapsed: boolean;
    onOpenPricing?: () => void;
}

export function TeamSwitcher({ isCollapsed, onOpenPricing }: TeamSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user: sessionUser } = useAuthStore();
    const { data: user, isLoading } = useUser();

    const { data: teams } = useTeams();
    const { currentTeamId, setCurrentTeamId } = useTeamStore();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentTeam = teams?.find(t => t.id === currentTeamId);

    const handleSelect = (teamId: string | null) => {
        setCurrentTeamId(teamId);
        setIsOpen(false);
    };

    return (
        <>
            <div className="px-3 mb-2" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200
                        ${isOpen ? 'bg-gray-50 border-gray-200' : ''}
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        {currentTeamId ? (
                            <Building2 className="w-5 h-5" />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {currentTeam ? currentTeam.name : 'Personal Workspace'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {isLoading ? 'Loading...' : (
                                    currentTeam ? 'Team Plan' : (
                                        user?.user_type === 'enterprise' ? 'Enterprise Plan' :
                                            user?.user_type === 'pro' ? 'Pro Plan' : 'Free Plan'
                                    )
                                )}
                            </p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                </button>

                {/* Dropdown */}
                {isOpen && !isCollapsed && (
                    <div className="absolute left-3 right-3 top-20 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1.5 space-y-0.5">
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Switch Context
                            </div>

                            {/* Personal */}
                            <button
                                onClick={() => handleSelect(null)}
                                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="flex-1 text-left">Personal Workspace</span>
                                {currentTeamId === null && <Check className="w-4 h-4 text-blue-600" />}
                            </button>

                            {/* Teams */}
                            {teams?.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => handleSelect(team.id)}
                                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="flex-1 text-left truncate">{team.name}</span>
                                    {currentTeamId === team.id && <Check className="w-4 h-4 text-blue-600" />}
                                </button>
                            ))}

                            <div className="h-px bg-gray-100 my-1" />

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    if (!sessionUser) {
                                        router.push('/login');
                                        return;
                                    }
                                    if (user?.user_type !== 'enterprise') {
                                        onOpenPricing?.();
                                        return;
                                    }
                                    setShowCreateModal(true);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-md border border-dashed border-blue-300 flex items-center justify-center text-blue-500">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="font-medium">Create Team</span>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white uppercase tracking-wider">
                                        ENT
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CreateTeamModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </>
    );
}

