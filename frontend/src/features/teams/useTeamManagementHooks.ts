import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { TeamMember, TeamRole } from '@/features/teams/types';

// Fetch Team Members
export const useTeamMembers = (teamId: string) => {
    return useQuery<TeamMember[]>({
        queryKey: ['team-members', teamId],
        queryFn: async () => {
            const response = await api.get(`/api/teams/${teamId}/members`);
            return response.data;
        },
        enabled: !!teamId,
    });
};

// Invite Member
export const useInviteMember = (teamId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { user_email: string; role: TeamRole }) => {
            const response = await api.post(`/api/teams/${teamId}/members`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
        },
    });
};

// Update Member Role
export const useUpdateMemberRole = (teamId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { userId: string; role: TeamRole }) => {
            const response = await api.patch(`/api/teams/${teamId}/members/${data.userId}/role`, null, {
                params: { role: data.role }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
        },
    });
};

// Remove Member
export const useRemoveMember = (teamId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/api/teams/${teamId}/members/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
        },
    });
};
