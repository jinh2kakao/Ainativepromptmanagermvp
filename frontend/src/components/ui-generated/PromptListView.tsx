import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Prompt } from '@/types';
import { PromptList } from './PromptList';
import { KanbanBoard } from './KanbanBoard';
// import { jobCategories } from '@/utils/jobCategories'; // Removed static import

interface CategoryOption {
  id: string;
  label: string;
  value: string;
  subCategories?: CategoryOption[];
}

interface PromptListViewProps {
  prompts: Prompt[];
  categories: CategoryOption[]; // Added categories prop
  viewMode: 'list' | 'kanban';
  onPromptClick: (prompt: Prompt) => void;
  onRun: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export function PromptListView({
  prompts,
  categories, // Added categories prop
  viewMode,
  onPromptClick,
  onRun,
  onEdit,
  onDelete,
  deletingId
}: PromptListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');

  // Get subcategories based on selected category
  const subCategories = useMemo(() => {
    if (!selectedCategory || selectedCategory === '') return [];
    const categoryData = categories.find((cat) => cat.value === selectedCategory);
    return categoryData?.subCategories || [];
  }, [selectedCategory, categories]); // Added categories dependency

  // Reset subcategory when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory('');
  };

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = prompt.title.toLowerCase().includes(query);
        const matchesContent = prompt.content.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent) return false;
      }

      // Category filter
      if (selectedCategory && selectedCategory !== '') {
        if (prompt.category !== selectedCategory) return false;
      }

      // SubCategory filter
      if (selectedSubCategory && selectedSubCategory !== '') {
        if (prompt.subCategory !== selectedSubCategory) return false;
      }

      return true;
    });
  }, [prompts, searchQuery, selectedCategory, selectedSubCategory]);

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6 shadow-sm">
        {/* Mobile: Stack Layout / Desktop: Row */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-4">
          {/* Search Input - Full Width on Mobile */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목/내용 검색"
              className="w-full pl-9 md:pl-10 pr-10 py-2.5 md:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base min-h-[44px] md:min-h-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters: Mobile 50/50 Row, Desktop Single Row */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 md:col-span-2">
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all hover:border-gray-400 text-sm md:text-base min-h-[44px] md:min-h-0"
              >
                <option value="">대분류</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SubCategory Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                disabled={!selectedCategory || subCategories.length === 0}
                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:border-gray-400 disabled:hover:border-gray-300 text-sm md:text-base min-h-[44px] md:min-h-0"
              >
                <option value="">소분류</option>
                {subCategories.map((subCat) => (
                  <option key={subCat.value} value={subCat.value}>
                    {subCat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedCategory || selectedSubCategory) && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs md:text-sm text-gray-500 mr-1">활성 필터:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs md:text-sm border border-blue-200">
                <Search className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="max-w-[100px] md:max-w-none truncate">"{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs md:text-sm border border-purple-200">
                <span className="max-w-[100px] md:max-w-none truncate">
                  {categories.find((c) => c.value === selectedCategory)?.label}
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubCategory('');
                  }}
                  className="ml-1 hover:bg-purple-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
              </span>
            )}
            {selectedSubCategory && (
              <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-green-50 text-green-700 rounded-full text-xs md:text-sm border border-green-200">
                <span className="max-w-[100px] md:max-w-none truncate">
                  {subCategories.find((s) => s.value === selectedSubCategory)?.label}
                </span>
                <button
                  onClick={() => setSelectedSubCategory('')}
                  className="ml-1 hover:bg-green-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedSubCategory('');
              }}
              className="ml-1 md:ml-2 text-xs md:text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
            >
              초기화
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className={`${(searchQuery || selectedCategory || selectedSubCategory) ? 'mt-2 md:mt-3' : 'mt-3 md:mt-4'} text-xs md:text-sm text-gray-500`}>
          <span className="font-medium text-gray-700">{filteredPrompts.length}</span>개의 프롬프트
          {filteredPrompts.length !== prompts.length && (
            <span className="text-gray-400"> (전체 {prompts.length}개)</span>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <PromptList
          prompts={filteredPrompts}
          onRun={onRun}
          onEdit={onEdit}
          onDelete={onDelete}
          onPromptClick={onPromptClick}
        />
      ) : (
        <KanbanBoard
          prompts={filteredPrompts}
          onRun={onRun}
          onEdit={onEdit}
          onDelete={onDelete}
          onPromptClick={onPromptClick}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}
