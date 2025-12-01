import { Suspense } from 'react';
import { PromptDetailClient } from './PromptDetailClient';

export default function PromptDetail() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <PromptDetailClient />
        </Suspense>
    );
}
