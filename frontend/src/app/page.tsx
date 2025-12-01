'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
// [핵심] 로그인 전/후를 담당하는 두 컨테이너를 불러옵니다.
import AuthContainer from '@/features/auth/AuthContainer';
import PromptListContainer from '@/features/prompts/PromptListContainer';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 세션 확인 로직 (변경 없음)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // 1. 로그인이 안 된 경우 -> 로그인 화면 (중앙 정렬)
  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <AuthContainer />
      </main>
    );
  }

  // 2. 로그인이 된 경우 -> 프롬프트 대시보드 (전체 화면)
  // [수정] 불필요한 div 껍데기를 모두 벗기고 PromptListContainer만 반환합니다.
  return <PromptListContainer />;
}