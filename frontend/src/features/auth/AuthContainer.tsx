'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 로컬 환경의 tsconfig.json 설정에 따라 @ alias를 사용합니다.
import { supabase } from '@/utils/supabase/client';
import { useAuthStore } from './store';
// Figma에서 생성된 UI 컴포넌트 가져오기 (Named Import)
import { AuthPage } from '@/components/ui-generated/auth/AuthPage';
import { UpdatePasswordForm } from '@/components/ui-generated/auth/UpdatePasswordForm';
import { useAlert } from '@/components/providers/AlertProvider';
import { migrateGuestData, checkEmailExists } from './api';

export default function AuthContainer() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup' | 'update_password'>('login');
    const router = useRouter();
    // const setSession = useAuthStore((state) => state.setSession); // ClientLayout handles this now
    const { alert } = useAlert();

    const { isInitialized, session } = useAuthStore();

    // 1. 초기 세션 확인 및 리스너 등록
    useEffect(() => {
        // Global Auth (ClientLayout)가 초기화될 때까지 대기
        if (!isInitialized) return;

        // 이미 로그인되어 있다면 메인으로 이동
        const isUpdatePasswordPage = window.location.pathname === '/auth/update-password' || window.location.hash.includes('type=recovery');
        if (session && !isUpdatePasswordPage) {
            router.push('/');
        }


        // Check for Update Password URL
        if (window.location.pathname === '/auth/update-password' || window.location.hash.includes('type=recovery')) {
            setMode('update_password');
        }

        // 로그인/로그아웃 등 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
            console.log("Auth State Change:", event);
            if (event === 'PASSWORD_RECOVERY') {
                setMode('update_password');
            } else if (event === 'SIGNED_IN') {
                // ClientLayout handles setSession, but we can keep it here for immediate reactivity in this component if needed.
                // But reliance on store is better.
                // However, the event gives us the *triggers* like SIGNED_IN.

                // Fix: Check URL path as 'mode' state might be stale in this closure
                const isUpdatePasswordPage = window.location.pathname === '/auth/update-password' || window.location.hash.includes('type=recovery');
                if (!isUpdatePasswordPage) {
                    router.push('/');
                } else {
                    // Ensure mode is correct
                    setMode('update_password');
                }
            } else if (event === 'SIGNED_OUT') {
                setMode('login');
            }
        });

        // 컴포넌트 언마운트 시 리스너 해제
        return () => subscription.unsubscribe();
    }, [router, isInitialized, session]);

    // 2. 회원가입 핸들러 (SignUpForm에서 호출)
    const handleSignUp = async (email: string, password: string): Promise<void> => {
        try {
            // 1. 이메일 중복 확인 (Backend DB Check)
            const checkResult = await checkEmailExists(email);
            // console.log("DEBUG: checkResult", checkResult); // Optional: keep or remove. I'll remove as per 'clean' instruction.

            if (checkResult.exists) {
                await alert('이미 가입된 이메일입니다. 로그인할 수 있도록 이동합니다.');
                setMode('login');
                return;
            }

            // 2. Supabase Sign Up
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        terms_agreed: true
                    }
                }
            });
            // console.log('SignUp Debug - Response:', { data, error });
            if (error) throw error;

            await alert('회원가입 성공! 이메일을 확인하여 인증을 완료해주세요.');
        } catch (error: any) {
            // "User already registered" - Double check for safety, though frontend check should catch it first
            if (error.message && (error.message.includes('User already registered') || error.message.includes('already registered'))) {
                await alert('이미 가입된 이메일입니다. 로그인할 수 있도록 이동합니다.');
                setMode('login');
                return;
            }

            await alert(error.message || '회원가입 중 오류가 발생했습니다.');
            throw error;
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
            let message = error.message || '로그인 중 오류가 발생했습니다.';

            // Supabase returns "Invalid login credentials" for both wrong password and user not found
            if (message.includes('Invalid login credentials')) {
                message = '회원정보를 다시 확인해주세요.';
            } else if (message.includes('Email not confirmed')) {
                message = '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.';
            }

            await alert(message);
            // throw error; // UI 컴포넌트에서 에러 처리를 할 수 있도록 throw -> Alert 처리했으므로 throw 하지 않음 (또는 UI에서 로딩 상태 해제용으로 필요할 수 있음)
            throw error;
        }
    };

    // 4. 구글 로그인 핸들러
    const handleGoogleLogin = async (): Promise<void> => {
        try {
            // 인앱 브라우저 감지 (카카오, 네이버, 라인, 인스타그램, 페이스북 등)
            const userAgent = navigator.userAgent.toLowerCase();
            const isInApp = /kakao|katalk|naver|line|fbav|instagram|everytime/.test(userAgent);

            if (isInApp) {
                await alert('구글 보안 정책에 의해 인앱 브라우저에서는 로그인이 불가능합니다.\n\n우측 상단 또는 하단의 메뉴(⋮)를 눌러 "다른 브라우저로 열기"를 선택해주세요.');
                return;
            }

            const getRedirectUrl = () => {
                return `${window.location.origin}/auth/callback`;
            };

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: getRedirectUrl(),
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                },
            });
            if (error) throw error;
            // Google login redirect handles the rest. 
        } catch (error: any) {
            await alert(error.message || '구글 로그인 중 오류가 발생했습니다.');
        }
    };


    // 성공 시 리다이렉트 처리 함수 (UI 컴포넌트 요청 사항)
    const handleAuthSuccess = () => {
        router.push('/');
    };

    // 5. UI 렌더링 (Props 주입)
    if (mode === 'update_password') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                    <UpdatePasswordForm onSuccess={() => {
                        setMode('login');
                        router.push('/');
                    }} />
                </div>
            </div>
        )
    }

    return (
        <AuthPage
            onSignUp={handleSignUp}
            onEmailLogin={handleSignIn}
            onGoogleLogin={handleGoogleLogin}
            onAuthSuccess={handleAuthSuccess}
            mode={mode as 'login' | 'signup'}
            onSwitchToLogin={() => setMode('login')}
            onSwitchToSignUp={() => setMode('signup')}
        />
    );
}