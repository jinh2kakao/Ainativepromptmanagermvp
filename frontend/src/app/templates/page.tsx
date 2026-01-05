'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search } from 'lucide-react';
import { api } from '@/utils/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TemplateCard } from '@/components/dashboard/TemplateCard';

const fetchTemplates = async () => {
    const res = await api.get('/api/templates/');
    return res.data;
};

const fetchCategories = async () => {
    const res = await api.get('/api/categories/');
    return res.data;
};

function TemplatesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState('');

    // Split category selection into parent and child
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    // Drag scroll state
    const categoryContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!categoryContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - categoryContainerRef.current.offsetLeft);
        setScrollLeft(categoryContainerRef.current.scrollLeft);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !categoryContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - categoryContainerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        categoryContainerRef.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Initialize from URL query param
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedParentId(categoryFromUrl);
        }
    }, [searchParams]);

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['templates', 'all'],
        queryFn: fetchTemplates,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    // Derive root (parent) and sub (child) categories
    const rootCategories = categories.filter((c: any) => !c.parent_id);
    const currentSubCategories = selectedParentId
        ? categories.filter((c: any) => c.parent_id === selectedParentId)
        : [];

    // Filter logic
    const filteredTemplates = templates.filter((t: any) => {
        // 1. Search Filter
        const matchesSearch = (t.title?.toLowerCase().includes(search.toLowerCase())) ||
            (t.name?.toLowerCase().includes(search.toLowerCase())) ||
            (t.description?.toLowerCase().includes(search.toLowerCase()));

        // 2. Category Filter
        let matchesCategory = true;

        if (selectedChildId) {
            matchesCategory = String(t.category_id) === String(selectedChildId);
        } else if (selectedParentId) {
            const childIds = categories
                .filter((c: any) => c.parent_id === selectedParentId)
                .map((c: any) => c.id);
            matchesCategory = String(t.category_id) === String(selectedParentId) || childIds.includes(t.category_id);
        }

        return matchesSearch && matchesCategory;
    });

    // Handlers
    const handleParentSelect = (cat: any) => {
        if (cat) {
            setSelectedParentId(cat.id);
        } else {
            setSelectedParentId(null);
        }
        setSelectedChildId(null);
    };

    const handleClearParent = () => {
        setSelectedParentId(null);
        setSelectedChildId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Header with Search */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="font-semibold text-lg whitespace-nowrap">All Templates</h1>

                    {/* Search in Header */}
                    <div className="relative flex-1 max-w-md ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search templates..."
                            className="pl-9 w-full h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                {/* Category Filter Section */}
                <div className="mb-8 space-y-6">
                    {/* Parent Categories (CategoryGrid with emojis) */}
                    <div className="space-y-3">
                        {/* Category Grid with All button included */}
                        <div
                            ref={categoryContainerRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                            className={`flex gap-3 overflow-x-auto pb-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {/* All Button */}
                            <button
                                onClick={handleClearParent}
                                className={`
                                    flex flex-col items-center justify-center gap-2 p-4 
                                    bg-white border rounded-xl 
                                    hover:border-blue-400 hover:shadow-md 
                                    transition-all duration-200 min-w-[100px] shrink-0
                                    ${selectedParentId === null
                                        ? 'border-blue-500 shadow-md bg-blue-50'
                                        : 'border-gray-200'
                                    }
                                `}
                            >
                                <span className="text-2xl">🌐</span>
                                <span className={`text-sm font-medium text-center transition-colors whitespace-nowrap ${selectedParentId === null ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    All
                                </span>
                            </button>
                            {/* Inline Category Buttons (same row, for drag scroll) */}
                            {rootCategories.map((cat: any) => {
                                const isSelected = selectedParentId === cat.id;
                                const getCategoryEmoji = (value: string): string => {
                                    if (!value) return '📁';
                                    const lowerValue = value.toLowerCase();
                                    if (lowerValue.includes('기획') || lowerValue.includes('product')) return '📋';
                                    if (lowerValue.includes('디자인') || lowerValue.includes('design') || lowerValue.includes('ux')) return '🎨';
                                    if (lowerValue.includes('개발') || lowerValue.includes('developer') || lowerValue.includes('engineering')) return '💻';
                                    if (lowerValue.includes('데이터') || lowerValue.includes('ai') || lowerValue.includes('분석')) return '🤖';
                                    if (lowerValue.includes('마케팅') || lowerValue.includes('그로스') || lowerValue.includes('marketing')) return '📈';
                                    if (lowerValue.includes('유튜브') || lowerValue.includes('영상') || lowerValue.includes('youtube')) return '🎬';
                                    if (lowerValue.includes('비즈니스') || lowerValue.includes('영업') || lowerValue.includes('business')) return '💼';
                                    if (lowerValue.includes('인사') || lowerValue.includes('조직') || lowerValue.includes('hr')) return '👥';
                                    if (lowerValue.includes('고객') || lowerValue.includes('cs') || lowerValue.includes('cx')) return '💬';
                                    return '📁';
                                };
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleParentSelect(cat)}
                                        className={`
                                            flex flex-col items-center justify-center gap-2 p-4 
                                            bg-white border rounded-xl 
                                            hover:border-blue-400 hover:shadow-md 
                                            transition-all duration-200 min-w-[100px] shrink-0
                                            ${isSelected
                                                ? 'border-blue-500 shadow-md bg-blue-50'
                                                : 'border-gray-200'
                                            }
                                        `}
                                    >
                                        <span className="text-2xl">{getCategoryEmoji(cat.value)}</span>
                                        <span className={`text-sm font-medium text-center transition-colors whitespace-nowrap ${isSelected ? 'text-blue-600' : 'text-gray-700'
                                            }`}>
                                            {cat.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sub Categories (2-depth) - Flex Wrap, No Scroll */}
                        {selectedParentId && currentSubCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center animate-in fade-in slide-in-from-top-2 duration-200">
                                <Button
                                    variant={selectedChildId === null ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedChildId(null)}
                                    className="text-xs px-3 h-8"
                                >
                                    전체
                                </Button>
                                {currentSubCategories.map((cat: any) => (
                                    <Button
                                        key={cat.id}
                                        variant={selectedChildId === cat.id ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedChildId(cat.id)}
                                        className="text-xs px-3 h-8"
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid (Masonry) */}
                {isLoading ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse break-inside-avoid mb-6" />
                        ))}
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No templates found.
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {filteredTemplates.map((t: any) => (
                            <TemplateCard key={t.id} template={t} className="break-inside-avoid mb-6" />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function TemplatesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <TemplatesContent />
        </Suspense>
    );
}
