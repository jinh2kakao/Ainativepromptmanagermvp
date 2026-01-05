'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDragScroll } from '@/hooks/useDragScroll';

// Category emoji mapping based on actual Korean category values
const categoryEmojis: Record<string, string> = {
    // Root Categories (Korean)
    '서비스 & 프로덕트 기획': '📋',
    '서비스_&_프로덕트_기획': '📋',
    'UI/UX & 크리에이티브 디자인': '🎨',
    'ui/ux_&_크리에이티브_디자인': '🎨',
    '소프트웨어 개발 & 엔지니어링': '💻',
    '소프트웨어_개발_&_엔지니어링': '💻',
    '데이터 분석 & AI': '🤖',
    '데이터_분석_&_ai': '🤖',
    '마케팅 & 그로스': '📈',
    '마케팅_&_그로스': '📈',
    '유튜브 & 영상 미디어': '🎬',
    '유튜브_&_영상_미디어': '🎬',
    '비즈니스 일반 & 영업': '💼',
    '비즈니스_일반_&_영업': '💼',
    '인사 & 조직문화': '👥',
    '인사_&_조직문화': '👥',
    '고객 경험 & 지원 (CS/CX)': '💬',
    '고객_경험_&_지원_(cs/cx)': '💬',
    // English fallbacks
    'development': '💻',
    'coding': '💻',
    'design': '🎨',
    'business': '💼',
    'data': '📊',
    'hr': '👥',
    'marketing': '📢',
    'writing': '✍️',
    'education': '📚',
    'image': '🖼️',
    'character': '🎭',
    'default': '📁',
};

const getCategoryEmoji = (value: string): string => {
    if (!value) return categoryEmojis['default'];

    // Try exact match first
    if (categoryEmojis[value]) return categoryEmojis[value];

    // Try lowercase with underscores
    const normalizedKey = value.toLowerCase().replace(/[\s]/g, '_');
    if (categoryEmojis[normalizedKey]) return categoryEmojis[normalizedKey];

    // Try partial match
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

    return categoryEmojis['default'];
};

interface Category {
    id: string;
    name: string;
    value: string;
    parent_id?: string | null;
}

interface CategoryGridProps {
    categories: Category[];
    selectedId?: string | null;
    onSelect?: (category: Category) => void;
    navigateOnClick?: boolean;
    className?: string;
}

export function CategoryGrid({
    categories,
    selectedId,
    onSelect,
    navigateOnClick = false,
    className = '',
}: CategoryGridProps) {
    const router = useRouter();
    const { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, isDragging } = useDragScroll();

    const handleClick = (cat: Category) => {
        // Prevent click during drag
        if (isDragging) return;

        if (onSelect) {
            onSelect(cat);
        }
        if (navigateOnClick) {
            router.push(`/templates?category=${cat.id}`);
        }
    };

    if (categories.length === 0) return null;

    return (
        <div
            ref={ref}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            className={`
                flex gap-3 overflow-x-auto pb-2 
                scrollbar-hide cursor-grab active:cursor-grabbing
                select-none
                ${className}
            `}
            style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE and Edge */
            }}
        >
            {categories.map((cat) => {
                const isSelected = selectedId === cat.id;
                return (
                    <button
                        key={cat.id}
                        onClick={() => handleClick(cat)}
                        className={`
                            flex flex-col items-center justify-center gap-2 p-4 
                            bg-white border rounded-xl 
                            hover:border-blue-400 hover:shadow-md 
                            transition-all duration-200 group
                            min-w-[100px] shrink-0
                            ${isSelected
                                ? 'border-blue-500 shadow-md bg-blue-50'
                                : 'border-gray-200'
                            }
                        `}
                    >
                        <span className="text-2xl">{getCategoryEmoji(cat.value)}</span>
                        <span className={`text-sm font-medium text-center transition-colors whitespace-nowrap ${isSelected
                            ? 'text-blue-600'
                            : 'text-gray-700 group-hover:text-blue-600'
                            }`}>
                            {cat.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export { getCategoryEmoji };
