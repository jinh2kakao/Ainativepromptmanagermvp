
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeams, createTeam, getTeamMembers, addTeamMember, TeamCreate, MemberAdd } from './api';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store';

export const useTeams = () => {
    const { user, isInitialized } = useAuthStore();
    return useQuery({
        queryKey: ['teams', user?.id],
        queryFn: getTeams,
        enabled: isInitialized && !!user,
    });
};

export const useTeamMembers = (teamId: string | null) => {
    return useQuery({
        queryKey: ['team-members', teamId],
        queryFn: () => getTeamMembers(teamId!),
        enabled: !!teamId,
    });
};

export const useCreateTeam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TeamCreate) => createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team created successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create team.');
        },
    });
};

export const useAddTeamMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, data }: { teamId: string; data: MemberAdd }) => addTeamMember(teamId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] });
            toast.success('Member added successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to add member.');
        },
    });
};
