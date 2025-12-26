import { supabase } from '@/utils/supabase/client';

export const fetchCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const response = await fetch('http://localhost:8000/api/me', {
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }

    return response.json();
};

import { api } from '@/utils/axios';

export const migrateGuestData = async (guestId: string): Promise<void> => {
    await api.post(`/api/auth/migrate?guest_id=${guestId}`);
};

export const checkEmailExists = async (email: string): Promise<{ exists: boolean; provider?: string }> => {
    try {
        const response = await api.post('/api/auth/check-email', { email });
        return response.data;
    } catch (error) {
        console.error("Failed to check email existence:", error);
        return { exists: false };
    }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    await api.post('/api/auth/reset-password-request', {
        email,
        redirect_to: `${window.location.origin}/auth/update-password`
    });
};
