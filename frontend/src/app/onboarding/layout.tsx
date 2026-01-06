'use client';

import { ReactNode } from 'react';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            {/* Basic Container for Onboarding */}
            <div className="w-full max-w-4xl">
                {children}
            </div>
        </div>
    );
}
