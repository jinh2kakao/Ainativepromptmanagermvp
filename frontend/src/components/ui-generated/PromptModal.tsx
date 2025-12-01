'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Prompt } from '@/types';
import { SimpleModeInput } from './SimpleModeInput';
import { AssistanceMode } from './AssistanceMode';
import { assemblePrompt, extractVariables, jobCategories } from '@/utils/promptUtils';
import { loadLastInputMode, saveLastInputMode } from '@/utils/storage';

interface PromptModalProps {
    prompt?: Prompt | null;
    onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onClose: () => void;
}

export function PromptModal({ prompt, onSave, onClose }: PromptModalProps) {
    // Initialize state only on client side to avoid hydration mismatch if accessing localStorage
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<'simple' | 'assistance'>('simple');

    useEffect(() => {
        setMounted(true);
        setMode(prompt?.mode || loadLastInputMode());
    }, [prompt]);

    const [title, setTitle] = useState(prompt?.title || '');
    const [simpleContent, setSimpleContent] = useState(
        prompt?.mode === 'simple' ? prompt.content : ''
    );
    const [assistanceStructure, setAssistanceStructure] = useState<Prompt['structure']>(
        prompt?.mode === 'assistance' ? prompt.structure : {
            job: '',
            persona: { profile: '', intent: '' },
            asset: { knowledgeBase: '', styleGuide: '' },
            instruction: { task: '', context: '', constraints: '' },
            result: { format: '', example: '' }
        }
    );
    const [category, setCategory] = useState(prompt?.category || '');
    const [subCategory, setSubCategory] = useState(prompt?.subCategory || '');

    const handleModeChange = (newMode: 'simple' | 'assistance') => {
        setMode(newMode);
        saveLastInputMode(newMode);
    };

    const handleAssistanceChange = (structure: Prompt['structure']) => {
        setAssistanceStructure(structure);
    };

    const handleSave = () => {
        // Validate category selection (required)
        if (!category) {
            alert('대분류를 선택해주세요');
            return;
        }
        // Sub-category is now optional

        let finalTitle = title.trim();
        let content = '';
        let variables: string[] = [];
        let structure: Prompt['structure'] | undefined;

        if (mode === 'simple') {
            content = simpleContent;
            variables = extractVariables(content);

            // Auto-generate title if empty: use first line (first 20 chars)
            if (!finalTitle) {
                const firstLine = content.split('\n')[0].trim();
                finalTitle = firstLine.substring(0, 20) + (firstLine.length > 20 ? '...' : '');
            }
        } else {
            // Assistance Mode Validation: Check if Profile is filled
            const hasProfile = (assistanceStructure?.persona?.profile || '').trim().length > 0;

            if (!hasProfile) {
                alert('Profile (페르소나) 내용을 입력해주세요');
                return;
            }

            content = assemblePrompt(assistanceStructure);
            variables = extractVariables(content);
            structure = assistanceStructure;

            // Auto-generate title if empty: use persona.profile (Role)
            if (!finalTitle) {
                finalTitle = assistanceStructure?.persona?.profile?.trim() || '새 프롬프트';
            }
        }

        if (!content.trim()) {
            alert('프롬프트 내용을 입력해주세요');
            return;
        }

        onSave({
            title: finalTitle,
            mode,
            content,
            structure,
            variables,
            category,
            subCategory,
            isPublic: prompt?.isPublic ?? false,
            ownerId: prompt?.ownerId
        });
    };

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center md:p-4 z-50 animate-in fade-in duration-200">
            {/* Mobile: Full Screen / Desktop: Centered Modal */}
            <div className="bg-white md:rounded-xl shadow-2xl w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-base md:text-lg">✨</span>
                        </div>
                        <h2 className="text-gray-900 text-base md:text-lg">
                            {prompt ? '프롬프트 수정' : '새 프롬프트'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-1.5 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-4">
                    <div className="space-y-4 md:space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">
                                프롬프트 제목 <span className="text-xs text-gray-500">(비워두면 자동 생성)</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예: 블로그 포스트 생성기"
                                className="w-full px-3 md:px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base min-h-[44px] md:min-h-0"
                            />
                        </div>

                        {/* Common Job Category Selection */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 md:p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-base md:text-lg">💼</span>
                                <label className="text-sm text-gray-900">
                                    직무 선택 <span className="text-xs text-gray-500">(대분류 필수, 소분류 선택)</span>
                                </label>
                            </div>

                            {/* Mobile: Stack / Desktop: Row */}
                            <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
                                {/* Category (대분류) */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1.5">
                                        대분류 <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => {
                                            setCategory(e.target.value);
                                            setSubCategory(''); // Reset subcategory
                                        }}
                                        className="w-full px-3 py-2.5 md:py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px] md:min-h-0"
                                    >
                                        <option value="">직군을 선택하세요</option>
                                        {jobCategories.map((cat) => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* SubCategory (소분류) */}
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1.5">
                                        소분류 <span className="text-gray-400">(선택)</span>
                                    </label>
                                    <select
                                        value={subCategory}
                                        onChange={(e) => setSubCategory(e.target.value)}
                                        disabled={!category}
                                        className="w-full px-3 py-2.5 md:py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[44px] md:min-h-0"
                                    >
                                        <option value="">세부 직무를 선택하세요</option>
                                        {category && jobCategories.find(c => c.value === category)?.subCategories?.map((sub) => (
                                            <option key={sub.value} value={sub.value}>{sub.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {!category && (
                                <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                    <span>⚠️</span>
                                    저장하려면 대분류를 선택해주세요
                                </p>
                            )}
                        </div>

                        {/* Mode Switcher */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">프롬프트 작성 모드</label>
                            {/* Mobile: Full Width / Desktop: Fit Width */}
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-full md:w-fit shadow-inner">
                                <button
                                    onClick={() => handleModeChange('simple')}
                                    className={`flex-1 md:flex-none px-3 md:px-4 py-2.5 md:py-2 rounded-md flex items-center justify-center gap-2 transition-all duration-200 text-sm min-h-[44px] md:min-h-0 ${mode === 'simple'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    📝 일반모드
                                </button>
                                <button
                                    onClick={() => handleModeChange('assistance')}
                                    className={`flex-1 md:flex-none px-3 md:px-4 py-2.5 md:py-2 rounded-md flex items-center justify-center gap-2 transition-all duration-200 text-sm min-h-[44px] md:min-h-0 ${mode === 'assistance'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    🤖 어시스턴스
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {mode === 'simple'
                                    ? '자유롭게 프롬프트를 작성하고 {{변수}}를 활용하세요'
                                    : 'P.A.I.R 프레임워크로 구조화된 프롬프트를 생성하세요'}
                            </p>
                        </div>

                        {/* Input Area */}
                        {mode === 'simple' ? (
                            <SimpleModeInput value={simpleContent} onChange={setSimpleContent} />
                        ) : (
                            <AssistanceMode
                                value={assistanceStructure}
                                onChange={handleAssistanceChange}
                                selectedJob={subCategory}
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:rounded-b-xl">
                    {/* Warning Message */}
                    <div className="text-xs text-gray-500 order-2 md:order-1">
                        {!category && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg border border-orange-200">
                                <span>⚠️</span>
                                <span className="hidden md:inline">대분류 직무 선택이 필요합니다</span>
                                <span className="md:hidden">대분류 선택 필요</span>
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 md:gap-3 order-1 md:order-2">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-4 md:px-5 py-2.5 text-gray-700 hover:bg-gray-200 bg-white border border-gray-300 rounded-lg transition-all duration-200 text-sm md:text-base min-h-[44px]"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!category}
                            className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none text-sm md:text-base min-h-[44px]"
                        >
                            {prompt ? '수정 완료' : '생성하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
