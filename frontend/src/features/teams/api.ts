
import { api } from '@/utils/axios';
import { Team, TeamCreate, TeamMember, MemberAdd } from './types';
export type { Team, TeamCreate, TeamMember, MemberAdd };

export const getTeams = async (): Promise<Team[]> => {
    const response = await api.get('/api/teams/');
    return response.data;
};

export const createTeam = async (data: TeamCreate): Promise<Team> => {
    const response = await api.post('/api/teams/', data);
    return response.data;
};

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    const response = await api.get(`/api/teams/${teamId}/members`);
    return response.data;
};

export const addTeamMember = async (teamId: string, data: MemberAdd): Promise<TeamMember> => {
    const response = await api.post(`/api/teams/${teamId}/members`, data);
    return response.data;
};

export const leaveTeam = async (teamId: string): Promise<void> => {
    // Assuming backend endpoint exists or will be created? 
    // Backend router "teams.py" didn't explicitly show "leave" but "remove member" might support self.
    // For now omitting if not verified.
    // Let's assume DELETE /api/teams/{id}/members/{user_id}
    throw new Error("Not implemented yet");
};
