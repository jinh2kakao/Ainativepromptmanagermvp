import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronDown, LayoutTemplate } from 'lucide-react';
import { Prompt } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SimpleModeInput } from './SimpleModeInput';
import { AssistanceMode } from './AssistanceMode';
import { assemblePrompt, extractVariables } from '@/utils/promptUtils';
import { loadLastInputMode, saveLastInputMode } from '@/utils/storage';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/utils/axios';
import { AssistanceSkeleton } from './AssistanceSkeleton';
import { ProductTour } from '@/components/tour/ProductTour';
import { useJobCategories } from '@/hooks/useJobCategories';
import { MultiSelectAgents } from './MultiSelectAgents';
import { parsePairPrompt } from '@/utils/pairParser';
import { Button } from '@/components/ui/button';
import { TemplateSidebar } from '@/components/prompts/TemplateSidebar';

interface PromptFormProps {
    prompt?: Prompt | null;
    onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

interface CategoryOption {
    id: string;
    label: string;
    value: string;
    subCategories?: CategoryOption[];
}

export function PromptForm({ prompt, onSave, onCancel, isSubmitting = false }: PromptFormProps) {
    const { alert } = useAlert();
    const router = useRouter();

    // State
    // Initialize with prompt mode or 'simple' to avoid hydration mismatch
    // Load from localStorage after mount
    const [mode, setMode] = useState<'simple' | 'assistance'>(
        prompt?.mode || 'simple'
    );
    const [isPublic, setIsPublic] = useState(prompt?.isPublic ?? true);
    const [title, setTitle] = useState(prompt?.title || '');
    const [simpleContent, setSimpleContent] = useState(
        prompt?.mode === 'simple' ? prompt.content : ''
    );
    const [assistanceStructure, setAssistanceStructure] = useState<NonNullable<Prompt['structure']>>(
        prompt?.mode === 'assistance' && prompt.structure ? prompt.structure : {
            job: '',
            persona: { profile: '', intent: '' },
            asset: { knowledgeBase: '', styleGuide: '' },
            instruction: { task: '', context: '', constraints: '' },
            result: { format: '', example: '' }
        }
    );
    const [category, setCategory] = useState(prompt?.category || '');
    const [subCategory, setSubCategory] = useState(prompt?.subCategory || '');
    const [applicableAgents, setApplicableAgents] = useState<string[]>(prompt?.applicableAgents || []);

    // Categories
    const { data: jobCategories = [] } = useJobCategories();

    // Undo State
    const [previousState, setPreviousState] = useState<{
        content: string;
        structure: any;
        mode: 'simple' | 'assistance';
    } | null>(null);

    // Template State
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    // Removed old template state variables

    // Load last input mode from localStorage after mount (to avoid hydration mismatch)
    useEffect(() => {
        if (!prompt) {
            const lastMode = loadLastInputMode();
            if (lastMode !== mode) {
                setMode(lastMode);
            }
        }
    }, []); // Run only once on mount

    // Load templates logic moved to TemplateSidebar
    // Auto-apply logic removed

    const handleModeChange = (newMode: 'simple' | 'assistance') => {
        setMode(newMode);
        saveLastInputMode(newMode);
    };

    const handleAssistanceChange = (newStructure: NonNullable<Prompt['structure']>) => {
        setAssistanceStructure(newStructure);
    };

    const handleManualTemplateApply = (template: any) => {
        // Save state for Undo
        setPreviousState({
            content: simpleContent,
            structure: { ...assistanceStructure },
            mode: mode
        });

        // Apply content
        if (template.mode === 'simple') {
            if (mode !== 'simple') setMode('simple');
            setSimpleContent(template.content || '');
        } else {
            // Assistance Template
            if (mode !== 'assistance') setMode('assistance');
            if (template.content) {
                const newStructure = parsePairPrompt(template.content);
                setAssistanceStructure(newStructure);
            }
        }

        // Also apply agents if present?
        // Requirement didn't explicitly say about agents, but it's good UX.
        // Let's apply agents but maybe not agents UNDO for now to keep it simple, or backup agents too.
        // For now, let's just apply it.
        if (template.applicable_agents) {
            setApplicableAgents(template.applicable_agents);
        }

        alert('템플릿이 적용되었습니다. 원하시면 실행 취소할 수 있습니다.', '알림');
    };

    const handleUndo = () => {
        if (!previousState) return;

        setMode(previousState.mode);
        setSimpleContent(previousState.content);
        setAssistanceStructure(previousState.structure);
        setPreviousState(null);

        alert('이전 상태로 복구되었습니다.', '알림');
    };

    const handleSave = () => {
        if (!category) {
            alert('직무 대분류를 선택해주세요');
            return;
        }

        let finalTitle = title.trim();
        let content = '';
        let variables: string[] = [];
        let structure = undefined;

        if (mode === 'simple') {
            content = simpleContent;
            variables = extractVariables(simpleContent);

            // Auto-generate title if empty: use first line (first 20 chars)
            if (!finalTitle) {
                const firstLine = content.split('\n')[0].trim();
                finalTitle = firstLine.substring(0, 20) + (firstLine.length > 20 ? '...' : '');
            }
        } else {
            structure = assistanceStructure;
            content = assemblePrompt(assistanceStructure);
            variables = extractVariables(content);

            // Auto-generate title if empty: use persona.profile (Role)
            if (!finalTitle) {
                finalTitle = assistanceStructure?.persona?.profile?.trim() || '새 프롬프트';
            }
        }

        // If title is still empty (e.g. empty content), fallback
        if (!finalTitle) {
            finalTitle = '제목 없음';
        }

        const promptData: any = {
            title: finalTitle,
            mode,
            isPublic,
            category,
            subCategory,
            variables,
            content,
            structure,
            applicable_agents: applicableAgents // Send as snake_case for backend
        };

        onSave(promptData);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 id="tour-header-title" className="text-2xl font-bold text-gray-900">
                        {prompt ? '프롬프트 수정' : '새 프롬프트 작성'}
                    </h1>
                    <p className="text-gray-500 mt-1" suppressHydrationWarning>
                        {mode === 'simple'
                            ? '자유롭게 프롬프트를 작성하고 {{변수}}를 활용하세요'
                            : 'P.A.I.R 프레임워크로 구조화된 프롬프트를 생성하세요'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        variant="outline"
                        size="lg"
                        className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                        취소
                    </Button>
                    <Button
                        id="tour-save-button"
                        onClick={handleSave}
                        disabled={!category || isSubmitting}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md border-0"
                    >
                        {isSubmitting && (
                            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {prompt ? (isSubmitting ? '수정 중...' : '수정 완료') : (isSubmitting ? '생성 중...' : '생성하기')}
                    </Button>
                </div>
            </div>

            {/* Undo Banner if available - Moved here as requested */}
            {/* But wait, request said: "템플릿 적용 되돌리기 영역은 프롬프트 작성과 작성모드 선택 UI 사이로 이동" */}
            {/* "Prompt Creation" (Input) vs "Mode Selection" (in Settings Card). So between cards. */}

            <div className="flex flex-col lg:flex-row gap-8" suppressHydrationWarning>
                {/* Left Column: Settings & Input */}
                <div className="flex-1 min-w-0 space-y-6" suppressHydrationWarning>

                    {/* Basic Settings Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                프롬프트 제목 <span className="text-gray-400 font-normal">(선택)</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예: 블로그 포스트 생성기 (비워두면 자동 생성)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    직무 대분류 <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="tour-category-select"
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setSubCategory('');
                                        // [QA FIX] Clear content immediately when switching major category
                                        if (mode === 'simple') {
                                            setSimpleContent('');
                                        } else {
                                            setAssistanceStructure({
                                                job: '',
                                                persona: { profile: '', intent: '' },
                                                asset: { knowledgeBase: '', styleGuide: '' },
                                                instruction: { task: '', context: '', constraints: '' },
                                                result: { format: '', example: '' }
                                            });
                                        }
                                        setApplicableAgents([]); // Also clear agents
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">선택하세요</option>
                                    {jobCategories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    직무 소분류
                                </label>
                                <select
                                    value={subCategory}
                                    onChange={(e) => setSubCategory(e.target.value)}
                                    disabled={!category}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                >
                                    <option value="">선택하세요</option>
                                    {category && jobCategories.find(c => c.value === category)?.subCategories?.map((sub) => (
                                        <option key={sub.value} value={sub.value}>{sub.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Template Selection UI Removed */}

                        {/* Agents Selection */}
                        <div className="pt-2">
                            <MultiSelectAgents selectedAgents={applicableAgents} onChange={setApplicableAgents} />
                        </div>

                        {/* Mode & Visibility */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">작성 모드</label>
                                <div id="tour-mode-switch" className="flex bg-gray-100 p-1 rounded-lg" suppressHydrationWarning>
                                    <button
                                        onClick={() => handleModeChange('simple')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'simple' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        📝 일반 모드
                                    </button>
                                    <button
                                        onClick={() => handleModeChange('assistance')}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'assistance' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        🤖 어시스턴스
                                    </button>
                                </div>
                            </div>

                            <div className="sm:w-48">
                                <label className="block text-sm font-medium text-gray-700 mb-2">공개 설정</label>
                                <button
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`w-full py-2 px-4 rounded-lg border-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${isPublic
                                        ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {isPublic ? (
                                        <><span>🌐</span> 전체 공개</>
                                    ) : (
                                        <><span>🔒</span> 나만 보기</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile: Buttons Row (Template Lookup + Undo) */}
                    <div className="lg:hidden flex gap-2">
                        <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1 flex gap-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
                                    <LayoutTemplate className="w-4 h-4" />
                                    템플릿 조회 및 적용
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[400px] max-h-[80vh] flex flex-col p-0">
                                <DialogHeader className="p-4 pb-2">
                                    <DialogTitle>템플릿 선택</DialogTitle>
                                </DialogHeader>
                                <div className="flex-1 overflow-y-auto p-4 pt-0">
                                    <TemplateSidebar
                                        selectedCategory={category}
                                        selectedSubCategory={subCategory}
                                        currentMode={mode}
                                        onApplyTemplate={(t) => {
                                            handleManualTemplateApply(t);
                                            setIsTemplateModalOpen(false);
                                        }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Mobile Undo Button */}
                        {previousState && (
                            <Button
                                variant="outline"
                                onClick={handleUndo}
                                className="flex-1 border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                            >
                                템플릿 적용 취소
                            </Button>
                        )}
                    </div>

                    {/* Desktop: Undo Button ONLY (Between cards) */}
                    {previousState && (
                        <div className="hidden lg:flex justify-end">
                            <Button
                                variant="outline"
                                onClick={handleUndo}
                                className="border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                            >
                                템플릿 적용 취소
                            </Button>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        {/* ... (existing imports) */}

                        {/* ... (inside PromptForm component) */}

                        <div id="tour-input-area" suppressHydrationWarning>
                            {mode === 'simple' ? (
                                <SimpleModeInput value={simpleContent} onChange={setSimpleContent} />
                            ) : (
                                <div className="relative min-h-[200px]">
                                    <AssistanceMode
                                        value={assistanceStructure}
                                        onChange={handleAssistanceChange}
                                        selectedJob={subCategory}
                                        templateSchema={[]}
                                        availableTemplates={[]}
                                        selectedTemplateId={''}
                                        onTemplateSelect={() => { }}
                                        hideHeader={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Template Sidebar (Fixed Width) */}
                <div className="hidden lg:block w-[320px] shrink-0 border-l pl-6 min-h-[600px]">
                    <div className="sticky top-24 h-[calc(100vh-150px)]">
                        <TemplateSidebar
                            selectedCategory={category}
                            selectedSubCategory={subCategory}
                            currentMode={mode}
                            onApplyTemplate={handleManualTemplateApply}
                        />
                    </div>
                </div>
            </div>
            <ProductTour />
        </div>
    );
}
