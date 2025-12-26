import { Suspense } from 'react';
import { PromptDetailClient } from './PromptDetailClient';
import { PromptDetailSkeleton } from '@/components/ui-generated/PromptDetailSkeleton';

export default function PromptDetail() {
    return (
        <Suspense fallback={<PromptDetailSkeleton />}>
            <PromptDetailClient />
        </Suspense>
    );
}
