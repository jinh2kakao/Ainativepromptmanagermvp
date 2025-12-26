import { Copy, Edit, Trash2, Play, Globe, Lock } from 'lucide-react';
import { Prompt } from '@/types';
import { toast } from 'sonner';
import { assemblePrompt } from '@/utils/promptUtils';
import { useAlert } from '@/components/providers/AlertProvider';
import { ScoreBadge } from './ScoreBadge';

interface PromptCardProps {
  prompt: Prompt;
  onRun: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onPromptClick?: (prompt: Prompt) => void;
  view?: 'list' | 'card';
  isDeleting?: boolean;
}

export function PromptCard({ prompt, onRun, onEdit, onDelete, onPromptClick, view = 'list', isDeleting = false }: PromptCardProps) {
  const { confirm } = useAlert();
  const handleQuickCopy = async () => {
    if (prompt.variables.length > 0) {
      // Has variables - open run modal
      onRun(prompt);
    } else {
      // No variables - direct copy
      let textToCopy = prompt.content;

      // FIX: If assistance mode and content is empty, assemble it
      if (prompt.mode === 'assistance' && (!textToCopy || textToCopy.trim() === '')) {
        if (prompt.structure) {
          textToCopy = assemblePrompt(prompt.structure);
        }
      }

      if (!textToCopy || textToCopy.trim() === '') {
        toast.error('프롬프트 내용이 비어있습니다');
        return;
      }

      // Try modern clipboard API first, fallback to legacy method
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast.success('복사되었습니다!');
      } catch (error) {
        // Fallback: use legacy execCommand method (silently)
        try {
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (successful) {
            toast.success('복사되었습니다!');
          } else {
            toast.error('복사 실패: 브라우저가 지원하지 않습니다');
          }
        } catch (fallbackError) {
          toast.error('복사 실패: 브라우저가 지원하지 않습니다');
        }
      }
    }
  };

  const formattedDate = new Date(prompt.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (view === 'card') {
    return (
      <div
        className="group bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
        onClick={() => onPromptClick?.(prompt)}
      >
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 mb-2 text-sm md:text-base truncate">{prompt.title}</h3>
            <div className="flex items-center gap-1.5 md:gap-2 text-xs flex-wrap">
              <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-gray-100 text-gray-600 rounded-md">
                {prompt.mode === 'simple' ? '📝 일반' : '🤖 어시스턴스'}
              </span>
              {prompt.isPublic ? (
                <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-green-50 text-green-700 rounded-md flex items-center gap-1 border border-green-200">
                  <Globe className="w-3 h-3" />
                  <span className="hidden sm:inline">공개</span>
                </span>
              ) : (
                <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-gray-100 text-gray-600 rounded-md flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span className="hidden sm:inline">비공개</span>
                </span>
              )}
              {prompt.subCategory && (
                <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-200 max-w-[100px] truncate">
                  {prompt.subCategory}
                </span>
              )}
              <ScoreBadge score={prompt.latest_score} size="sm" showTooltip={false} />
              {prompt.variables.length > 0 && (
                <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  {prompt.variables.length} 변수
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2.5 md:p-3 mb-2 md:mb-3 max-h-20 md:max-h-24 overflow-hidden border border-gray-100">
          <p className="text-xs md:text-sm text-gray-600 line-clamp-3">{prompt.content}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
            <span className="text-gray-400">📅</span>
            {formattedDate}
          </span>
          {/* Mobile: Always visible / Desktop: Hover */}
          <div className="flex items-center gap-1 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleQuickCopy}
              className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={prompt.variables.length > 0 ? 'Run with variables' : 'Copy'}
            >
              {prompt.variables.length > 0 ? (
                <Play className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onEdit(prompt)}
              className="p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(prompt.id);
              }}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className="group bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onClick={() => onPromptClick?.(prompt)}
    >
      <div className="flex items-start justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-2.5 flex-wrap">
            <h3 className="text-gray-900 text-sm md:text-base">{prompt.title}</h3>
            <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-gray-100 text-gray-600 rounded-md text-xs flex-shrink-0">
              {prompt.mode === 'simple' ? '📝 일반' : '🤖 어시스턴스'}
            </span>
            {prompt.isPublic ? (
              <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-green-50 text-green-700 rounded-md text-xs flex-shrink-0 flex items-center gap-1 border border-green-200">
                <Globe className="w-3 h-3" />
                <span className="hidden sm:inline">공개</span>
              </span>
            ) : (
              <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-gray-100 text-gray-600 rounded-md text-xs flex-shrink-0 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">비공개</span>
              </span>
            )}
            {prompt.subCategory && (
              <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-purple-50 text-purple-700 rounded-md text-xs flex-shrink-0 border border-purple-200 max-w-[120px] truncate">
                {prompt.subCategory}
              </span>
            )}
            <ScoreBadge score={prompt.latest_score} size="sm" showTooltip={false} />
            {prompt.variables.length > 0 && (
              <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-blue-50 text-blue-700 rounded-md text-xs flex-shrink-0 border border-blue-200">
                {prompt.variables.length} 변수
              </span>
            )}
          </div>

          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2 md:mb-3">{prompt.content}</p>

          <div className="flex items-center gap-3 md:gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-gray-400">📅</span>
              <span className="text-[10px] md:text-xs">{formattedDate}</span>
            </span>
            {prompt.variables.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                {prompt.variables.slice(0, 3).map((variable) => (
                  <span key={variable} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-200 text-[10px]">
                    {`{{${variable}}}`}
                  </span>
                ))}
                {prompt.variables.length > 3 && (
                  <span className="text-gray-400 text-[10px]">+{prompt.variables.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Always visible / Desktop: Hover */}
        <div className="flex items-center gap-1 flex-shrink-0 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleQuickCopy}
            className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={prompt.variables.length > 0 ? 'Run with variables' : 'Copy'}
          >
            {prompt.variables.length > 0 ? (
              <Play className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(prompt)}
            className="p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (await confirm('Are you sure you want to delete this prompt?', 'Delete Prompt', { variant: 'destructive' })) {
                onDelete(prompt.id);
              }
            }}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
