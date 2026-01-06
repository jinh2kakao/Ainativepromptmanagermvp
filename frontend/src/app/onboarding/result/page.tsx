'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowRight, Copy, Loader2, Sparkles, Bot, ListChecks, FileText, User, Calendar, Save } from 'lucide-react';
import { api } from '@/utils/axios';
import { parsePairPrompt } from '@/utils/pairParser';
import { Badge } from '@/components/ui/badge';

export default function ResultPage() {
    const router = useRouter();
    const { generatedPrompt, selectedTemplate, selectedCategory } = useOnboardingStore();
    const [isSaving, setIsSaving] = useState(false);

    const handleCopy = () => {
        if (generatedPrompt) {
            navigator.clipboard.writeText(generatedPrompt);
            toast.success('클립보드에 복사되었습니다!');
        }
    };

    const handleSave = async () => {
        if (!generatedPrompt) return;
        setIsSaving(true);
        try {
            await api.post('/api/prompts', {
                title: selectedTemplate?.title || '나만의 프롬프트',
                content: generatedPrompt,
                mode: selectedTemplate?.mode || 'simple',
                category: selectedCategory, // Use the category value from store
                is_public: false,
            });
            toast.success('프롬프트가 저장되었습니다!');
            // Set flag to prevent future redirects
            if (typeof window !== 'undefined') {
                localStorage.setItem('onboarding_completed', 'true');
            }
            // Redirect to prompt list (Projects or Dashboard)
            router.push('/prompts');
        } catch (error) {
            console.error('Save failed', error);
            // If API returns 401 even with guest logic, it might be due to strict dependencies.
            // But we can fallback or show error.
            toast.error('저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!generatedPrompt) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-gray-500 mb-4">생성된 프롬프트가 없습니다.</p>
                <Button onClick={() => router.push('/onboarding/persona')}>
                    처음으로 돌아가기
                </Button>
            </div>
        );
    }

    // Determine Hero Title
    const heroTitle = selectedTemplate?.title || selectedTemplate?.name || 'Generated Prompt';
    const heroDesc = selectedTemplate?.description;
    const heroImage = selectedTemplate?.preview_image_url;

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Header / Nav */}
            <div className="border-b bg-white sticky top-0 z-10">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <h1 className="font-semibold text-lg truncate flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Prompt Result
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            <Copy className="w-4 h-4 mr-2" />
                            복사
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            저장하고 시작하기
                        </Button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Hero Section */}
                    {heroImage ? (
                        <div className="h-64 sm:h-80 w-full bg-gray-100 relative">
                            <img
                                src={heroImage}
                                alt={heroTitle}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 sm:p-8">
                                <div className="text-white">
                                    <h1 className="text-3xl font-bold mb-2">{heroTitle}</h1>
                                    <p className="text-white/90 line-clamp-2 max-w-2xl">{heroDesc}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 flex items-end">
                            <div className="text-white">
                                <h1 className="text-3xl font-bold mb-2">{heroTitle}</h1>
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-2">
                            {selectedTemplate?.mode === 'assistance' && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI Assistance Mode
                                </Badge>
                            )}
                            {selectedTemplate?.category && (
                                <Badge variant="outline" className="text-gray-600">
                                    {selectedTemplate.category.name}
                                </Badge>
                            )}
                        </div>

                        {/* Structure Display */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                            <h2 className="text-sm font-semibold mb-4 text-purple-700 uppercase tracking-wide flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Generated Content
                            </h2>

                            {(() => {
                                // Use the utility to parse content
                                const structure = parsePairPrompt(generatedPrompt);

                                // Check if it's actually structured (has at least one field)
                                const hasStructure = structure.persona.profile || structure.instruction.task || structure.result.format;

                                if (hasStructure) {
                                    return (
                                        <div className="space-y-6">
                                            {/* Persona */}
                                            {(structure.persona.profile || structure.persona.intent) && (
                                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                        <Bot className="w-4 h-4 text-blue-500" /> Persona
                                                    </h3>
                                                    <div className="space-y-2 text-sm text-gray-700">
                                                        {structure.persona.profile && (
                                                            <div><span className="font-semibold text-gray-500 text-xs uppercase">Role:</span> {structure.persona.profile}</div>
                                                        )}
                                                        {structure.persona.intent && (
                                                            <div><span className="font-semibold text-gray-500 text-xs uppercase">Intent:</span> {structure.persona.intent}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Instruction */}
                                            {(structure.instruction.task || structure.instruction.context || structure.instruction.constraints) && (
                                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                        <ListChecks className="w-4 h-4 text-green-500" /> Instruction
                                                    </h3>
                                                    <div className="space-y-3 text-sm text-gray-700">
                                                        {structure.instruction.task && (
                                                            <div>
                                                                <div className="font-semibold text-gray-500 text-xs uppercase mb-1">Task</div>
                                                                <div className="bg-gray-50 p-2 rounded whitespace-pre-wrap">{structure.instruction.task}</div>
                                                            </div>
                                                        )}
                                                        {structure.instruction.context && (
                                                            <div>
                                                                <div className="font-semibold text-gray-500 text-xs uppercase mb-1">Context</div>
                                                                <div className="whitespace-pre-wrap">{structure.instruction.context}</div>
                                                            </div>
                                                        )}
                                                        {structure.instruction.constraints && (
                                                            <div>
                                                                <div className="font-semibold text-gray-500 text-xs uppercase mb-1">Constraints</div>
                                                                <div className="bg-red-50 text-red-800 p-2 rounded whitespace-pre-wrap text-xs">{structure.instruction.constraints}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Assets */}
                                            {(structure.asset.knowledgeBase || structure.asset.styleGuide) && (
                                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                                    <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-orange-500" /> Assets
                                                    </h3>
                                                    <div className="space-y-2 text-sm text-gray-700">
                                                        {structure.asset.knowledgeBase && (
                                                            <div><span className="font-semibold text-gray-500 text-xs uppercase">Knowledge:</span> {structure.asset.knowledgeBase}</div>
                                                        )}
                                                        {structure.asset.styleGuide && (
                                                            <div><span className="font-semibold text-gray-500 text-xs uppercase">Style:</span> {structure.asset.styleGuide}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Result */}
                                            {(structure.result.format || structure.result.example) && (
                                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                                    <h3 className="text-sm font-bold text-gray-900 mb-2">Result Format</h3>
                                                    <div className="space-y-2 text-sm text-gray-700">
                                                        {structure.result.format && (
                                                            <div><span className="font-semibold text-gray-500 text-xs uppercase">Format:</span> {structure.result.format}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Fallback to plain text if not structured
                                return (
                                    <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap">
                                        {generatedPrompt}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
