import { Skeleton } from "@/components/ui-generated/ui/skeleton";
import { ArrowLeft, Plus, Save } from "lucide-react";

export function ProjectDetailSkeleton() {
    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header Skeleton */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full text-gray-300">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <div>
                        <Skeleton className="h-6 w-48 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                        <Plus className="w-4 h-4 text-gray-300" />
                        <Skeleton className="h-4 w-16 hidden md:block" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <Save className="w-4 h-4 text-gray-300" />
                        <Skeleton className="h-4 w-20 hidden md:block" />
                    </div>
                </div>
            </div>

            {/* Canvas Skeleton */}
            <div className="flex-1 w-full h-full relative overflow-hidden">
                {/* Background Grid Simulation */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                {/* Mock Nodes */}
                <div className="absolute top-1/4 left-1/4">
                    <div className="w-64 h-32 bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>

                <div className="absolute top-1/3 left-1/2">
                    <div className="w-64 h-32 bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>

                {/* Controls Skeleton */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                    <div className="w-8 h-8 bg-white rounded shadow-sm border border-gray-200"></div>
                    <div className="w-8 h-8 bg-white rounded shadow-sm border border-gray-200"></div>
                    <div className="w-8 h-8 bg-white rounded shadow-sm border border-gray-200"></div>
                </div>

                {/* Minimap Skeleton */}
                <div className="absolute bottom-4 right-4 w-48 h-32 bg-white rounded shadow-sm border border-gray-200 p-2">
                    <Skeleton className="w-full h-full bg-gray-50" />
                </div>
            </div>
        </div>
    );
}
