import { createClient } from '@supabase/supabase-js';

// 환경 변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 누락 시 에러 발생 (디버깅 용이성)
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
    );
}

// Supabase 클라이언트 생성 (standard client with localStorage for auth persistence)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // Important for OAuth callback handling
    },
});