'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Star } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { TemplateCard } from '@/components/dashboard/TemplateCard';
import { api } from '@/utils/axios';

interface PromptTemplate {
    id: string;
    title: string;
    name?: string;
    description: string;
    content: string;
    usage_count?: number;
    mode: string;
    preview_image_url?: string;
    category?: { name: string };
    applicable_agents?: string[];
}

export default function MagicPage() {
    const router = useRouter();
    const { selectedCategory, setSelectedTemplateId, setSelectedTemplate, setGeneratedPrompt } = useOnboardingStore();
    // Simplified mode state: only 'selection' or 'generating' (transitional)
    const [isNavigating, setIsNavigating] = useState(false);

    // Fetch Templates (Assistance Mode)
    const { data: templates, isLoading } = useQuery({
        queryKey: ['onboarding-templates', selectedCategory, 'assistance'],
        queryFn: async () => {
            if (!selectedCategory) return [];
            // [FIX] Use api instance with correct base URL instead of relative fetch
            const res = await api.get<PromptTemplate[]>(`/api/onboarding/templates/?category=${selectedCategory}&mode=assistance`);
            return res.data;
        },
        enabled: !!selectedCategory,
    });

    useEffect(() => {
        if (!selectedCategory) {
            router.replace('/onboarding/persona');
        }
    }, [selectedCategory, router]);

    const handleSelectTemplate = async (template: PromptTemplate) => {
        setIsNavigating(true);

        // [MODIFIED] Direct Direct: No input form. 
        // Just set the rich content and go to result.
        setSelectedTemplateId(template.id);
        setSelectedTemplate(template);
        setGeneratedPrompt(template.content);

        // Small artificial delay for "Magic" feeling (optional, can be removed for speed)
        await new Promise(resolve => setTimeout(resolve, 500));

        router.push('/onboarding/result');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (isLoading || !selectedCategory) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isNavigating) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full" />
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">전문가 템플릿을 불러오는 중...</h3>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key="selection"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">어떤 작업을 도와드릴까요?</h2>
                        <p className="text-gray-500">전문가가 설계한 최적의 프롬프트 템플릿을 선택하세요.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates?.map((template, idx) => (
                            <motion.div key={template.id} variants={itemVariants} className="h-full">
                                <TemplateCard
                                    template={{
                                        ...template,
                                        // Ensure usage_count is present (API might return it as 0 if null)
                                        usage_count: template.usage_count || 0,
                                        // Ensure category object matches what Card expects if API structure differs
                                        category: template.category ? { name: template.category.name } : undefined
                                    }}
                                    onClick={() => handleSelectTemplate(template)}
                                    className="h-full"
                                />
                            </motion.div>
                        ))}

                        {/* Empty State / Fallback */}
                        {(!templates || templates.length === 0) && (
                            <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p>준비된 템플릿이 없습니다.</p>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-12">
                        <button onClick={() => router.back()} className="px-6 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors text-sm font-medium">
                            ← 이전 단계로
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
