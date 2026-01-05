import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists
// Type definition (Mock or import) - import later
// import { PromptTemplate } from '@/types'; 

interface TemplateCardProps {
    template: any; // Replace with proper type later
    onClick?: () => void;
    className?: string;
}

export function TemplateCard({ template, onClick, className }: TemplateCardProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/templates/detail?id=${template.id}`);
        }
    };

    const hasImage = !!template.preview_image_url;

    if (!hasImage) {
        return (
            <div
                onClick={handleClick}
                className={cn(
                    "group relative bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 flex flex-col break-inside-avoid mb-4",
                    className
                )}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
                <div className="p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {template.category?.name || '기타'}
                        </span>
                        {template.mode === 'assistance' && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                                P.A.I.R
                            </span>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {template.title || template.name}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-4 mb-4">
                        {template.description || (template.content ? template.content.substring(0, 100) + '...' : 'No description')}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Admin</span>
                        </div>
                        {template.usage_count > 0 && (
                            <span>{template.usage_count} uses</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group relative bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 flex flex-col break-inside-avoid mb-4",
                className
            )}
        >
            {/* Preview Image - Flexible Height */}
            <div className="w-full bg-gray-100 overflow-hidden relative shrink-0">
                <img
                    src={template.preview_image_url}
                    alt={template.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {template.category?.name || '기타'}
                    </span>
                    {template.mode === 'assistance' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                            P.A.I.R
                        </span>
                    )}
                </div>

                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                    {template.title || template.name}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {template.description || (template.content ? template.content.substring(0, 60) + '...' : 'No description')}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Admin</span>
                    </div>
                    {/* Usage Count if available */}
                    {template.usage_count > 0 && (
                        <span>{template.usage_count} uses</span>
                    )}
                </div>
            </div>
        </div>
    );
}
