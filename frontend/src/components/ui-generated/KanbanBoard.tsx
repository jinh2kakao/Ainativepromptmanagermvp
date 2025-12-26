import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Prompt } from '@/types';
import { PromptCard } from './PromptCard';
import { jobCategories } from '@/utils/jobCategories';

interface KanbanBoardProps {
  prompts: Prompt[];
  onRun: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onPromptClick?: (prompt: Prompt) => void;
  deletingId: string | null;
}

export function KanbanBoard({ prompts, onRun, onEdit, onDelete, onPromptClick, deletingId }: KanbanBoardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  // Group ALL prompts by MAIN CATEGORY (대분류) - including simple mode
  const promptsByCategory: Record<string, Prompt[]> = {};
  prompts.forEach((prompt) => {
    const category = prompt.category || '미분류';
    if (!promptsByCategory[category]) {
      promptsByCategory[category] = [];
    }
    promptsByCategory[category].push(prompt);
  });

  // Get all main categories in order
  const mainCategories = jobCategories.map(cat => cat.value);

  // Check scroll state
  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [prompts]);

  // Scroll functions
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320; // Width of one column + gap
    const newScrollLeft = direction === 'left'
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // Mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-gray-900 mb-2">검색 결과가 없습니다</h3>
        <p className="text-gray-500 max-w-md text-sm">
          다른 검색어나 필터를 시도해보세요
        </p>
      </div>
    );
  }

  // Build columns: only categories that have prompts
  const columns: Array<{ id: string; title: string; prompts: Prompt[] }> = [];

  // Add categories that have prompts
  mainCategories.forEach((category) => {
    if (promptsByCategory[category] && promptsByCategory[category].length > 0) {
      columns.push({
        id: category,
        title: category,
        prompts: promptsByCategory[category]
      });
    }
  });

  // Add any other categories that were not in mainCategories
  Object.keys(promptsByCategory).forEach((category) => {
    if (category !== '미분류' && !mainCategories.includes(category)) {
      columns.push({
        id: category,
        title: category,
        prompts: promptsByCategory[category]
      });
    }
  });

  // Add uncategorized if any
  if (promptsByCategory['미분류'] && promptsByCategory['미분류'].length > 0) {
    columns.push({
      id: '미분류',
      title: '❓ 미분류',
      prompts: promptsByCategory['미분류']
    });
  }

  return (
    <div className="relative">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex fixed left-4 z-10 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:scale-110 transition-all duration-200"
          style={{ top: '50vh', transform: 'translateY(-50%)' }}
          aria-label="왼쪽으로 스크롤"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex fixed right-4 z-10 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:scale-110 transition-all duration-200"
          style={{ top: '50vh', transform: 'translateY(-50%)' }}
          aria-label="오른쪽으로 스크롤"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Left Gradient Shadow */}
      {canScrollLeft && (
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-[5]" />
      )}

      {/* Right Gradient Shadow */}
      {canScrollRight && (
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-[5]" />
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto pb-4 -mx-4 px-4 md:px-0 md:mx-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        <div className="inline-flex gap-3 md:gap-4 min-w-full md:px-12">
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-72 md:w-80 flex-shrink-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">{column.title}</h3>
                <span className="px-2.5 py-1 bg-white rounded-md text-sm text-gray-600 border border-gray-200 shadow-sm">
                  {column.prompts.length}
                </span>
              </div>

              <div className="space-y-3">
                {column.prompts.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    이 카테고리에 프롬프트가 없습니다
                  </div>
                ) : (
                  column.prompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onRun={onRun}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onPromptClick={onPromptClick}
                      view="card"
                      isDeleting={deletingId === prompt.id}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Scroll Hint */}
      {columns.length > 1 && (
        <div className="md:hidden text-center mt-2 text-xs text-gray-400">
          ← 좌우로 스크롤하여 더 많은 카테고리를 확인하세요 →
        </div>
      )}
    </div>
  );
}
