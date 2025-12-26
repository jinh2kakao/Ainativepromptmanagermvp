import React from 'react';

export function AssistanceSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Simulate 4 sections (Persona, Asset, Instruction, Result) */}
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    {/* Header Skeleton */}
                    <div className="w-full px-4 md:px-5 py-3 md:py-4 bg-gray-50 flex items-center justify-between min-h-[60px]">
                        <div className="flex items-center gap-2 md:gap-3 flex-1">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0"></div>
                    </div>

                    {/* Content Skeleton (Simulate expanded state for first item or random) */}
                    <div className="p-3 md:p-5 space-y-4 bg-white border-t border-gray-100">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-20 bg-gray-200 rounded w-full"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-20 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
