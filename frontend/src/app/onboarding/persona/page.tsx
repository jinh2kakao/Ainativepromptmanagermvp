'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useJobCategories } from '@/hooks/useJobCategories';
import { Loader2 } from 'lucide-react';

const COLORS = [
    { color: 'bg-indigo-50 text-indigo-600', hover: 'group-hover:ring-indigo-200' },
    { color: 'bg-pink-50 text-pink-600', hover: 'group-hover:ring-pink-200' },
    { color: 'bg-blue-50 text-blue-600', hover: 'group-hover:ring-blue-200' },
    { color: 'bg-red-50 text-red-600', hover: 'group-hover:ring-red-200' },
    { color: 'bg-green-50 text-green-600', hover: 'group-hover:ring-green-200' },
    { color: 'bg-yellow-50 text-yellow-600', hover: 'group-hover:ring-yellow-200' },
    { color: 'bg-purple-50 text-purple-600', hover: 'group-hover:ring-purple-200' },
    { color: 'bg-orange-50 text-orange-600', hover: 'group-hover:ring-orange-200' },
];

export default function PersonaPage() {
    const router = useRouter();
    const { setSelectedCategory, setStep } = useOnboardingStore();
    const { data: categories, isLoading } = useJobCategories();

    const handleSelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setStep(3);
        router.push('/onboarding/magic');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">카테고리를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">어떤 작업을 도와드릴까요?</h2>
                <p className="text-gray-600">가장 관련 있는 분야를 선택하면 딱 맞는 템플릿을 추천해드려요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {categories?.map((persona, index) => {
                    const style = COLORS[index % COLORS.length];
                    // Dynamic Icon Resolution
                    const IconComponent = (LucideIcons as any)[persona.icon || 'HelpCircle'] || LucideIcons.HelpCircle;

                    return (
                        <motion.div
                            key={persona.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <button
                                onClick={() => persona.id && handleSelect(persona.id)}
                                className={`group w-full text-left p-6 rounded-2xl border-2 border-transparent bg-white shadow-sm ring-1 ring-gray-100 hover:shadow-xl transition-all duration-300 ${style.hover} hover:border-gray-200 relative overflow-hidden`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${style.color}`}>
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {persona.label}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {persona.description || "설명 없음"}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
