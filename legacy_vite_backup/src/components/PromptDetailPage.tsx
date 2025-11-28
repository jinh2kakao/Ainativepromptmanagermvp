import { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Lock, Share2, Copy, Edit, Trash2, Play } from 'lucide-react';
import { Prompt } from '../types';
import { toast } from 'sonner@2.0.3';
import { assemblePrompt } from '../utils/promptUtils';

interface PromptDetailPageProps {
  prompt: Prompt;
  currentUserId: string; // Current user ID (for access control)
  onBack: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onRun: (prompt: Prompt) => void;
  onTogglePublic: (id: string, isPublic: boolean) => void;
}

export function PromptDetailPage({
  prompt,
  currentUserId,
  onBack,
  onEdit,
  onDelete,
  onRun,
  onTogglePublic
}: PromptDetailPageProps) {
  const [isPublic, setIsPublic] = useState(prompt.isPublic);
  const isOwner = prompt.ownerId === currentUserId;
  const canView = isPublic || isOwner;

  useEffect(() => {
    setIsPublic(prompt.isPublic);
  }, [prompt.isPublic]);

  const handleTogglePublic = () => {
    const newValue = !isPublic;
    setIsPublic(newValue);
    onTogglePublic(prompt.id, newValue);
    toast.success(newValue ? '프롬프트가 공개되었습니다' : '프롬프트가 비공개되었습니다');
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success('링크가 복사되었습니다!');
    } catch (error) {
      // Fallback
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success('링크가 복사되었습니다!');
        } else {
          toast.error('링크 복사 실패');
        }
      } catch (fallbackError) {
        toast.error('링크 복사 실패');
      }
    }
  };

  const handleCopyPrompt = async () => {
    let textToCopy = prompt.content;
    
    if (prompt.mode === 'assistance' && (!textToCopy || textToCopy.trim() === '')) {
      if (prompt.structure) {
        textToCopy = assemblePrompt(prompt.structure);
      }
    }
    
    if (!textToCopy || textToCopy.trim() === '') {
      toast.error('프롬프트 내용이 비어있습니다');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('복사되었습니다!');
    } catch (error) {
      // Fallback
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
          toast.error('복사 실패');
        }
      } catch (fallbackError) {
        toast.error('복사 실패');
      }
    }
  };

  const handleDelete = () => {
    if (confirm('정말 이 프롬프트를 삭제하시겠습니까?')) {
      onDelete(prompt.id);
      onBack();
    }
  };

  const formattedDate = new Date(prompt.updatedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button */}
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="뒤로 가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Copy Prompt Button - Most Prominent */}
              <button
                onClick={handleCopyPrompt}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm shadow-sm min-h-[40px]"
                title="프롬프트 복사"
              >
                <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">복사</span>
              </button>
              
              {/* Public/Private Toggle (Owner Only) */}
              {isOwner && (
                <button
                  onClick={handleTogglePublic}
                  className={`px-2.5 md:px-3 py-2 rounded-lg flex items-center gap-1.5 md:gap-2 text-xs md:text-sm transition-all duration-200 border min-h-[40px] md:min-h-0 ${
                    isPublic
                      ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                  }`}
                  title={isPublic ? '공개' : '비공개'}
                >
                  {isPublic ? (
                    <>
                      <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">공개</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">비공개</span>
                    </>
                  )}
                </button>
              )}

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="공유하기"
              >
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Edit Button (Owner Only) */}
              {isOwner && (
                <button
                  onClick={() => onEdit(prompt)}
                  className="p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="수정"
                >
                  <Edit className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}

              {/* Delete Button (Owner Only) */}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Title & Meta */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-gray-900 mb-3 md:mb-4 text-xl md:text-2xl lg:text-3xl">{prompt.title}</h1>
          
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap text-xs md:text-sm">
            <span className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
              {prompt.mode === 'simple' ? '📝 일반 모드' : '🤖 어시스턴스 모드'}
            </span>
            
            {prompt.category && (
              <span className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                {prompt.category}
              </span>
            )}
            
            {prompt.subCategory && (
              <span className="px-2 md:px-3 py-1 md:py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 max-w-[150px] md:max-w-none truncate">
                {prompt.subCategory}
              </span>
            )}
            
            {prompt.variables.length > 0 && (
              <span className="px-2 md:px-3 py-1 md:py-1.5 bg-orange-50 text-orange-700 rounded-lg border border-orange-200">
                {prompt.variables.length} 변수
              </span>
            )}
            
            <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg flex items-center gap-1 md:gap-1.5 border ${
              isPublic 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {isPublic ? (
                <>
                  <Globe className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span>공개</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span>비공개</span>
                </>
              )}
            </span>
          </div>
          
          <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 flex items-center gap-1.5">
            <span className="text-gray-400">📅</span>
            최종 수정: {formattedDate}
          </p>
        </div>

        {/* Prompt Content */}
        <div className="relative">
          {!canView && (
            // Access Denied Overlay
            <div className="absolute inset-0 backdrop-blur-md bg-white/30 z-10 flex items-center justify-center rounded-lg">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 mb-2">비공개 프롬프트입니다</h3>
                <p className="text-gray-600 text-sm">
                  이 프롬프트는 작성자만 볼 수 있습니다.
                </p>
              </div>
            </div>
          )}

          <div className={`bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm ${!canView ? 'blur-sm' : ''}`}>
            {/* Variables Section */}
            {prompt.variables.length > 0 && (
              <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-100">
                <h3 className="text-sm text-gray-700 mb-2 md:mb-3">변수</h3>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {prompt.variables.map((variable) => (
                    <span
                      key={variable}
                      className="px-2.5 md:px-3 py-1.5 md:py-2 bg-blue-50 text-blue-700 rounded-lg text-xs md:text-sm border border-blue-200"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-xs md:text-sm text-gray-800 bg-gray-50 p-3 md:p-5 rounded-lg border border-gray-100 overflow-x-auto">
                {prompt.content || (prompt.structure ? assemblePrompt(prompt.structure) : '')}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canView && (
          <div className="mt-4 md:mt-6 flex items-center gap-2 md:gap-3">
            {prompt.variables.length > 0 ? (
              <button
                onClick={() => onRun(prompt)}
                className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm md:text-base min-h-[48px]"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">변수 입력하고 실행</span>
                <span className="sm:hidden">실행</span>
              </button>
            ) : (
              <button
                onClick={handleCopyPrompt}
                className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm md:text-base min-h-[48px]"
              >
                <Copy className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">프롬프트 복사</span>
                <span className="sm:hidden">복사</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
