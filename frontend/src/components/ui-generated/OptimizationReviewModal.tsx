
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Check, X, FilePlus } from 'lucide-react';
import { toast } from 'sonner';
import { diffWords } from 'diff';

// Helper to render diff
const renderDiff = (oldText: string, newText: string) => {
    const diff = diffWords(oldText, newText);

    return (
        <span>
            {diff.map((part, index) => {
                const color = part.added ? 'bg-green-200 text-green-800' :
                    part.removed ? 'hidden' : ''; // Hide removed parts in the new view, or use 'bg-red-200 line-through' to show them

                // If it's removed, we don't show it in the "Optimized" clean view (or we could show it strikethrough). 
                // The requirement was "highlight changes", usually implying showing what's new.
                // Let's hide removed parts to keep the "Optimized" view clean, but highlight added parts.
                if (part.removed) return null;

                return (
                    <span key={index} className={color}>
                        {part.value}
                    </span>
                );
            })}
        </span>
    );
};

interface OptimizationReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalContent: string;
    optimizedContent: string;
    details?: any; // Reasoning from DSPy
    onApply: () => Promise<void>;
    onSaveAsNew: () => Promise<void>;
    isApplying: boolean;
    isLoading?: boolean;
}

export function OptimizationReviewModal({
    isOpen,
    onClose,
    originalContent,
    optimizedContent,
    details,
    onApply,
    onSaveAsNew,
    isApplying,
    isLoading = false
}: OptimizationReviewModalProps) {
    const [activeTab, setActiveTab] = useState('diff');

    const handleApply = async () => {
        try {
            await onApply();
            toast.success('최적화된 내용이 적용되었습니다.');
            onClose();
        } catch (error) {
            toast.error('적용 실패');
        }
    };

    const handleSaveAsNew = async () => {
        try {
            await onSaveAsNew();
            toast.success('새 프롬프트로 저장되었습니다.');
            onClose();
        } catch (error) {
            toast.error('저장 실패');
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw]">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        ✨ AI 최적화 결과 검토
                    </DialogTitle>
                    <DialogDescription>
                        AI가 제안한 최적화 결과입니다. 변경 사항을 검토하고 적용 여부를 결정하세요.
                    </DialogDescription>
                    {details?.recommended_agents && details.recommended_agents.length > 0 && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">추천 에이전트:</span>
                            <div className="flex flex-wrap gap-2">
                                {details.recommended_agents.map((agent: string) => (
                                    <span key={agent} className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-semibold">
                                        {agent}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 pt-2">
                    <Tabs defaultValue="diff" className="h-full flex flex-col" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                            <TabsTrigger value="diff" disabled={isLoading}>변경 사항 비교 (Diff)</TabsTrigger>
                            <TabsTrigger value="reasoning" disabled={isLoading}>수정 사유 (Reasoning)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="diff" className="flex-1 mt-4 min-h-0 border rounded-md flex flex-col overflow-hidden h-full relative">
                            {/* Header - Fixed */}
                            <div className="grid grid-cols-2 divide-x divide-gray-200 border-b bg-gray-50 flex-none z-10">
                                <div className="p-3 text-sm font-semibold flex justify-between">
                                    <span>원본 (Original)</span>
                                </div>
                                <div className="p-3 bg-green-50/30 text-sm font-semibold text-green-800 flex justify-between">
                                    <span>최적화본 (Optimized)</span>
                                </div>
                            </div>

                            {/* Content - Scrollable (Synchronized) */}
                            <div className="flex-1 overflow-hidden relative">
                                <ScrollArea className="h-full w-full">
                                    {isLoading ? (
                                        <div className="grid grid-cols-2 min-h-full divide-x divide-gray-200">
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 min-h-full divide-x divide-gray-200">
                                            {/* Original Content */}
                                            <div className="p-4 bg-red-50/10">
                                                <pre className="whitespace-pre-wrap text-sm text-gray-600 font-mono leading-relaxed">
                                                    {originalContent}
                                                </pre>
                                            </div>

                                            {/* Optimized Content */}
                                            <div className="p-4 bg-green-50/10">
                                                <div className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                                                    {renderDiff(originalContent, optimizedContent)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="reasoning" className="flex-1 mt-4 p-4 border rounded-md bg-gray-50 h-full overflow-auto">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-4" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none">
                                    <h3 className="font-bold text-lg mb-4">AI Analysis</h3>
                                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                                        {details?.reasoning ? (
                                            <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                                                {details.reasoning}
                                            </div>
                                        ) : (
                                            <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                                                {details ? JSON.stringify(details, null, 2) : "상세 분석 내용이 없습니다."}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-gray-50 flex justify-between items-center sm:justify-between">
                    <Button variant="outline" onClick={onClose} disabled={isApplying}>
                        <X className="w-4 h-4 mr-2" />
                        닫기 (Discard)
                    </Button>

                    <div className="flex gap-2">
                        {/* Future: Save As New */}
                        {/* <Button variant="secondary" onClick={handleSaveAsNew} disabled={isApplying}>
               <FilePlus className="w-4 h-4 mr-2" />
               새로 저장
             </Button> */}

                        <Button onClick={handleApply} disabled={isApplying} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                            {isApplying ? (
                                <>Applying...</>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    적용하기 (Overwrite)
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
