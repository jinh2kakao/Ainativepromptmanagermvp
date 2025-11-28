'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Prompt } from '@/types';
import { jobCategories, getJobConfig, assemblePrompt, extractVariables } from '@/utils/promptUtils';

interface AssistanceModeProps {
    value: Prompt['structure'];
    onChange: (structure: Prompt['structure']) => void;
    selectedJob?: string;
}

export function AssistanceMode({ value, onChange, selectedJob }: AssistanceModeProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['persona', 'asset', 'instruction', 'result'])
    );
    const [structure, setStructure] = useState<Prompt['structure']>(
        value || {
            job: '',
            persona: { profile: '', intent: '' },
            asset: { knowledgeBase: '', styleGuide: '' },
            instruction: { task: '', context: '', constraints: '' },
            result: { format: '', example: '' }
        }
    );
    const [preview, setPreview] = useState('');

    const config = getJobConfig(selectedJob || 'general');

    useEffect(() => {
        const assembled = assemblePrompt(structure);
        setPreview(assembled);
    }, [structure]);

    const handleFieldChange = (section: string, field: string, value: string) => {
        if (!structure) return;

        const newStructure = {
            ...structure,
            [section]: {
                ...(structure as any)[section],
                [field]: value
            }
        } as Prompt['structure'];
        setStructure(newStructure);
        onChange(newStructure);
    };

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const renderSection = (
        sectionKey: string,
        title: string,
        emoji: string,
        description: string,
        fields: Array<{ key: string; config: { label: string; guide: string; placeholder: string } }>
    ) => {
        const isExpanded = expandedSections.has(sectionKey);

        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full px-4 md:px-5 py-3 md:py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between hover:from-gray-100 hover:to-gray-50 transition-all min-h-[60px]"
                >
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <span className="text-xl md:text-2xl flex-shrink-0">{emoji}</span>
                        <div className="text-left flex-1 min-w-0">
                            <h3 className="text-gray-900 text-sm md:text-base">{title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                </button>

                {isExpanded && (
                    <div className="p-3 md:p-5 space-y-4 md:space-y-5 bg-white border-t border-gray-100">
                        {fields.map(({ key, config: fieldConfig }) => (
                            <div key={key}>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-0 mb-2">
                                    <label className="text-sm text-gray-900">
                                        {fieldConfig.label}
                                    </label>
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                        {fieldConfig.guide}
                                    </span>
                                </div>
                                <textarea
                                    value={(structure as any)[sectionKey][key]}
                                    onChange={(e) => handleFieldChange(sectionKey, key, e.target.value)}
                                    placeholder={fieldConfig.placeholder}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                    rows={3}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Info: Job is now selected in parent modal */}
            {selectedJob && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-green-800">
                            선택된 직무: <span className="font-medium">{selectedJob}</span>
                        </p>
                    </div>
                    <p className="text-xs text-green-600 mt-1 ml-6">
                        선택한 직무에 최적화된 P.A.I.R 프레임워크가 적용됩니다
                    </p>
                </div>
            )}

            {/* P.A.I.R Sections */}
            <div className="space-y-4">
                {renderSection(
                    'persona',
                    'Persona (페르소나)',
                    '👤',
                    'AI가 수행할 역할과 목표를 정의합니다',
                    [
                        { key: 'profile', config: config.persona.profile },
                        { key: 'intent', config: config.persona.intent }
                    ]
                )}

                {renderSection(
                    'asset',
                    'Asset (에셋)',
                    '📚',
                    '참조할 자료와 스타일 가이드를 제공합니다',
                    [
                        { key: 'knowledgeBase', config: config.asset.knowledgeBase },
                        { key: 'styleGuide', config: config.asset.styleGuide }
                    ]
                )}

                {renderSection(
                    'instruction',
                    'Instruction (지시사항)',
                    '📋',
                    '구체적인 작업 내용과 제약조건을 명시합니다',
                    [
                        { key: 'task', config: config.instruction.task },
                        { key: 'context', config: config.instruction.context },
                        { key: 'constraints', config: config.instruction.constraints }
                    ]
                )}

                {renderSection(
                    'result',
                    'Result (결과물)',
                    '🎯',
                    '원하는 출력 형식과 예시를 지정합니다',
                    [
                        { key: 'format', config: config.result.format },
                        { key: 'example', config: config.result.example }
                    ]
                )}
            </div>

            {/* Preview */}
            {preview && (
                <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm text-gray-900">미리보기 (Assembled Prompt)</h3>
                        {extractVariables(preview).length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-600">변수 감지됨:</span>
                                <div className="flex flex-wrap gap-1">
                                    {extractVariables(preview).slice(0, 3).map((variable) => (
                                        <span
                                            key={variable}
                                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                                        >
                                            {`{{${variable}}}`}
                                        </span>
                                    ))}
                                    {extractVariables(preview).length > 3 && (
                                        <span className="text-xs text-gray-500">
                                            +{extractVariables(preview).length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto">
                        <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono leading-relaxed">
                            {preview}
                        </pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 입력한 내용이 P.A.I.R 프레임워크에 따라 자동으로 조립됩니다
                    </p>
                </div>
            )}
        </div>
    );
}
