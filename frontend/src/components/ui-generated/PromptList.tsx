import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Prompt } from '@/types';
import { PromptCard } from './PromptCard';

interface PromptListProps {
  prompts: Prompt[];
  onRun: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onPromptClick?: (prompt: Prompt) => void;
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

  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}
    >
      <Masonry gutter="12px">
        {prompts.map((prompt) => (
          <div key={prompt.id} style={{ width: '100%' }}>
            <PromptCard
              prompt={prompt}
              onRun={onRun}
              onEdit={onEdit}
              onDelete={onDelete}
              onPromptClick={onPromptClick}
              view="card"
            />
          </div>
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}
