
import React from 'react';
import { TemplateDetailContent } from './TemplateDetailContent';

// Required for Next.js output: 'export'
export async function generateStaticParams() {
    return [];
}

export default function TemplateDetailPage() {
    return <TemplateDetailContent />;
}
