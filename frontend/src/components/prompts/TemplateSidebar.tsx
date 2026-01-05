
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, X } from 'lucide-react';
import { api } from '@/utils/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Template {
    id: string;
    title: string;
    description?: string;
    content: string;
    mode: 'simple' | 'assistance';
    category?: { name: string };
    applicable_agents?: string[];
    preview_image_url?: string;
}

interface TemplateSidebarProps {
    selectedCategory: string;
    selectedSubCategory: string;
    currentMode: 'simple' | 'assistance';
    onApplyTemplate: (template: Template) => void;
}

export function TemplateSidebar({
    selectedCategory,
    selectedSubCategory,
    currentMode,
    onApplyTemplate,
}: TemplateSidebarProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                // Construct query params
                const params: any = { mode: currentMode };
                if (selectedSubCategory) {
                    params.subCategory = selectedSubCategory;
                }

                // If no subcategory is selected, we might want to fetch all or based on major category?
                // The API currently seems to filter by subCategory value (PromptTemplate.sub_category or joined Category.value).
                // If backend supports filtering by major category, use that. 
                // Based on `templates.py`, it accepts `subCategory` (value) or `category_id`.
                // Checking previous code, `PromptForm` sent `subCategory` value.
                // If only Major Category is selected, we might need to handle that or just show all if backend doesn't support 'major only'.
                // For now, let's fetch based on subCategory if present.
                // If subCategory is empty but selectedCategory is present, we ideally should show all templates in that major category.
                // However, the current backend implementation `list_templates` seems to rely on `subCategory` string value to find the Category ID.
                // We might need to adjust backend or just fetch all and filter client side if subCategory is missing.
                // For MVP v3.5.1, let's assume we fetch all if no subCategory, or fetch by subCategory if present.

                // [Requirement] If job category is not selected, show all templates.

                const response = await api.get('/api/templates/', { params });
                setTemplates(response.data);
            } catch (error) {
                console.error("Failed to fetch templates", error);
                setTemplates([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, [selectedCategory, selectedSubCategory, currentMode]);

    // Client-side filtering for Search and Major Category if needed
    const filteredTemplates = templates.filter(t => {
        const title = t.title || (t as any).name || '';
        const description = t.description || '';
        const searchLower = searchTerm.toLowerCase();

        return title.toLowerCase().includes(searchLower) ||
            description.toLowerCase().includes(searchLower);
    });

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    템플릿 조회
                </h3>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="템플릿 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
                    />
                </div>
            </div>

            {/* Filter Status (Optional: Show active filters) */}
            {(selectedCategory || selectedSubCategory) && (
                <div className="px-4 py-2 bg-blue-50/50 flex flex-wrap gap-1 border-b border-blue-50">
                    <span className="text-xs text-blue-600 font-medium whitespace-nowrap">
                        {selectedSubCategory || selectedCategory}
                    </span>
                </div>
            )}

            {/* Template List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        <p>조건에 맞는 템플릿이 없습니다</p>
                        {selectedCategory && (
                            <p className="text-xs text-gray-400 mt-1">다른 직무나 검색어를 시도해보세요</p>
                        )}
                    </div>
                ) : (
                    filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex gap-3"
                            onClick={() => onApplyTemplate(template)}
                        >
                            {/* Thumbnail */}
                            {template.preview_image_url && (
                                <div className="shrink-0">
                                    <img
                                        src={template.preview_image_url}
                                        alt={template.title}
                                        className="w-16 h-16 object-cover rounded-md border border-gray-100 bg-gray-50"
                                    />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600">
                                        {template.title || '제목 없음'}
                                    </h4>
                                    {template.mode === 'assistance' && (
                                        <Sparkles className="w-3 h-3 text-purple-500 shrink-0 mt-1 ml-1" />
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 line-clamp-2 mb-2 h-8">
                                    {template.description || '설명이 없습니다.'}
                                </p>

                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-gray-100 text-gray-600 font-normal">
                                        {template.category?.name || '기타'}
                                    </Badge>
                                    <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                        적용하기 →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 bg-gray-50 text-[10px] text-gray-400 text-center border-t border-gray-100">
                원하는 템플릿을 클릭하여 내용을 적용하세요
            </div>
        </div>
    );
}
