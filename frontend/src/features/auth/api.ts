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
