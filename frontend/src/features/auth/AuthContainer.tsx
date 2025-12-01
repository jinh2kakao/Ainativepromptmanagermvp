'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 로컬 환경에서는 @ 별칭이 정상 작동합니다.
import { supabase } from '@/utils/supabase/client';
import { useAuthStore } from './store';
// Figma에서 생성된 UI 컴포넌트 가져오기
import { AuthPage } from '@/components/ui-generated/auth/AuthPage';

export default function AuthContainer() {
    const router = useRouter();
    const setSession = useAuthStore((state) => state.setSession);

    // 1. 세션 체크
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) router.push('/');
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) router.push('/');
        });

        return () => subscription.unsubscribe();
    }, [router, setSession]);

    // 2. 핸들러 정의 (UI 컴포넌트로 전달될 함수들)
    const handleSignUp = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            alert('회원가입 성공! 이메일을 확인하여 인증을 완료해주세요.');
        } catch (error: any) {
            console.error(error);
            alert(error.message || '회원가입 중 오류가 발생했습니다.');
            // 에러를 UI로 전파하지 않고 여기서 처리하거나, 필요시 throw
        }
    };

    const handleSignIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (error: any) {
            console.error(error);
            alert(error.message || '로그인 중 오류가 발생했습니다.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        }
    };

    // 3. UI 렌더링 (Props 주입)
    // AuthPage가 요구하는 onSignUp, onSignIn 등의 props 이름과 매칭시킵니다.
    return (
        <AuthPage
            onSignUp={handleSignUp}
            onEmailLogin={handleSignIn}
            onGoogleLogin={handleGoogleLogin}
            onAuthSuccess={() => router.push('/')}
        />
    );
}