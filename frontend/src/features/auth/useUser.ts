import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { User } from '@/types';
import { useAuthStore } from './store';

export const getUserProfile = async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
};

export const getUserUsage = async () => {
    const response = await api.get('/api/auth/usage');
    return response.data;
};

export const useUser = () => {
    const { session } = useAuthStore();

    return useQuery({
        queryKey: ['user', session?.user?.id],
        queryFn: getUserProfile,
        enabled: !!session?.user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUserUsage = () => {
    const { session } = useAuthStore();
    return useQuery({
        queryKey: ['userUsage', session?.user?.id],
        queryFn: getUserUsage,
        enabled: !!session?.user,
        // Refetch often as usage changes frequently
        refetchInterval: 30000
    });
};
