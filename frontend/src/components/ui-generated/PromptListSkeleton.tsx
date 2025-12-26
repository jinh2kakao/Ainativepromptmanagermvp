import { Skeleton } from "@/components/ui-generated/ui/skeleton";

export function PromptListSkeleton() {
    return (
        <div className="space-y-6">
            {/* Page Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-11 w-full sm:w-32 rounded-lg" />
            </div>

            {/* Search & Filter Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                                <div className="flex gap-2">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-3/4" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
