import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronDown } from 'lucide-react';
import { Prompt } from '@/types';
import { SimpleModeInput } from './SimpleModeInput';
import { AssistanceMode } from './AssistanceMode';
import { assemblePrompt, extractVariables } from '@/utils/promptUtils';
import { loadLastInputMode, saveLastInputMode } from '@/utils/storage';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/utils/axios';
import { AssistanceSkeleton } from './AssistanceSkeleton';
import { ProductTour } from '@/components/tour/ProductTour';
import { jobCategories } from '@/utils/jobCategories';
import { MultiSelectAgents } from './MultiSelectAgents';
import { parsePairPrompt } from '@/utils/pairParser';

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

    // Template State
    const [isTemplateLoading, setIsTemplateLoading] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [templateSchema, setTemplateSchema] = useState<any[]>([]);

    // Load last input mode from localStorage after mount (to avoid hydration mismatch)
    useEffect(() => {
        if (!prompt) {
            const lastMode = loadLastInputMode();
            if (lastMode !== mode) {
                setMode(lastMode);
            }
        }
    }, []); // Run only once on mount

    // Load templates when subCategory changes
    // Load templates when subCategory changes
    useEffect(() => {
        const fetchTemplates = async () => {
            if (!subCategory) {
                setAvailableTemplates([]);
                return;
            }

            setIsTemplateLoading(true);
            try {
                // Determine which mode to fetch. 
                // Note: Admin might want to see all? Usually users want templates for current mode.
                const response = await api.get(`/api/templates/?subCategory=${encodeURIComponent(subCategory)}&mode=${mode}`);
                const templates = response.data;
                setAvailableTemplates(templates);

                // Auto-select first template if none selected or if switching categories
                if (templates.length > 0) {
                    // Default logic: find 'is_default' or take first
                    const defaultTemplate = templates.find((t: any) => t.is_default) || templates[0];
                    setSelectedTemplateId(defaultTemplate.id);

                    // Auto-fill content Logic:
                    // 1. New Prompt (!prompt) -> Always Auto-fill
                    // 2. Editing Prompt (prompt exists) -> Only if Category changed (user interaction)
                    const isCategoryChanged = !prompt || (prompt.subCategory !== subCategory);

                    if (isCategoryChanged) {
                        try {
                            if (mode === 'simple') {
                                // Simple Mode: Set Content String
                                setSimpleContent(defaultTemplate.content || '');
                            } else {
                                // Assistance Mode: Parse as PAIR Structure (Text -> Object)
                                const newStructure = parsePairPrompt(defaultTemplate.content || '');
                                setAssistanceStructure(newStructure);
                            }

                            // Auto-fill applicable agents (for both modes)
                            if (defaultTemplate.applicable_agents) {
                                setApplicableAgents(defaultTemplate.applicable_agents);
                            }

                            // UX Feedback for auto-application
                            // alert('기본 템플릿이 적용되었습니다', '알림'); // User requested removal

                        } catch (e) {
                            console.error("Failed to parse template content", e);
                        }
                    }
                } else {
                    setSelectedTemplateId('');
                    setTemplateSchema([]);

                    // [QA FIX] Clear content if no templates found for this category/mode
                    // Only do this if category changed (user interaction), to avoid wiping content on initial load if something is weird
                    const isCategoryChanged = !prompt || (prompt.subCategory !== subCategory);
                    if (isCategoryChanged) {
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
                    }
                }
            } catch (error) {
                console.error("Failed to fetch templates", error);
            } finally {
                setIsTemplateLoading(false);
            }
        };

        fetchTemplates();
    }, [subCategory, mode]);

    const handleModeChange = (newMode: 'simple' | 'assistance') => {
        setMode(newMode);
        saveLastInputMode(newMode);
    };

    const handleAssistanceChange = (newStructure: NonNullable<Prompt['structure']>) => {
        setAssistanceStructure(newStructure);
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        const template = availableTemplates.find(t => t.id === templateId);

        if (!template) return;

        if (mode === 'simple') {
            // Simple Mode: Update content
            setSimpleContent(template.content || '');
        } else {
            // Assistance Mode: Update structure
            if (template.content) {
                const newStructure = parsePairPrompt(template.content);
                setAssistanceStructure(newStructure);
            }
        }

        if (template.applicable_agents) {
            setApplicableAgents(template.applicable_agents);
        }
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
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        취소
                    </button>
                    <button
                        id="tour-save-button"
                        onClick={handleSave}
                        disabled={!category || isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {prompt ? (isSubmitting ? '수정 중...' : '수정 완료') : (isSubmitting ? '생성 중...' : '생성하기')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" suppressHydrationWarning>
                {/* Left Column: Settings & Input */}
                <div className={`space-y-6 ${mode === 'assistance' ? 'lg:col-span-7' : 'lg:col-span-12'}`} suppressHydrationWarning>

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

                        {/* Template Selection UI (Consistent with AssistanceMode) */}
                        {category && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-green-600" />
                                            <p className="text-sm text-green-800">
                                                선택된 직무: <span className="font-medium">{jobCategories.find(c => c.value === category)?.label || category}</span>
                                            </p>
                                        </div>
                                        <p className="text-xs text-green-600 mt-1 ml-6">
                                            선택한 직무에 최적화된 템플릿이 적용됩니다
                                        </p>
                                    </div>

                                    {/* Template Selector inside Green Box */}
                                    {availableTemplates.length > 0 && (
                                        <div className="flex items-center gap-2 min-w-[200px]">
                                            <select
                                                value={selectedTemplateId}
                                                onChange={(e) => handleTemplateSelect(e.target.value)}
                                                className="w-full px-3 py-1.5 bg-white/80 border border-green-300 rounded-md text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                {availableTemplates.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.title} {t.is_default ? '(기본)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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

                    {/* Input Area */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        {/* ... (existing imports) */}

                        {/* ... (inside PromptForm component) */}

                        <div id="tour-input-area" suppressHydrationWarning>
                            {mode === 'simple' ? (
                                <SimpleModeInput value={simpleContent} onChange={setSimpleContent} />
                            ) : (
                                <div className="relative min-h-[200px]">
                                    {isTemplateLoading ? (
                                        <AssistanceSkeleton />
                                    ) : (
                                        <AssistanceMode
                                            value={assistanceStructure}
                                            onChange={handleAssistanceChange}
                                            selectedJob={subCategory}
                                            templateSchema={templateSchema}
                                            availableTemplates={availableTemplates}
                                            selectedTemplateId={selectedTemplateId}
                                            onTemplateSelect={handleTemplateSelect}
                                            hideHeader={true}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Preview (Assistance Mode Only) */}
                {mode === 'assistance' && (
                    <div className="lg:col-span-5 hidden lg:block">
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-xl">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <span>👁️</span> 미리보기
                                </h3>
                                <div className="prose prose-invert max-w-none text-sm opacity-90 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                                    {assemblePrompt(assistanceStructure) || '작성된 내용이 여기에 표시됩니다...'}
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                                <h4 className="font-semibold mb-2">💡 작성 팁</h4>
                                <ul className="list-disc list-inside space-y-1 opacity-80">
                                    <li>구체적인 페르소나를 설정하세요.</li>
                                    <li>명확한 제약 조건을 제시하면 결과가 좋아집니다.</li>
                                    <li>원하는 출력 형식을 예시로 보여주세요.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ProductTour />
        </div>
    );
}
