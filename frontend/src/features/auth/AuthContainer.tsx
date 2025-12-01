'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 로컬 환경의 tsconfig.json 설정에 따라 @ alias를 사용합니다.
import { supabase } from '@/utils/supabase/client';
import { useAuthStore } from './store';
// Figma에서 생성된 UI 컴포넌트 가져오기 (Named Import)
import { AuthPage } from '@/components/ui-generated/auth/AuthPage';

export default function AuthContainer() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const setSession = useAuthStore((state) => state.setSession);

    // 1. 초기 세션 확인 및 리스너 등록
    useEffect(() => {
        const checkSession = async () => {
            // 현재 세션 가져오기
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) router.push('/'); // 이미 로그인되어 있다면 메인으로 이동
        };

        checkSession();

        // 로그인/로그아웃 등 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) router.push('/');
        });

        // 컴포넌트 언마운트 시 리스너 해제
        return () => subscription.unsubscribe();
    }, [router, setSession]);

    // 2. 회원가입 핸들러 (SignUpForm에서 호출)
    const handleSignUp = async (email: string, password: string): Promise<void> => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            alert('회원가입 성공! 이메일을 확인하여 인증을 완료해주세요.');
        } catch (error: any) {
            alert(error.message || '회원가입 중 오류가 발생했습니다.');
            throw error; // UI 컴포넌트에서 에러 처리를 할 수 있도록 throw
        }
    };

    // 3. 로그인 핸들러 (LoginForm에서 호출)
    const handleSignIn = async (email: string, password: string): Promise<void> => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // 로그인 성공 시 useEffect의 리스너가 감지하여 리다이렉트 처리함
        } catch (error: any) {
            alert(error.message || '로그인 중 오류가 발생했습니다.');
            throw error;
        }
    };

    // 4. 구글 로그인 핸들러
    const handleGoogleLogin = async (): Promise<void> => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            alert(error.message || '구글 로그인 중 오류가 발생했습니다.');
        }
    };

    // 성공 시 리다이렉트 처리 함수 (UI 컴포넌트 요청 사항)
    const handleAuthSuccess = () => {
        router.push('/');
    };

    // 5. UI 렌더링 (Props 주입)
    return (
        <AuthPage
            onSignUp={handleSignUp}
            onEmailLogin={handleSignIn}
            onGoogleLogin={handleGoogleLogin}
            onAuthSuccess={handleAuthSuccess}
        />
    );
}