
import { Skeleton } from "@/components/ui/skeleton";

export function PromptFormSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Form Fields Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
                {/* Title Input */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>

                {/* Category Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                </div>

                {/* Mode Switcher */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}
