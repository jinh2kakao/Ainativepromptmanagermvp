import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Globe, Lock, Share2, Copy, Edit, Trash2, Play, Wand2 } from 'lucide-react';
import { Prompt } from '@/types';
import { toast } from 'sonner';
import { assemblePrompt } from '@/utils/promptUtils';
import { useAlert } from '@/components/providers/AlertProvider';
import { ScoreBadge } from './ScoreBadge';
import { OptimizationReviewModal } from './OptimizationReviewModal';
import { optimizePrompt, fetchPromptAnalysis, evaluatePrompt } from '@/features/prompts/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EvaluationResultModal } from './EvaluationResultModal';
import { Button } from '@/components/ui/button';

interface PromptDetailPageProps {
  prompt: Prompt;
  currentUserId: string | null;
  onBack: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onRun: (prompt: Prompt) => void;
  onTogglePublic: (id: string, isPublic: boolean) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
  onUpdateContent?: (content: string, applicableAgents?: string[]) => Promise<void>;
}

export function PromptDetailPage({
  prompt,
  currentUserId,
  onBack,
  onEdit,
  onDelete,
  onRun,
  onTogglePublic,
  isDeleting = false,
  isUpdating = false,
  onUpdateContent
}: PromptDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient(); // Get QueryClient
  const { confirm } = useAlert();
  const [isPublic, setIsPublic] = useState(prompt.isPublic);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    original: string;
    optimized: string;
    details: any;
  } | null>(null);
  const [isApplyingOptimization, setIsApplyingOptimization] = useState(false);
  const [isScoreUpdating, setIsScoreUpdating] = useState(false); // State for score calculation
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{ score: number; evaluation: any } | null>(null);

  const isOwner = currentUserId ? String(prompt.ownerId) === String(currentUserId) : false;
  const canView = true; // Or implement specific view logic


  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluation = async () => {
    try {
      setIsEvaluating(true);
      setShowEvaluationModal(true); // Open immediately

      // Force UI render before heavy op
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await evaluatePrompt(prompt.id);

      setEvaluationResult({ score: result.score, evaluation: result.evaluation });
      setIsEvaluating(false); // Stop loading, show results

      toast.success(`평가 완료! 점수: ${result.score}점`);
      queryClient.invalidateQueries({ queryKey: ['prompts', prompt.id] });
      router.refresh();
    } catch (error) {
      setIsEvaluating(false);
      // Keep modal open on error? Or close? 
      // User might want to see error state in modal, but for now let's close or keep loading?
      // Closing is better UX for "failed request" unless we have error UI in modal.
      setShowEvaluationModal(false);
      toast.error('평가 요청 실패');
    }
  };

  const handleOptimization = async () => {
    if (!isOwner) return;

    try {
      setIsOptimizing(true);
      setShowReviewModal(true); // Open immediately

      // Initialize with original content so diff viewer has something
      setAnalysisData({
        original: prompt.content,
        optimized: '',
        details: null
      });

      // Force UI render
      await new Promise(resolve => setTimeout(resolve, 100));

      // 1. Trigger Optimization
      await optimizePrompt(prompt.id);

      // 2. Poll for Completion
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setIsOptimizing(false);
          setShowReviewModal(false);
          toast.warning('최적화 시간이 초과되었습니다. 나중에 다시 확인해주세요.');
          return;
        }

        try {
          const analysis = await fetchPromptAnalysis(prompt.id);

          if ((analysis.status === 'APPROVED' || analysis.status === 'COMPLETED') && analysis.optimization && analysis.optimization.content) {
            setAnalysisData({
              original: prompt.content,
              optimized: analysis.optimization.content,
              details: analysis.optimization.details
            });
            setIsOptimizing(false); // Stop loading
            toast.success('최적화가 완료되었습니다! 결과를 확인하세요.');
            router.refresh();
          } else if (analysis.status === 'FAILED') {
            setIsOptimizing(false);
            setShowReviewModal(false);
            toast.error('최적화 과정에서 오류가 발생했습니다.');
          } else {
            // PENDING or UNKNOWN
            attempts++;
            setTimeout(poll, 2000);
          }
        } catch (e) {
          attempts++;
          setTimeout(poll, 2000);
        }
      };

      setTimeout(poll, 2000);

    } catch (error) {
      setIsOptimizing(false);
      setShowReviewModal(false);
      toast.error('최적화 요청 실패');
    }
  };

  const handleApplyOptimization = async () => {
    if (!onUpdateContent || !analysisData) return;
    try {
      setIsApplyingOptimization(true);
      await onUpdateContent(analysisData.optimized, analysisData.details?.recommended_agents);

      setIsApplyingOptimization(false);
      setShowReviewModal(false);
      toast.success('최적화된 내용이 적용되었습니다. 점수 재계산 중...');

      // Start Polling locally
      setIsScoreUpdating(true);
      const maxDuration = 15000; // 15 seconds timeout

      const checkScore = setInterval(() => {
        // Invalidate query to fetch fresh data
        queryClient.invalidateQueries({ queryKey: ['prompts', prompt.id] });
        router.refresh(); // Important: Refresh server props
      }, 2000);

      // Cleanup polling after timeout
      setTimeout(() => {
        clearInterval(checkScore);
        setIsScoreUpdating(false); // Stop loading indicator after timeout even if score didn't change (maybe it stayed same)
      }, maxDuration);

    } catch (e) {
      setIsApplyingOptimization(false);
      setIsScoreUpdating(false);
      toast.error('적용 중 오류가 발생했습니다.');
    }
  };

  // ... rest of code ....

  // REMOVE DEBUG BOX manually in instructions below or usage.
  // Actually, I need to output the *whole* changed block or use replacement.
  // I will replace lines 1-174 (header + handlers) with the new version containing router logic.
  // And I will explicitly seek out the debug box at the end and remove it.

  // Watch for score changes to stop loading
  useEffect(() => {
    if (isScoreUpdating) {
      // If score changed or we just want to stop after some time?
      // Ideally we compare with the "startScore" but we don't have it in dependencies easily without refs.
      // Let's just trust the timeout or user interaction. 
      // Actually, if prompt.latest_score changes, we can stop?
      // But what if the score stays the same? Then we spin for 15s. That's acceptable.
      // Or we can check if updated_at changed significantly?
    }
  }, [prompt.latest_score, isScoreUpdating]);

  // ... rest of code ...

  // Inside return ...
  {/* Score Badge */ }
  <ScoreBadge score={prompt.latest_score} loading={isScoreUpdating} />

  const handleSaveAsNew = async () => {
    // Future scope: Implement "Save As New"
    toast.info('새로 저장 기능은 준비 중입니다.');
    // Logic would be: Create new prompt with optimized content.
  };

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

  const handleDelete = async () => {
    if (await confirm('정말 이 프롬프트를 삭제하시겠습니까?', '삭제 확인', { variant: 'destructive' })) {
      onDelete(prompt.id);
    }
  };

  const formattedDate = new Date(prompt.updatedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Navigation & Actions Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          {/* Top Row: Back & Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Public/Private Toggle (Owner Only) */}
              {isOwner && (
                <button
                  onClick={handleTogglePublic}
                  disabled={isUpdating}
                  className={`p-2 rounded-lg transition-all duration-200 border ${isPublic
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isPublic ? '공개' : '비공개'}
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-100"
                title="공유하기"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Edit Button (Owner Only) */}
              {isOwner && (
                <button
                  onClick={() => onEdit(prompt)}
                  className="p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-100"
                  title="수정"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {/* Delete Button (Owner Only) */}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="삭제"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Title & Meta */}
          <div>
            <h1 className="text-gray-900 mb-3 md:mb-4 text-2xl md:text-3xl font-bold">{prompt.title}</h1>

            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200 text-xs font-medium">
                {prompt.mode === 'simple' ? '📝 일반 모드' : '🤖 어시스턴스 모드'}
              </span>

              {/* Score Badge */}
              <ScoreBadge score={prompt.latest_score} loading={isScoreUpdating} />

              {prompt.category && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-xs font-medium">
                  {prompt.category}
                </span>
              )}

              {prompt.subCategory && (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-200 text-xs font-medium">
                  {prompt.subCategory}
                </span>
              )}

              <span className="text-gray-400 text-xs ml-auto">
                최종 수정: {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="relative">
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
            {/* Applicable Agents Section */}
            {prompt.applicableAgents && prompt.applicableAgents.length > 0 && (
              <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-100">
                <h3 className="text-sm text-gray-700 mb-2 md:mb-3">적용 가능한 AI 에이전트</h3>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {prompt.applicableAgents.map((agent) => (
                    <span
                      key={agent}
                      className="px-2.5 md:px-3 py-1.5 md:py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs md:text-sm border border-indigo-200 font-medium"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Variables Section */}
            {prompt.variables.length > 0 && (
              <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-100">
                <h3 className="text-sm text-gray-700 mb-2 md:mb-3">변수</h3>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {prompt.variables.map((variable) => (
                    <span key={variable} className="px-2.5 md:px-3 py-1.5 md:py-2 bg-blue-50 text-blue-700 rounded-lg text-xs md:text-sm border border-blue-200">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-xs md:text-sm text-gray-800 bg-gray-50 p-3 md:p-5 rounded-lg border border-gray-100 overflow-x-auto">
                {prompt.content || (prompt.structure ? assemblePrompt(prompt.structure) : '') || (
                  <span className="text-gray-400 italic">내용이 없습니다.</span>
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canView && (
          <div className="mt-4 md:mt-6 flex items-center gap-2 md:gap-3">
            {prompt.variables.length > 0 ? (
              <Button
                onClick={() => onRun(prompt)}
                size="lg"
                className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0 shadow-md hover:shadow-lg"
              >
                <Play />
                <span className="hidden sm:inline">변수 입력하고 실행</span>
                <span className="sm:hidden">실행</span>
              </Button>
            ) : (
              <>
                {/* Evaluation Button (Moved here for separation) */}
                <Button
                  onClick={handleEvaluation}
                  disabled={isEvaluating}
                  variant="outline"
                  size="lg"
                  className="flex-1 md:flex-none text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <div className="w-3.5 h-3.5 font-bold border rounded-full flex items-center justify-center text-[9px] border-current">A</div>
                  <span className="hidden sm:inline">설계 평가</span>
                  <span className="sm:hidden">평가</span>
                </Button>

                <Button
                  onClick={handleCopyPrompt}
                  variant="outline"
                  size="lg"
                  className="flex-1 md:flex-none text-gray-700 border-gray-200 hover:bg-gray-50"
                >
                  <Copy />
                  <span className="hidden sm:inline">프롬프트 복사</span>
                  <span className="sm:hidden">복사</span>
                </Button>

                {/* Optimized Button with Tooltip */}
                {isOwner && (
                  (() => {
                    const isHighQuality = (prompt.latest_score || 0) >= 85;

                    return (
                      <div className={isHighQuality ? "cursor-not-allowed" : ""}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0}> {/* Span wrapper for disabled button tooltip trigger */}
                                <Button
                                  onClick={handleOptimization}
                                  disabled={isOptimizing || isHighQuality}
                                  size="lg"
                                  className={`flex-1 md:flex-none bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-md hover:shadow-lg ${isHighQuality ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:opacity-90'
                                    }`}
                                >
                                  <Wand2 />
                                  <span className="hidden sm:inline">AI 최적화</span>
                                  <span className="sm:hidden">최적화</span>
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {isHighQuality && (
                              <TooltipContent>
                                <p>최적화가 필요하지 않은 프롬프트입니다.</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    );
                  })()
                )}
              </>
            )}
          </div >
        )}

        {/* Modal */}
        <OptimizationReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          originalContent={analysisData?.original || prompt.content}
          optimizedContent={analysisData?.optimized || ''}
          details={analysisData?.details || null}
          onApply={handleApplyOptimization}
          onSaveAsNew={handleSaveAsNew}
          isApplying={isApplyingOptimization}
          isLoading={isOptimizing}
        />

        <EvaluationResultModal
          isOpen={showEvaluationModal}
          onClose={() => setShowEvaluationModal(false)}
          evaluation={evaluationResult?.evaluation || null}
          score={evaluationResult?.score || 0}
          isLoading={isEvaluating}
        />
      </div >
    </div >
  );
}
