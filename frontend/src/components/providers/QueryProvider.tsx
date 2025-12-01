'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
    // QueryClient는 한 번만 생성되도록 useState로 관리합니다.
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // 윈도우 포커스 시 자동 재요청 방지 (개발 편의성)
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}