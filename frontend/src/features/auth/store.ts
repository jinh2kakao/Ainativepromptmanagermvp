import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';

// 상태 타입 정의
interface AuthState {
    user: User | null;
    session: Session | null;
    isInitialized: boolean;
    setSession: (session: Session | null) => void;
    setUser: (user: User | null) => void;
    setInitialized: (val: boolean) => void;
}

// 전역 상태 저장소 생성
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isInitialized: false,
    // 세션이 업데이트되면 유저 정보도 같이 업데이트
    setSession: (session) => set({ session, user: session?.user ?? null }),
    setUser: (user) => set({ user }),
    setInitialized: (val) => set({ isInitialized: val }),
}));