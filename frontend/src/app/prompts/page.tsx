'use client';

import { Suspense } from 'react';
import PromptListContainer from '@/features/prompts/PromptListContainer';

export default function PromptsPage() {
    return (
        <main className="min-h-screen bg-gray-50/30">
            <Suspense fallback={<div className="flex h-40 items-center justify-center">Loading...</div>}>
                <PromptListContainer />
            </Suspense>
        </main>
    );
}
