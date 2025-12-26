'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTeamMembers, useRemoveMember, useUpdateMemberRole } from '@/features/teams/useTeamManagementHooks';
import { InviteMemberModal } from '@/components/teams/InviteMemberModal';
import { TeamRole } from '@/features/teams/types';
import {
    Users,
    UserPlus,
    MoreVertical,
    Loader2,
    Shield,
    Trash2,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/features/auth/useUser';

function TeamSettingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const teamId = searchParams.get('id');
    const { data: currentUser } = useUser();

    // Data Fetching
    const { data: members, isLoading, error } = useTeamMembers(teamId || '');

    // Mutations
    const { mutate: removeMember } = useRemoveMember(teamId || '');
    const { mutate: updateRole } = useUpdateMemberRole(teamId || '');

    // UI State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

    // Check if current user is owner/admin
    const myMembership = members?.find(m => m.user_id === currentUser?.id);
    const canManage = myMembership?.role === 'owner' || myMembership?.role === 'admin';

    const handleRoleChange = (userId: string, newRole: TeamRole) => {
        updateRole({ userId, role: newRole }, {
            onSuccess: () => {
                toast.success('Role updated');
                setEditingMemberId(null);
            },
            onError: () => toast.error('Failed to update role')
        });
    };

    const handleRemoveMember = (userId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        removeMember(userId, {
            onSuccess: () => toast.success('Member removed'),
            onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to remove member')
        });
    };

    if (!teamId) {
        return <div className="p-12 text-center text-gray-500">Invalid Team ID</div>;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Failed to load team settings. Please try again.
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-gray-500" />
                        Team Settings
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage members and permissions for your team.
                    </p>
                </div>
                {canManage && (
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite Member
                    </button>
                )}
            </div>

            {/* Members List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Members ({members?.length || 0})</h2>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3">Member</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Joined</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {members?.map((member) => (
                            <tr key={member.user_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                            {member.user_name || member.user?.name || 'Unknown User'}
                                            {member.user_id === currentUser?.id && <span className="text-blue-600 text-xs ml-2">(You)</span>}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {member.user_email || member.user?.email}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingMemberId === member.user_id ? (
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.user_id, e.target.value as TeamRole)}
                                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                            onBlur={() => setEditingMemberId(null)}
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    ) : (
                                        <span className={`
                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                            ${member.role === 'owner' ? 'bg-purple-50 text-purple-700 border-purple-100' : ''}
                                            ${member.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                                            ${member.role === 'editor' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                                            ${member.role === 'viewer' ? 'bg-gray-50 text-gray-600 border-gray-100' : ''}
                                        `}>
                                            <Shield className="w-3 h-3" />
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(member.joined_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {canManage && member.role !== 'owner' && member.user_id !== currentUser?.id && (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingMemberId(editingMemberId === member.user_id ? null : member.user_id)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="Change Role"
                                            >
                                                {editingMemberId === member.user_id ? <Check className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleRemoveMember(member.user_id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                title="Remove Member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                teamId={teamId || ''}
            />
        </div>
    );
}

export default function TeamSettingsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>}>
            <TeamSettingsContent />
        </Suspense>
    );
}
