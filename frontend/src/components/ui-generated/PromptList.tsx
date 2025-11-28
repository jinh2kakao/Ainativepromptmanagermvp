'use client';

import { Copy, Lock } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Prompt } from '@/types';
import { toast } from 'sonner';

interface PromptListProps {
    prompts: Prompt[];
    onRun: (prompt: Prompt) => void;
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
    onPromptClick?: (prompt: Prompt) => void;
}

// Category icon mapping
const categoryIcons: Record<string, string> = {
    "서비스 & 프로덕트 기획": "📋",
    "UI/UX & 크리에이티브 디자인": "🎨",
    "소프트웨어 개발 & 엔지니어링": "💻",
    "데이터 분석 & AI": "📊",
    "마케팅 & 그로스": "📈",
    "유튜브 & 영상 미디어": "🎬",
    "비즈니스 일반 & 영업": "💼",
    "인사 & 조직문화": "👥",
    "고객 경험 & 지원 (CS/CX)": "💬"
};

// Get category icon
function getCategoryIcon(category: string): string {
    return categoryIcons[category] || "📝";
}

// Truncate text
function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function PromptList({ prompts, onRun, onEdit, onDelete, onPromptClick }: PromptListProps) {
    if (prompts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center bg-white border border-gray-200 rounded-lg px-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                    <span className="text-2xl md:text-3xl">🔍</span>
                </div>
                <h3 className="text-gray-900 mb-2 text-base md:text-lg">검색 결과가 없습니다</h3>
                <p className="text-gray-500 max-w-md text-xs md:text-sm">
                    다른 검색어나 필터를 시도해보세요
                </p>
            </div>
        );
    }

    const handleQuickCopy = async (e: React.MouseEvent, prompt: Prompt) => {
        e.stopPropagation();

        try {
            await navigator.clipboard.writeText(prompt.content);
            toast.success('프롬프트가 복사되었습니다!');
        } catch (error) {
            // Fallback
            try {
                const textArea = document.createElement('textarea');
                textArea.value = prompt.content;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast.success('프롬프트가 복사되었습니다!');
            } catch {
                toast.error('복사에 실패했습니다');
            }
        }
    };

    return (
        <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}
        >
            <Masonry gutter="12px">
                {prompts.map((prompt) => (
                    <div
                        key={prompt.id}
                        onClick={() => onPromptClick?.(prompt)}
                        className="w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
                        style={{ width: '100%' }}
                    >
                        {/* Header with Category Icon */}
                        <div className="p-3 md:p-4 pb-2 md:pb-3 border-b border-gray-100">
                            <div className="flex items-start justify-between gap-2 md:gap-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-xl md:text-2xl flex-shrink-0">
                                        {getCategoryIcon(prompt.category || '')}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm md:text-base text-gray-900 line-clamp-2 break-words">
                                            {prompt.title}
                                        </h3>
                                        {prompt.subCategory && (
                                            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
                                                {prompt.subCategory}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Privacy Badge */}
                                {!prompt.isPublic && (
                                    <div className="flex-shrink-0">
                                        <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Preview */}
                        <div className="p-3 md:p-4 pt-2 md:pt-3">
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap break-all leading-relaxed overflow-hidden">
                                {prompt.content}
                            </p>
                        </div>

                        {/* Tags & Actions */}
                        <div className="px-3 md:px-4 pb-3 md:pb-4">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 md:gap-1.5 mb-2 md:mb-3">
                                {/* Mode Badge */}
                                <span className={`inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-xs ${prompt.mode === 'simple'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                    }`}>
                                    {prompt.mode === 'simple' ? '📝 일반' : '🤖 AI'}
                                </span>

                                {/* Variable Count */}
                                {prompt.variables && prompt.variables.length > 0 && (
                                    <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-md text-[10px] md:text-xs">
                                        변수 {prompt.variables.length}개
                                    </span>
                                )}

                                {/* Category Badge (on small screens) */}
                                {prompt.category && (
                                    <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-[10px] md:text-xs line-clamp-1">
                                        {truncate(prompt.category, 20)}
                                    </span>
                                )}
                            </div>

                            {/* Quick Copy Button - Always visible on Mobile, Hover on Desktop */}
                            <button
                                onClick={(e) => handleQuickCopy(e, prompt)}
                                className="w-full px-3 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 text-xs md:text-sm shadow-sm md:opacity-0 md:group-hover:opacity-100 min-h-[44px] md:min-h-[auto]"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                빠른 복사
                            </button>
                        </div>
                    </div>
                ))}
            </Masonry>
        </ResponsiveMasonry>
    );
}
