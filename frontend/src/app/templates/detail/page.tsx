
import React, { Suspense } from 'react';
import { TemplateDetailContent } from './TemplateDetailContent';

export default function TemplateDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <TemplateDetailContent />
        </Suspense>
    );
}
