'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthPage } from '@/components/ui-generated/auth/AuthPage';
import { supabase } from '@/utils/supabase/client';
import { useAuthStore } from './store';
import { toast } from 'sonner';

export default function AuthContainer() {
    const router = useRouter();
    const { setSession } = useAuthStore();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                router.push('/dashboard'); // or wherever
            }
        });

        return () => subscription.unsubscribe();
    }, [router, setSession]);

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            toast.error(error.message);
        }
    };

    const handleEmailLogin = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const handleSignUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            toast.error(error.message);
            throw error;
        }
        toast.success('Check your email for the confirmation link.');
    };

    return (
        <AuthPage
            onAuthSuccess={() => router.push('/dashboard')}
            onGoogleLogin={handleGoogleLogin}
            onEmailLogin={handleEmailLogin}
            onSignUp={handleSignUp}
        />
    );
}
