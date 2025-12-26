
import { useState } from 'react';
import { useTeamMembers, useTeams } from '@/features/teams/useTeamHooks';
import { useTeamStore } from '@/stores/teamStore';
import { InviteMemberModal } from './InviteMemberModal';
import { User, Shield, MoreVertical, Plus, Building2 } from 'lucide-react';

export function TeamSettings() {
    const { currentTeamId } = useTeamStore();
    const { data: teams } = useTeams();
    const currentTeam = teams?.find(t => t.id === currentTeamId);

    const { data: members, isLoading } = useTeamMembers(currentTeamId);
    const [isInviteOpen, setInviteOpen] = useState(false);

    const { setCurrentTeamId } = useTeamStore();

    // Switch team handler
    const handleSwitchTeam = (teamId: string) => {
        setCurrentTeamId(teamId);
    };

    if (!currentTeamId) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">My Teams</h2>
                    <p className="text-sm text-gray-500">Manage the teams you are a member of.</p>
                </div>

                {teams && teams.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {teams.map((team) => (
                            <div key={team.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{team.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {/* Fallback if member_count is missing */}
                                                Member
                                            </p>
                                        </div>
                                    </div>
                                    {team.owner_id === members?.[0]?.user_id && ( // Note: simple check, ideally check current user id
                                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">Owner</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleSwitchTeam(team.id)}
                                    className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Manage Team
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">No Teams Yet</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            You haven't joined any teams yet.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Team Members</h2>
                    <p className="text-sm text-gray-500">Manage who has access to this team.</p>
                </div>
                <button
                    onClick={() => setInviteOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-700">{currentTeam?.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{members?.length || 0} members</span>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading members...</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {members?.map((member) => (
                            <div key={member.user_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm">
                                        {member.user?.name?.[0]?.toUpperCase() || member.user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {member.user?.name || 'Unknown User'}
                                            {member.role === 'owner' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Owner</span>}
                                        </p>
                                        <p className="text-xs text-gray-500">{member.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                        <Shield className="w-3 h-3" />
                                        <span className="capitalize">{member.role}</span>
                                    </div>
                                    {member.role !== 'owner' && (
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setInviteOpen(false)}
                teamId={currentTeamId}
            />
        </div>
    );
}
