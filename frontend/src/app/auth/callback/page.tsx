'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const next = searchParams.get('next') ?? '/';

            console.log('[AuthCallback] Starting callback handler');
            console.log('[AuthCallback] Code from URL:', code ? 'Present' : 'Missing');

            if (code) {
                try {
                    console.log('[AuthCallback] Attempting code exchange...');
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

                    if (error) {
                        console.error('[AuthCallback] Code exchange error:', error.message);
                        router.push('/auth?error=AuthCodeExchangeError');
                        return;
                    }

                    console.log('[AuthCallback] Code exchange successful, session:', data.session ? 'Created' : 'Missing');

                    if (data.session) {
                        console.log('[AuthCallback] Redirecting to:', next);
                        router.push(next);
                        return;
                    }
                } catch (err) {
                    console.error('[AuthCallback] Unexpected error during code exchange:', err);
                    router.push('/auth?error=UnexpectedError');
                    return;
                }
            }

            // Fallback: check existing session
            console.log('[AuthCallback] Checking existing session...');
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('[AuthCallback] Get session error:', error.message);
                router.push('/auth?error=AuthCallbackError');
                return;
            }

            if (session) {
                console.log('[AuthCallback] Existing session found, redirecting to:', next);
                router.push(next);
            } else {
                console.log('[AuthCallback] No session found, redirecting to auth');
                router.push('/auth');
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">로그인 처리 중입니다...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
