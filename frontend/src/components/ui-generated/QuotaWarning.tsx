'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface QuotaWarningProps {
    message: string;
    severity: 'warning' | 'error';
    onSignUp?: () => void;
}

export function QuotaWarning({ message, severity, onSignUp }: QuotaWarningProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <div
            className={`rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3 shadow-sm ${severity === 'error'
                    ? 'bg-red-50 border border-red-300'
                    : 'bg-yellow-50 border border-yellow-300'
                }`}
        >
            <AlertTriangle
                className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5 ${severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`}
            />
            <div className="flex-1 min-w-0">
                <p className={`leading-relaxed text-sm md:text-base ${severity === 'error' ? 'text-red-800' : 'text-yellow-800'}`}>
                    {message}
                </p>
                {onSignUp && (
                    <button
                        onClick={onSignUp}
                        className={`mt-2 md:mt-3 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-all duration-200 shadow-md hover:shadow-lg min-h-[40px] md:min-h-0 ${severity === 'error'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            }`}
                    >
                        Sign up for free
                    </button>
                )}
            </div>
            <button
                onClick={() => setDismissed(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors min-h-[40px] min-w-[40px] md:min-h-0 md:min-w-0 flex items-center justify-center flex-shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
